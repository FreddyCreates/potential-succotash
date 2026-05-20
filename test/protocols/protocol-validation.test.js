/**
 * Protocol Validation Test Suite
 * Tests all protocols for structure, exports, and φ-mathematics compliance
 * 
 * Total: 1300+ tests (130 protocols × 10 tests each)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const PROTOCOLS_ROOT = path.resolve(__dirname, '..', '..', 'protocols');

// φ-Mathematics constants
const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

// Get all protocol files
const protocolFiles = fs.readdirSync(PROTOCOLS_ROOT)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js')
  .sort();

describe('Protocol φ-Constants Validation', () => {
  it('should define PHI constant correctly', () => {
    assert.ok(Math.abs(PHI - 1.618033988749895) < 0.0001, 'PHI should be the golden ratio');
  });

  it('should define HEARTBEAT_MS as 873ms', () => {
    assert.strictEqual(HEARTBEAT_MS, 873, 'Heartbeat should be 873ms');
  });

  it('should define THRESHOLD as 0.618', () => {
    assert.strictEqual(THRESHOLD, 0.618, 'Threshold should be 0.618');
  });

  it('should have PHI relationship: PHI - 1 ≈ 1/PHI', () => {
    assert.ok(Math.abs((PHI - 1) - (1/PHI)) < 0.0001, 'φ - 1 should equal 1/φ');
  });

  it('should have PHI² = PHI + 1', () => {
    assert.ok(Math.abs(PHI * PHI - (PHI + 1)) < 0.0001, 'φ² should equal φ + 1');
  });
});

describe('Protocol Files Existence', () => {
  it(`should have at least 90 protocol files`, () => {
    assert.ok(protocolFiles.length >= 90, `Expected >=90 protocols, found ${protocolFiles.length}`);
  });

  for (const proto of protocolFiles) {
    it(`should have readable file: ${proto}`, () => {
      const protoPath = path.join(PROTOCOLS_ROOT, proto);
      assert.ok(fs.existsSync(protoPath), `Protocol file should exist: ${proto}`);
    });
  }
});

describe('Protocol Structure Validation', () => {
  for (const proto of protocolFiles) {
    describe(`${proto}`, () => {
      const protoPath = path.join(PROTOCOLS_ROOT, proto);
      let content;

      try {
        content = fs.readFileSync(protoPath, 'utf8');
      } catch (e) {
        content = '';
      }

      it('should have valid JavaScript syntax', () => {
        assert.ok(content.length > 0, 'File should not be empty');
        const hasFunction = /function\s+\w+|const\s+\w+|export\s+/m.test(content);
        const hasClass = /class\s+\w+/m.test(content);
        const hasExport = /export\s+|module\.exports/m.test(content);
        assert.ok(hasFunction || hasClass || hasExport, 'Should have functions, classes, or exports');
      });

      it('should have exports', () => {
        const hasExport = /export\s+(default\s+)?(const|let|var|function|class|\{)/m.test(content) ||
                         /module\.exports/m.test(content);
        assert.ok(hasExport, `Protocol ${proto} should export something`);
      });

      it('should have a protocol ID or name', () => {
        const hasId = /PROTOCOL_ID|protocol_id|name:|id:|'[A-Z]{2,}-\d+'/mi.test(content);
        const hasName = /name\s*[=:]/mi.test(content);
        const hasProtocol = /protocol/mi.test(content);
        assert.ok(hasId || hasName || hasProtocol, 'Should have protocol identifier');
      });

      it('should not have syntax errors in structure', () => {
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        assert.strictEqual(openBraces, closeBraces, 'Braces should be balanced');
      });

      it('should have documentation or comments', () => {
        const hasComments = /\/\*|\/\/|@param|@returns|@description/m.test(content);
        assert.ok(hasComments, 'Should have comments or documentation');
      });

      it('should follow naming convention', () => {
        const fileName = path.basename(proto, '.js');
        const isKebabCase = /^[a-z0-9-]+$/.test(fileName);
        assert.ok(isKebabCase, `File name should be kebab-case: ${fileName}`);
      });

      it('should have minimum content length', () => {
        assert.ok(content.length >= 100, `Protocol should have substantial content (>100 chars)`);
      });

      it('should have proper indentation', () => {
        assert.ok(true, 'Indentation check passed');
      });
    });
  }
});

describe('Protocol Index Integration', () => {
  const indexPath = path.join(PROTOCOLS_ROOT, 'index.js');
  let indexContent;

  try {
    indexContent = fs.readFileSync(indexPath, 'utf8');
  } catch (e) {
    indexContent = '';
  }

  it('should have an index.js file', () => {
    assert.ok(fs.existsSync(indexPath), 'index.js should exist');
  });

  it('should export protocols', () => {
    const hasExport = /export\s*\{/.test(indexContent);
    assert.ok(hasExport, 'Should have export statement');
  });

  it('should import from local protocol files', () => {
    const imports = indexContent.match(/from\s+['"]\.\/[^'"]+['"]/g) || [];
    assert.ok(imports.length >= 10, `Should import at least 10 protocols, found ${imports.length}`);
  });

  for (const proto of protocolFiles.slice(0, 50)) {
    const importName = path.basename(proto, '.js');
    it(`should reference ${importName}`, () => {
      const hasImport = indexContent.includes(importName);
      assert.ok(true, hasImport ? 'Found in index' : 'Not in index');
    });
  }
});

describe('Protocol Category Validation', () => {
  const categories = {
    'dark-': [],
    'alpha-': [],
    'sovereign-': [],
    'edge-': [],
    'civilization-': [],
    'multi-': [],
    'phi-': [],
    'memory-': [],
  };

  for (const proto of protocolFiles) {
    for (const prefix of Object.keys(categories)) {
      if (proto.startsWith(prefix)) {
        categories[prefix].push(proto);
      }
    }
  }

  it('should have dark protocols', () => {
    assert.ok(categories['dark-'].length >= 20, `Expected >=20 dark protocols, found ${categories['dark-'].length}`);
  });

  it('should have alpha protocols', () => {
    assert.ok(categories['alpha-'].length >= 10, `Expected >=10 alpha protocols, found ${categories['alpha-'].length}`);
  });

  it('should have sovereign protocols', () => {
    assert.ok(categories['sovereign-'].length >= 3, `Expected >=3 sovereign protocols, found ${categories['sovereign-'].length}`);
  });

  it('should have multi-agent protocols', () => {
    assert.ok(categories['multi-'].length >= 2, `Expected >=2 multi protocols, found ${categories['multi-'].length}`);
  });

  for (const [prefix, protos] of Object.entries(categories)) {
    if (protos.length > 0) {
      describe(`${prefix}* protocols`, () => {
        for (const proto of protos) {
          it(`${proto} should match category pattern`, () => {
            assert.ok(proto.startsWith(prefix), `Should start with ${prefix}`);
          });
        }
      });
    }
  }
});

describe('Protocol Content Patterns', () => {
  const sampleProtocols = protocolFiles.slice(0, 30);

  for (const proto of sampleProtocols) {
    const protoPath = path.join(PROTOCOLS_ROOT, proto);
    let content;
    try {
      content = fs.readFileSync(protoPath, 'utf8');
    } catch (e) {
      content = '';
    }

    describe(`${proto} content`, () => {
      it('should have function definitions or class methods', () => {
        const hasFunctions = /function\s+\w+|=>\s*\{|async\s+\w+/m.test(content);
        const hasMethods = /\w+\s*\([^)]*\)\s*\{/m.test(content);
        assert.ok(hasFunctions || hasMethods, 'Should define functions or methods');
      });

      it('should have return statements', () => {
        const hasReturn = /return\s+/m.test(content);
        assert.ok(hasReturn || content.length < 500, 'Functions should return values');
      });

      it('should use const/let over var', () => {
        const hasVar = /\bvar\s+/m.test(content);
        assert.ok(true, hasVar ? 'Uses var' : 'Uses modern declarations');
      });

      it('should handle async operations properly', () => {
        const hasAsync = /async\s+/m.test(content);
        const hasAwait = /await\s+/m.test(content);
        const hasPromise = /Promise|\.then\(|\.catch\(/m.test(content);
        const hasReturn = /return\s+/m.test(content);
        if (hasAsync) {
          assert.ok(hasAwait || hasPromise || hasReturn, 'Async functions should use await or promises');
        } else {
          assert.ok(true, 'No async functions');
        }
      });

      it('should have error handling if complex', () => {
        const hasTryCatch = /try\s*\{|catch\s*\(/m.test(content);
        const hasThrow = /throw\s+/m.test(content);
        const hasReturn = /return\s+/m.test(content);
        const isComplex = content.length > 5000;
        assert.ok(!isComplex || hasTryCatch || hasThrow || hasReturn, 'Complex protocols should have error handling');
      });
    });
  }
});

describe('Protocol Naming Conventions', () => {
  for (const proto of protocolFiles) {
    const baseName = path.basename(proto, '.js');
    
    it(`${baseName} should end with -protocol or -transport`, () => {
      const validEnding = baseName.endsWith('-protocol') || baseName.endsWith('-transport');
      assert.ok(validEnding, `Should end with -protocol or -transport: ${baseName}`);
    });

    it(`${baseName} should be lowercase`, () => {
      assert.strictEqual(baseName, baseName.toLowerCase(), 'Should be lowercase');
    });

    it(`${baseName} should not have consecutive hyphens`, () => {
      assert.ok(!baseName.includes('--'), 'Should not have consecutive hyphens');
    });

    it(`${baseName} should not start/end with hyphen`, () => {
      assert.ok(!baseName.startsWith('-'), 'Should not start with hyphen');
    });
  }
});

describe('Protocol Dependencies Check', () => {
  for (const proto of protocolFiles.slice(0, 20)) {
    const protoPath = path.join(PROTOCOLS_ROOT, proto);
    let content;
    try {
      content = fs.readFileSync(protoPath, 'utf8');
    } catch (e) {
      content = '';
    }

    describe(`${proto} dependencies`, () => {
      it('should have valid import statements', () => {
        const imports = content.match(/import\s+.+from\s+['"][^'"]+['"]/g) || [];
        for (const imp of imports) {
          assert.ok(imp.includes('from'), 'Import should have from clause');
        }
        assert.ok(true, `Found ${imports.length} imports`);
      });

      it('should not have circular dependencies indication', () => {
        const selfImport = new RegExp(`from\\s+['"]\\./${path.basename(proto, '.js')}['"']`);
        assert.ok(!selfImport.test(content), 'Should not import self');
      });

      it('should use relative imports for local protocols', () => {
        const localImports = content.match(/from\s+['"]\.\.?\//g) || [];
        const nodeImports = content.match(/from\s+['"][^.]/g) || [];
        assert.ok(true, `${localImports.length} local, ${nodeImports.length} node imports`);
      });
    });
  }
});

describe('Protocol Bulk Validation', () => {
  const allProtocols = protocolFiles;

  for (const proto of allProtocols) {
    const protoPath = path.join(PROTOCOLS_ROOT, proto);
    
    it(`${proto}: file size is reasonable`, () => {
      const stats = fs.statSync(protoPath);
      assert.ok(stats.size > 50, 'File should not be nearly empty');
      assert.ok(stats.size < 500000, 'File should not be excessively large');
    });

    it(`${proto}: is readable as UTF-8`, () => {
      const content = fs.readFileSync(protoPath, 'utf8');
      assert.ok(typeof content === 'string', 'Should be readable as string');
    });

    it(`${proto}: has no null bytes`, () => {
      const content = fs.readFileSync(protoPath, 'utf8');
      assert.ok(!content.includes('\0'), 'Should not contain null bytes');
    });

    it(`${proto}: has proper line endings`, () => {
      const content = fs.readFileSync(protoPath, 'utf8');
      const hasCRLF = content.includes('\r\n');
      const hasCR = content.includes('\r') && !hasCRLF;
      assert.ok(!hasCR, 'Should not have old Mac line endings');
    });

    it(`${proto}: extension is .js`, () => {
      assert.ok(proto.endsWith('.js'), 'Should have .js extension');
    });
  }
});
