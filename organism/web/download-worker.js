/**
 * Download Worker — Sovereign Zip Builder
 *
 * Web Worker that builds real .zip files from extension source code
 * entirely in the browser. No server. No GitHub. No dependencies.
 *
 * Uses a minimal pure-JS zip implementation (STORE method, no compression
 * needed — extensions are tiny). Generates Blob URLs that trigger real
 * file downloads when clicked.
 *
 * This worker runs permanently on the user's device. It builds all 25
 * extension zips on startup, posts blob URLs back to the main thread,
 * and keeps a heartbeat alive at 873ms.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'build', extensions: [...] }
 *   Worker → Main: { type: 'zip-ready', slug, blob, filename }
 *   Worker → Main: { type: 'all-ready', count }
 *   Worker → Main: { type: 'heartbeat', beat, status }
 */

'use strict';

var PHI = 1.618033988749895;
var HEARTBEAT = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Minimal ZIP builder — pure JS, zero dependencies
   Implements PKZIP STORE (no compression) which is perfect for
   small text files like manifest.json, background.js, content.js
   ════════════════════════════════════════════════════════════════ */

function crc32(buf) {
  var table = new Uint32Array(256);
  for (var i = 0; i < 256; i++) {
    var c = i;
    for (var j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  var crc = 0xFFFFFFFF;
  for (var k = 0; k < buf.length; k++) {
    crc = table[(crc ^ buf[k]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function u16le(v) {
  return [v & 0xFF, (v >>> 8) & 0xFF];
}

function u32le(v) {
  return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF];
}

function buildZip(files) {
  // files = [ { name: 'manifest.json', data: Uint8Array }, ... ]
  var localHeaders = [];
  var centralHeaders = [];
  var offset = 0;

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var nameBytes = strToBytes(file.name);
    var data = file.data instanceof Uint8Array ? file.data : strToBytes(String(file.data));
    var crc = crc32(data);
    var size = data.length;

    // Local file header (30 bytes + name + data)
    var localParts = [
      0x50, 0x4B, 0x03, 0x04,   // signature
      0x14, 0x00,                 // version needed (2.0)
      0x00, 0x00,                 // flags
      0x00, 0x00,                 // compression (STORE)
      0x00, 0x00,                 // mod time
      0x00, 0x00                  // mod date
    ];
    localParts = localParts.concat(u32le(crc));
    localParts = localParts.concat(u32le(size));   // compressed size
    localParts = localParts.concat(u32le(size));   // uncompressed size
    localParts = localParts.concat(u16le(nameBytes.length));
    localParts = localParts.concat([0x00, 0x00]);  // extra field length

    var local = new Uint8Array(localParts.length + nameBytes.length + data.length);
    local.set(localParts, 0);
    local.set(nameBytes, localParts.length);
    local.set(data, localParts.length + nameBytes.length);

    localHeaders.push(local);

    // Central directory header (46 bytes + name)
    var centralParts = [
      0x50, 0x4B, 0x01, 0x02,   // signature
      0x14, 0x00,                 // version made by
      0x14, 0x00,                 // version needed
      0x00, 0x00,                 // flags
      0x00, 0x00,                 // compression (STORE)
      0x00, 0x00,                 // mod time
      0x00, 0x00                  // mod date
    ];
    centralParts = centralParts.concat(u32le(crc));
    centralParts = centralParts.concat(u32le(size));
    centralParts = centralParts.concat(u32le(size));
    centralParts = centralParts.concat(u16le(nameBytes.length));
    centralParts = centralParts.concat([0x00, 0x00]);  // extra field length
    centralParts = centralParts.concat([0x00, 0x00]);  // comment length
    centralParts = centralParts.concat([0x00, 0x00]);  // disk number
    centralParts = centralParts.concat([0x00, 0x00]);  // internal attrs
    centralParts = centralParts.concat([0x00, 0x00, 0x00, 0x00]); // external attrs
    centralParts = centralParts.concat(u32le(offset)); // local header offset

    var central = new Uint8Array(centralParts.length + nameBytes.length);
    central.set(centralParts, 0);
    central.set(nameBytes, centralParts.length);

    centralHeaders.push(central);
    offset += local.length;
  }

  var centralOffset = offset;
  var centralSize = 0;
  for (var ci = 0; ci < centralHeaders.length; ci++) {
    centralSize += centralHeaders[ci].length;
  }

  // End of central directory (22 bytes)
  var eocdParts = [
    0x50, 0x4B, 0x05, 0x06,
    0x00, 0x00,                   // disk number
    0x00, 0x00                    // disk with central dir
  ];
  eocdParts = eocdParts.concat(u16le(files.length));
  eocdParts = eocdParts.concat(u16le(files.length));
  eocdParts = eocdParts.concat(u32le(centralSize));
  eocdParts = eocdParts.concat(u32le(centralOffset));
  eocdParts = eocdParts.concat([0x00, 0x00]); // comment length

  var eocd = new Uint8Array(eocdParts);

  // Concatenate all parts
  var totalSize = offset + centralSize + eocd.length;
  var result = new Uint8Array(totalSize);
  var pos = 0;
  for (var li = 0; li < localHeaders.length; li++) {
    result.set(localHeaders[li], pos);
    pos += localHeaders[li].length;
  }
  for (var cj = 0; cj < centralHeaders.length; cj++) {
    result.set(centralHeaders[cj], pos);
    pos += centralHeaders[cj].length;
  }
  result.set(eocd, pos);
  return result;
}

/* ════════════════════════════════════════════════════════════════
   Build pipeline — packages each extension into a zip
   ════════════════════════════════════════════════════════════════ */

function buildExtensionZip(ext) {
  // ext = { slug, name, manifest, background, content, icons }
  var files = [];

  // manifest.json
  if (ext.manifest) {
    files.push({ name: 'manifest.json', data: strToBytes(ext.manifest) });
  }

  // background.js / engine.js
  if (ext.background) {
    var bgName = ext.platform === 'windows' ? 'engine.js' : 'background.js';
    files.push({ name: bgName, data: strToBytes(ext.background) });
  }

  // content.js / interface.js
  if (ext.content) {
    var ctName = ext.platform === 'windows' ? 'interface.js' : 'content.js';
    files.push({ name: ctName, data: strToBytes(ext.content) });
  }

  // icons
  if (ext.icons) {
    for (var i = 0; i < ext.icons.length; i++) {
      var icon = ext.icons[i];
      if (icon.data) {
        files.push({ name: icon.name, data: icon.data });
      }
    }
  }

  return buildZip(files);
}

function buildAllZip(individualZips) {
  var files = [];
  for (var i = 0; i < individualZips.length; i++) {
    files.push({ name: individualZips[i].filename, data: individualZips[i].data });
  }
  return buildZip(files);
}

/* ════════════════════════════════════════════════════════════════
   Message handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;

  switch (msg.type) {
    case 'build': {
      var extensions = msg.extensions || [];
      var builtZips = [];

      for (var i = 0; i < extensions.length; i++) {
        var ext = extensions[i];
        try {
          var zipData = buildExtensionZip(ext);
          var filename = ext.slug + '.zip';
          builtZips.push({ filename: filename, data: zipData, slug: ext.slug });

          self.postMessage({
            type: 'zip-ready',
            slug: ext.slug,
            name: ext.name,
            filename: filename,
            blob: new Blob([zipData], { type: 'application/zip' }),
          });
        } catch (err) {
          self.postMessage({
            type: 'zip-error',
            slug: ext.slug,
            error: err.message,
          });
        }
      }

      // Build all-in-one bundle
      if (builtZips.length > 0) {
        try {
          var allData = buildAllZip(builtZips);
          self.postMessage({
            type: 'zip-ready',
            slug: 'all-extensions',
            name: 'All Extensions',
            filename: 'all-extensions.zip',
            blob: new Blob([allData], { type: 'application/zip' }),
          });
        } catch (err) {
          self.postMessage({ type: 'zip-error', slug: 'all-extensions', error: err.message });
        }
      }

      self.postMessage({ type: 'all-ready', count: builtZips.length });
      break;
    }

    case 'stop':
      running = false;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      self.postMessage({ type: 'stopped' });
      break;

    case 'getState':
      self.postMessage({ type: 'state', beatCount: beatCount, running: running });
      break;
  }
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat — runs permanently at 873ms
   ════════════════════════════════════════════════════════════════ */

var heartbeatInterval = setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    beat: beatCount,
    phi: PHI,
    heartbeatMs: HEARTBEAT,
    timestamp: Date.now(),
    status: 'alive',
  });
}, HEARTBEAT);
