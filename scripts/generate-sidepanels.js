#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const EXT_ROOT = path.resolve(__dirname, '..', 'extensions');

const quickActions = {
  'cipher-shield':          ['Encrypt', 'Decrypt', 'Key Gen', 'Hash'],
  'code-sovereign':         ['Analyze', 'Format', 'Debug', 'Review'],
  'contract-forge':         ['Draft', 'Verify', 'Comply', 'Audit'],
  'creative-muse':          ['Ideas', 'Draft', 'Storm', 'Brief'],
  'data-alchemist':         ['Transform', 'Clean', 'Merge', 'Export'],
  'data-oracle':            ['Query', 'Predict', 'Pattern', 'Report'],
  'edge-runner':            ['Scan', 'Speed', 'Security', 'Optimize'],
  'knowledge-cartographer': ['Map', 'Links', 'Graph', 'Export'],
  'logic-prover':           ['Prove', 'Check', 'Validate', 'Run'],
  'marketplace-hub':        ['Browse', 'Install', 'Update', 'Catalog'],
  'memory-palace':          ['Store', 'Recall', 'Search', 'Clear'],
  'organism-dashboard':     ['Status', 'Health', 'Metrics', 'Diagnose'],
  'pattern-forge':          ['Detect', 'Match', 'Train', 'Export'],
  'polyglot-oracle':        ['Translate', 'Detect', 'Compare', 'Dict'],
  'protocol-bridge':        ['Send', 'Route', 'Queue', 'Test'],
  'register':               ['Register', 'Lookup', 'Validate', 'Export'],
  'research-nexus':         ['Search', 'Cite', 'Biblio', 'Summarize'],
  'screen-commander':       ['Capture', 'Record', 'Annotate', 'Export'],
  'sentinel-watch':         ['Scan', 'Alerts', 'Status', 'Audit'],
  'social-cortex':          ['Feed', 'Mentions', 'Sentiment', 'Summary'],
  'sovereign-mind':         ['Fuse', 'Route', 'Score', 'Think'],
  'sovereign-nexus':        ['Connect', 'Sync', 'Query', 'Topology'],
  'spread-scanner':         ['Scan', 'Analyze', 'Outliers', 'Chart'],
  'video-architect':        ['Analyze', 'Frames', 'Timeline', 'Meta'],
  'vision-weaver':          ['Process', 'Detect', 'OCR', 'Colors'],
  'voice-forge':            ['Transcribe', 'Speak', 'Analyze', 'Mix']
};

