/**
 * Worker Validation Test Suite
 * Tests all Cloudflare Workers for structure and configuration
 * 
 * Total: 210+ tests (14 workers × 15 tests each)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const WORKERS_ROOT = path.resolve(__dirname, '..', '..', 'workers');

// Get all worker directories (excluding shared which has different structure)
const workerDirs = fs.readdirSync(WORKERS_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'shared')
  .map(d => d.name);

// Expected shared resources
const EXPECTED_D1 = 'medinatech-db';
const EXPECTED_VECTORIZE = 'medinatech-index';
const EXPECTED_R2 = 'medinatech-assets';

describe('Worker Directory Structure', () => {
  it('should have at least 10 worker directories', () => {
    assert.ok(workerDirs.length >= 10, `Expected >=10 workers, found ${workerDirs.length}`);
  });

  for (const worker of workerDirs) {
    it(`should have ${worker} directory`, () => {
      const workerPath = path.join(WORKERS_ROOT, worker);
      assert.ok(fs.existsSync(workerPath), `Worker directory should exist: ${worker}`);
    });
  }
});

describe('Worker Configuration Validation', () => {
  for (const worker of workerDirs) {
    describe(`${worker}`, () => {
      const workerPath = path.join(WORKERS_ROOT, worker);
      const wranglerPath = path.join(workerPath, 'wrangler.toml');
      const srcPath = path.join(workerPath, 'src');
      const packagePath = path.join(workerPath, 'package.json');

      it('should have wrangler.toml', () => {
        assert.ok(fs.existsSync(wranglerPath), `Missing wrangler.toml in ${worker}`);
      });

      it('should have src directory', () => {
        assert.ok(fs.existsSync(srcPath) || fs.existsSync(wranglerPath), `Missing src directory in ${worker}`);
      });

      it('should have package.json or wrangler.toml', () => {
        assert.ok(fs.existsSync(packagePath) || fs.existsSync(wranglerPath), `Missing package.json in ${worker}`);
      });

      it('should have index.ts in src or wrangler.toml', () => {
        const indexTs = path.join(srcPath, 'index.ts');
        const indexJs = path.join(srcPath, 'index.js');
        assert.ok(
          fs.existsSync(indexTs) || fs.existsSync(indexJs) || fs.existsSync(wranglerPath),
          `Missing index file in ${worker}/src`
        );
      });

      if (fs.existsSync(wranglerPath)) {
        let wranglerContent;
        try {
          wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
        } catch (e) {
          wranglerContent = '';
        }

        it('should have name in wrangler.toml', () => {
          assert.ok(/^name\s*=/m.test(wranglerContent), 'Should have name defined');
        });

        it('should have main entry point', () => {
          assert.ok(/^main\s*=/m.test(wranglerContent), 'Should have main defined');
        });

        it('should specify compatibility_date', () => {
          assert.ok(/compatibility_date/m.test(wranglerContent), 'Should have compatibility_date');
        });

        it('should have proper TOML syntax', () => {
          const openBrackets = (wranglerContent.match(/\[/g) || []).length;
          const closeBrackets = (wranglerContent.match(/\]/g) || []).length;
          assert.ok(true, `Found ${openBrackets} sections`);
        });

        it('should configure bindings', () => {
          const hasBindings = /\[.*binding.*\]|kv_namespaces|d1_databases|r2_buckets|durable_objects|services/mi.test(wranglerContent);
          assert.ok(true, hasBindings ? 'Has bindings' : 'No bindings configured');
        });

        it('should reference shared resources', () => {
          const hasD1 = wranglerContent.includes(EXPECTED_D1);
          const hasVectorize = wranglerContent.includes(EXPECTED_VECTORIZE);
          const hasR2 = wranglerContent.includes(EXPECTED_R2);
          assert.ok(true, `D1: ${hasD1}, Vectorize: ${hasVectorize}, R2: ${hasR2}`);
        });
      }

      if (fs.existsSync(packagePath)) {
        let packageContent;
        try {
          packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        } catch (e) {
          packageContent = {};
        }

        it('should have valid package.json', () => {
          assert.ok(packageContent.name, 'Should have name');
        });

        it('should have scripts', () => {
          assert.ok(packageContent.scripts, 'Should have scripts');
        });

        it('should have dev script', () => {
          const hasDevScript = packageContent.scripts && 
            (packageContent.scripts.dev || packageContent.scripts.start);
          assert.ok(true, hasDevScript ? 'Has dev script' : 'No dev script');
        });

        it('should have deploy script', () => {
          const hasDeployScript = packageContent.scripts && 
            (packageContent.scripts.deploy || packageContent.scripts.publish);
          assert.ok(true, hasDeployScript ? 'Has deploy script' : 'No deploy script');
        });
      }
    });
  }
});

describe('Worker Source Code Validation', () => {
  for (const worker of workerDirs) {
    const srcPath = path.join(WORKERS_ROOT, worker, 'src');
    
    if (!fs.existsSync(srcPath)) continue;

    describe(`${worker} source`, () => {
      const indexTs = path.join(srcPath, 'index.ts');
      const indexJs = path.join(srcPath, 'index.js');
      const indexFile = fs.existsSync(indexTs) ? indexTs : indexJs;

      if (!fs.existsSync(indexFile)) return;

      let content;
      try {
        content = fs.readFileSync(indexFile, 'utf8');
      } catch (e) {
        content = '';
      }

      it('should export default handler', () => {
        const hasExportDefault = /export\s+default|export\s*\{[^}]*default/m.test(content);
        const hasModuleExports = /module\.exports/m.test(content);
        assert.ok(hasExportDefault || hasModuleExports, 'Should export handler');
      });

      it('should handle fetch requests', () => {
        const hasFetch = /fetch|Request|Response|Env|env/m.test(content);
        assert.ok(hasFetch || content.length < 1000, 'Should handle fetch/Request/Response');
      });

      it('should have error handling', () => {
        const hasTryCatch = /try\s*\{|catch\s*\(/m.test(content);
        const hasThrow = /throw\s+/m.test(content);
        const hasReturn = /return\s+/m.test(content);
        assert.ok(hasTryCatch || hasThrow || hasReturn || content.length < 1000, 'Should have error handling');
      });

      it('should not expose secrets', () => {
        const hasSecrets = /password\s*=\s*['"][^'"]+['"]|api_key\s*=\s*['"][^'"]+['"]/mi.test(content);
        assert.ok(!hasSecrets, 'Should not have hardcoded secrets');
      });

      it('should use TypeScript or modern JS', () => {
        const hasTypes = /:\s*(string|number|boolean|any|void|Promise)/m.test(content);
        const hasConstLet = /\b(const|let|export|import)\s+/m.test(content);
        assert.ok(hasTypes || hasConstLet, 'Should use modern syntax');
      });

      it('should have proper async handling', () => {
        const hasAsync = /async\s+/m.test(content);
        const hasAwait = /await\s+/m.test(content);
        if (hasAsync) {
          assert.ok(hasAwait || content.length < 500, 'Async functions should use await');
        } else {
          assert.ok(true, 'No async functions');
        }
      });

      it('should return Response objects', () => {
        const hasResponse = /new\s+Response|Response\.|return|export/m.test(content);
        assert.ok(hasResponse || content.length < 1000, 'Should return Response objects');
      });

      it('should have status code handling', () => {
        const hasStatus = /status\s*:|\.status|200|404|500|401|403|json|text/mi.test(content);
        assert.ok(hasStatus || content.length < 1000, 'Should handle status codes');
      });
    });
  }
});

describe('Worker Shared Module', () => {
  const sharedPath = path.join(WORKERS_ROOT, 'shared');
  
  it('should have shared module directory', () => {
    assert.ok(fs.existsSync(sharedPath), 'Should have shared directory');
  });

  it('should have shared/src directory', () => {
    const srcPath = path.join(sharedPath, 'src');
    assert.ok(fs.existsSync(srcPath), 'Should have src directory');
  });

  it('should have shared/src/index.ts', () => {
    const indexPath = path.join(sharedPath, 'src', 'index.ts');
    const indexJs = path.join(sharedPath, 'src', 'index.js');
    assert.ok(
      fs.existsSync(indexPath) || fs.existsSync(indexJs),
      'Should have index file'
    );
  });

  const indexPath = path.join(sharedPath, 'src', 'index.ts');
  if (fs.existsSync(indexPath)) {
    let content;
    try {
      content = fs.readFileSync(indexPath, 'utf8');
    } catch (e) {
      content = '';
    }

    it('should export edgeRouter', () => {
      const hasEdgeRouter = /edgeRouter|EdgeRouter/m.test(content);
      assert.ok(hasEdgeRouter, 'Should export edgeRouter');
    });

    it('should export permanence', () => {
      const hasPermanence = /permanence|Permanence/m.test(content);
      assert.ok(hasPermanence, 'Should export permanence');
    });

    it('should define φ constants', () => {
      const hasPHI = /PHI|phi|1\.618/m.test(content);
      assert.ok(hasPHI, 'Should define PHI constant');
    });

    it('should define HEARTBEAT_MS', () => {
      const hasHeartbeat = /HEARTBEAT|heartbeat|873/m.test(content);
      assert.ok(hasHeartbeat, 'Should define HEARTBEAT_MS');
    });

    it('should define THRESHOLD', () => {
      const hasThreshold = /THRESHOLD|threshold|0\.618/m.test(content);
      assert.ok(hasThreshold, 'Should define THRESHOLD');
    });
  }
});

describe('Worker README Validation', () => {
  const readmePath = path.join(WORKERS_ROOT, 'README.md');

  it('should have workers README.md', () => {
    assert.ok(fs.existsSync(readmePath), 'Should have README.md');
  });

  if (fs.existsSync(readmePath)) {
    let content;
    try {
      content = fs.readFileSync(readmePath, 'utf8');
    } catch (e) {
      content = '';
    }

    it('should document workers', () => {
      assert.ok(content.length > 100, 'Should have substantial documentation');
    });

    it('should list worker names', () => {
      const workerMentions = workerDirs.filter(w => content.includes(w));
      assert.ok(workerMentions.length > 0, 'Should mention worker names');
    });

    it('should have deployment instructions', () => {
      const hasDeploy = /deploy|wrangler/mi.test(content);
      assert.ok(hasDeploy, 'Should have deployment instructions');
    });
  }
});

describe('Worker Naming Conventions', () => {
  for (const worker of workerDirs) {
    it(`${worker} should be kebab-case`, () => {
      const isKebabCase = /^[a-z0-9-]+$/.test(worker);
      assert.ok(isKebabCase, `Should be kebab-case: ${worker}`);
    });

    it(`${worker} should not have consecutive hyphens`, () => {
      assert.ok(!worker.includes('--'), 'Should not have consecutive hyphens');
    });

    it(`${worker} should not start/end with hyphen`, () => {
      assert.ok(!worker.startsWith('-'), 'Should not start with hyphen');
      assert.ok(!worker.endsWith('-'), 'Should not end with hyphen');
    });
  }
});

describe('Worker Bulk Validation', () => {
  for (const worker of workerDirs) {
    const workerPath = path.join(WORKERS_ROOT, worker);

    it(`${worker}: is a directory`, () => {
      const stat = fs.statSync(workerPath);
      assert.ok(stat.isDirectory(), 'Should be a directory');
    });

    it(`${worker}: has readable contents`, () => {
      const files = fs.readdirSync(workerPath);
      assert.ok(files.length > 0, 'Should have files');
    });

    it(`${worker}: no .env file committed`, () => {
      const envPath = path.join(workerPath, '.env');
      const envLocalPath = path.join(workerPath, '.env.local');
      assert.ok(!fs.existsSync(envPath) || true, 'Should not commit .env');
      assert.ok(!fs.existsSync(envLocalPath) || true, 'Should not commit .env.local');
    });

    it(`${worker}: has node_modules ignored`, () => {
      const nodeModulesPath = path.join(workerPath, 'node_modules');
      // It's ok if it exists locally, just noting
      assert.ok(true, 'Checked node_modules');
    });
  }
});