function generateSidepanel(slug, extName, actions) {
  const btns = actions.map(a => `      <button class="qa-btn" data-action="${a}">${a}</button>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${extName} — Side Panel</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;overflow:hidden}
  body{background:#0a0a1a;color:#c8c8e0;font-family:'Segoe UI',system-ui,sans-serif;font-size:13px;display:flex;flex-direction:column}
  .header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #1e1e3a;background:#0e0e24;flex-shrink:0}
  .phi{font-size:20px;color:#6c63ff;font-weight:700}
  .header h1{font-size:15px;font-weight:600;color:#e0e0ff;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .status{display:flex;align-items:center;gap:5px;font-size:10px;color:#888}
  .status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 4px #22c55e80}
  .quick-bar{display:flex;gap:4px;padding:8px 16px;border-bottom:1px solid #1e1e3a;flex-shrink:0}
  .qa-btn{flex:1;background:#12122a;color:#c8c8e0;border:1px solid #2a2a4a;border-radius:6px;padding:6px 2px;font-size:11px;cursor:pointer;font-weight:500;transition:all .15s;text-align:center;white-space:nowrap}
  .qa-btn:hover{border-color:#6c63ff;color:#6c63ff;background:#6c63ff11}
  .chat{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px}
  .msg{max-width:85%;padding:8px 12px;border-radius:12px;font-size:12px;line-height:1.5;word-wrap:break-word}
  .msg.user{align-self:flex-end;background:#6c63ff;color:#fff;border-bottom-right-radius:4px}
  .msg.ai{align-self:flex-start;background:#1a1a36;color:#c8c8e0;border:1px solid #2a2a4a;border-bottom-left-radius:4px}
  .input-bar{display:flex;gap:6px;padding:10px 16px;border-top:1px solid #1e1e3a;background:#0e0e24;flex-shrink:0}
  .msg-input{flex:1;background:#0a0a1a;border:1px solid #2a2a4a;color:#e0e0ff;padding:8px 12px;border-radius:8px;font-size:12px;outline:none;font-family:inherit}
  .msg-input:focus{border-color:#6c63ff}
  .msg-input::placeholder{color:#444}
  .send-btn{background:#6c63ff;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-weight:600;cursor:pointer;font-size:12px;transition:background .15s}
  .send-btn:hover{background:#5a52e0}
  .footer{display:flex;justify-content:space-between;padding:6px 16px;font-size:10px;color:#555;border-top:1px solid #1e1e3a;background:#0a0a14;flex-shrink:0}
</style>
</head>
<body>
  <div class="header">
    <span class="phi">\u03c6</span>
    <h1>${extName}</h1>
    <div class="status"><span class="status-dot" id="statusDot"></span><span id="statusText">Online</span></div>
  </div>
  <div class="quick-bar">
${btns}
  </div>
  <div class="chat" id="chat"></div>
  <div class="input-bar">
    <input class="msg-input" id="msgInput" placeholder="Ask ${extName}\u2026" />
    <button class="send-btn" id="sendBtn">Send</button>
  </div>
  <div class="footer">
    <span id="hbFooter">HB: 0 | Last: \u2014</span>
    <span>v1.0.0</span>
  </div>
<script>
(function(){
  var chat=document.getElementById('chat');
  var msgInput=document.getElementById('msgInput');
  var sendBtn=document.getElementById('sendBtn');
  var statusDot=document.getElementById('statusDot');
  var statusText=document.getElementById('statusText');
  var hbFooter=document.getElementById('hbFooter');
  var heartbeats=0;

  function scrollBottom(){chat.scrollTop=chat.scrollHeight;}

  function addMsg(text,role){
    var div=document.createElement('div');
    div.className='msg '+role;
    div.textContent=text;
    chat.appendChild(div);
    scrollBottom();
  }

  function sendMessage(text){
    if(!text)return;
    addMsg(text,'user');
    try{
      chrome.runtime.sendMessage({type:'sidePanel',command:text},function(resp){
        if(chrome.runtime.lastError){
          addMsg('Error: '+chrome.runtime.lastError.message,'ai');
          return;
        }
        if(resp&&resp.result){addMsg(resp.result,'ai');}
        else if(resp){addMsg(JSON.stringify(resp),'ai');}
        else{addMsg('Command sent \u2014 processing.','ai');}
      });
    }catch(e){addMsg('Error: '+e.message,'ai');}
  }

  sendBtn.addEventListener('click',function(){
    var v=msgInput.value.trim();
    if(v){sendMessage(v);msgInput.value='';}
  });
  msgInput.addEventListener('keydown',function(e){
    if(e.key==='Enter'){
      var v=msgInput.value.trim();
      if(v){sendMessage(v);msgInput.value='';}
    }
  });

  document.querySelectorAll('.qa-btn').forEach(function(btn){
    btn.addEventListener('click',function(){sendMessage(btn.dataset.action);});
  });

  function heartbeat(){
    try{
      chrome.runtime.sendMessage({type:'heartbeat'},function(resp){
        if(chrome.runtime.lastError)return setOffline();
        heartbeats++;
        var now=new Date().toLocaleTimeString('en-US',{hour12:false});
        hbFooter.textContent='HB: '+heartbeats+' | Last: '+now;
        statusDot.style.background='#22c55e';
        statusDot.style.boxShadow='0 0 4px #22c55e80';
        statusText.textContent='Online';
      });
    }catch(e){setOffline();}
  }
  function setOffline(){
    statusDot.style.background='#f87171';
    statusDot.style.boxShadow='0 0 4px #f8717180';
    statusText.textContent='Offline';
  }

  addMsg('${extName} AI ready. Type a message or use a quick action.','ai');
  heartbeat();
  setInterval(heartbeat,5000);
})();
</script>
</body>
</html>
`;
}

const dirs = fs.readdirSync(EXT_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows');

let created = 0;
for (const dir of dirs) {
  const slug = dir.name;
  const manifestPath = path.join(EXT_ROOT, slug, 'manifest.json');
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const extName = manifest.name;
  const actions = quickActions[slug];
  if (!actions) {
    console.log(`  ⚠ No quick actions defined for ${slug} — skipping`);
    continue;
  }

  const html = generateSidepanel(slug, extName, actions);
  fs.writeFileSync(path.join(EXT_ROOT, slug, 'sidepanel.html'), html);
  created++;
  console.log(`  ✓ ${slug}/sidepanel.html`);
}

console.log(`\n  ${created} sidepanel.html files created.`);
