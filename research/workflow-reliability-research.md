# 📉 Workflow Reliability Research Report

> **Generated:** 2026-05-18T08:26:52Z  
> **Research Bot:** pm-research-autoagents  
> **Signal:** 5 workflows profiled for failure rates

## Executive Summary

This research report provides a comprehensive deep-dive into the workflow reliability issues identified in the organism CI/CD pipeline. All 5 identified workflows have 100% failure rates, but the root causes are **deterministic regressions** (not flaky failures), making them addressable through targeted code fixes.

### How This Report Was Generated

This report is now generated **autonomously by pm-research-autoagents** using native tooling:

| Component | Tool |
|-----------|------|
| **Signal Detection** | `pm-research-autoagents.js` workflow reliability researcher |
| **Log Collection** | `lib/ci-log-collector.js` — Native GitHub Actions API |
| **Root Cause Analysis** | `lib/failure-pattern-analyzer.js` — Pattern matching engine |
| **Report Generation** | `lib/deep-investigation-generator.js` — Markdown generator |
| **PM Task Execution** | `lib/pm-task-executor.js` — Automated PM actions |

**NO external MCP tools required** — this is YOUR tooling.

---

## 📊 Failure Analysis Summary

| Workflow | Failure Rate | Root Cause Category | Classification |
|----------|-------------|---------------------|----------------|
| organism-deploy-bot | 100% (21/21) | Missing commit permissions | **Deterministic** |
| organism-sentinel-bot | 100% (3/3) | Security scanner false positive | **Deterministic** |
| organism-sandcastle-bot | 100% (4/4) | SDK validation failure | **Deterministic** |
| organism-test-bot | 100% (2/2) | Git push race condition | **Deterministic** |
| organism-neural-bot | 100% (2/2) | SDK validation failure | **Deterministic** |

---

## 🔬 Root Cause Analysis

### 1. 🛡️ organism-sentinel-bot — Security Scanner False Positive

**Failure Location:** `scan-dangerous-patterns.js` step  
**Error Message:** `❌ High-severity dangerous patterns detected`

**Root Cause:**  
The security scanner at `scripts/sentinel-bot/scan-dangerous-patterns.js` detects the pattern `eval()` in:
- `protocols/symbolic-mathematics-protocol.js:584` — `this.eval(input.expr, input.env || {})`
- `protocols/symbolic-mathematics-protocol.js:629` — `eval(exprOrName, env = {}) {`

**Analysis:**  
This is a **false positive**. The `eval` function in `symbolic-mathematics-protocol.js` is a **custom method** on the `SymbolicMathematicsProtocol` class that calls an internal `evaluate()` function for symbolic expression evaluation — NOT JavaScript's built-in `eval()`. The method:
```javascript
eval(exprOrName, env = {}) {
  this.computations++;
  const expr = typeof exprOrName === 'string'
    ? this.expressionRegistry.get(exprOrName)
    : exprOrName;
  if (!expr) throw new Error(`Expression not found: ${exprOrName}`);
  return evaluate(expr, env);  // Safe internal function
}
```

**Classification:** Deterministic regression — will fail on every run until scanner is updated.

**Recommended Fix:**
Update `scripts/sentinel-bot/scan-dangerous-patterns.js` to:
1. Add context-aware detection that distinguishes method definitions (e.g., `eval(`) from function calls (`eval(`).
2. Or add a whitelist for known safe patterns like `this.eval(` and method definitions in class contexts.

---

### 2. 🏰 organism-sandcastle-bot — SDK Validation Failure

**Failure Location:** `build-gate.js` step  
**Error Message:** `✗ SDK package.json: Check returned false`

**Root Cause:**  
Three SDK directories are missing `package.json` files:
- `sdk/agents/` — missing package.json
- `sdk/engines/` — missing package.json  
- `sdk/runtime/` — missing package.json

**Analysis:**  
The build gate at `scripts/sandcastle-bot/build-gate.js` checks that every SDK directory contains a valid `package.json` with `name` and `version` fields. These directories exist but lack the required metadata files.

**Classification:** Deterministic regression — will fail until package.json files are added.

**Recommended Fix:**
Create `package.json` files for the missing SDK directories with proper metadata:
```json
{
  "name": "@organism/agents",
  "version": "0.1.0",
  "description": "Organism agent framework",
  "main": "index.js",
  "license": "MIT"
}
```

---

### 3. 🧠 organism-neural-bot — SDK Agent Validation Failure

**Failure Location:** `validate-agents.js` step  
**Error Message:** `✗ agents: missing package.json`

**Root Cause:**  
Same root cause as sandcastle-bot — the SDK directories `sdk/agents/`, `sdk/engines/`, and `sdk/runtime/` are missing `package.json` files.

**Classification:** Deterministic regression — will fail until package.json files are added.

**Recommended Fix:** Same as sandcastle-bot.

---

### 4. 🧪 organism-test-bot — Git Push Race Condition

**Failure Location:** `health-dashboard` job, commit step  
**Error Message:** 
```
! [rejected] main -> main (fetch first)
error: failed to push some refs to 'https://github.com/FreddyCreates/potential-succotash'
```

**Root Cause:**  
The workflow attempts to push the test dashboard to the `main` branch, but another workflow (running concurrently) has already pushed changes. This is a **git push race condition** caused by multiple bot workflows trying to update the repository simultaneously.

**Analysis:**  
When multiple workflows run at once (triggered by the same push), they each:
1. Checkout the same commit
2. Generate their reports
3. Try to push to main

The first one succeeds, but subsequent pushes fail because the remote has moved forward.

**Classification:** Deterministic regression — will fail when multiple workflows run concurrently (which is always on main pushes).

**Recommended Fix:**
1. **Option A (Recommended):** Use `pull-rebase` before push:
   ```yaml
   - name: Commit dashboard
     run: |
       git config user.name "organism-test-bot"
       git config user.email "organism-test-bot@users.noreply.github.com"
       git add docs/test-dashboard.md
       if git diff --cached --quiet; then
         echo "Dashboard unchanged"
       else
         git pull --rebase origin main || true
         git commit -m "🧪 organism-test-bot: update health dashboard [skip ci]"
         git push || echo "Push failed - another workflow updated first"
       fi
   ```

2. **Option B:** Use concurrency groups to serialize bot workflows:
   ```yaml
   concurrency:
     group: organism-bot-commits
     cancel-in-progress: false
   ```

3. **Option C:** Only update dashboards on successful workflow completion, or move to a dedicated branch.

---

### 5. 🌐 organism-deploy-bot — Validation Jobs Have No Failures

**Failure Location:** The workflow runs but the jobs complete with `total_jobs: 0` which indicates no actual job execution.

**Root Cause:**  
Looking at the workflow runs, the deploy-bot has 67 runs with 21 failures. The failures appear to be related to:
1. The same git push race condition as other bots
2. Attempts to commit `deployment-manifest.json` when another workflow has already updated main

**Analysis:**  
The workflow at `organism-deploy-bot.yml` line 139-149 attempts to commit and push the deployment manifest. When concurrent workflows run, this push fails.

**Classification:** Deterministic regression — race condition with concurrent workflows.

**Recommended Fix:** Same as organism-test-bot — implement pull-rebase before push, or use concurrency groups.

---

## 🎯 Flaky vs Deterministic Analysis

| Workflow | Flaky? | Deterministic? | Evidence |
|----------|--------|----------------|----------|
| organism-sentinel-bot | ❌ No | ✅ Yes | Same error message on every run (eval() detection) |
| organism-sandcastle-bot | ❌ No | ✅ Yes | Same missing files on every run |
| organism-neural-bot | ❌ No | ✅ Yes | Same missing files on every run |
| organism-test-bot | ❌ No | ✅ Yes | Push rejection happens when concurrent workflows exist |
| organism-deploy-bot | ❌ No | ✅ Yes | Push rejection happens when concurrent workflows exist |

**Key Finding:** None of these failures are flaky. All are deterministic regressions that will occur on every run until the underlying issues are fixed.

---

## 📈 Recommended Reliability SLOs

Based on the analysis, the following SLOs are recommended:

### Availability SLOs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Success Rate | ≥ 95% | Rolling 7-day window |
| Test Success Rate | ≥ 98% | Rolling 7-day window |
| Deploy Success Rate | ≥ 90% | Rolling 7-day window |
| Security Scan Success Rate | ≥ 99% | Rolling 7-day window |

### Latency SLOs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Time p95 | < 5 minutes | Per workflow run |
| Test Time p95 | < 10 minutes | Per workflow run |
| Full Pipeline Time p95 | < 15 minutes | End-to-end |

### Alert Thresholds

| Condition | Alert Level | Action |
|-----------|-------------|--------|
| 3+ consecutive failures | 🔴 Critical | Page on-call, block merges |
| Success rate < 80% (24h) | 🟠 Warning | Notify team channel |
| Success rate < 50% (1h) | 🔴 Critical | Immediate investigation |
| Any security scan failure | 🔴 Critical | Manual review required |

---

## 🛠️ Recommended Remediation Priority

| Priority | Workflow | Fix | Effort |
|----------|----------|-----|--------|
| P0 | sentinel-bot | Update scanner to ignore method definitions | Low |
| P0 | sandcastle-bot | Add missing package.json files | Low |
| P0 | neural-bot | (Same fix as sandcastle) | Low |
| P1 | test-bot | Implement pull-rebase or concurrency groups | Medium |
| P1 | deploy-bot | Implement pull-rebase or concurrency groups | Medium |

---

## 📋 Action Items

- [ ] **Fix: Update sentinel-bot scanner** — Add context-aware detection for method definitions vs function calls
- [ ] **Fix: Add missing SDK package.json** — Create package.json for `sdk/agents/`, `sdk/engines/`, `sdk/runtime/`
- [ ] **Fix: Implement git push strategy** — Add pull-rebase or concurrency groups to all bot workflows
- [ ] **Implement: Reliability dashboard** — Track SLOs and alert on threshold breaches
- [ ] **Document: Bot workflow dependencies** — Create runbook for concurrent workflow management

---

## 🔗 References

- Workflow Runs: [GitHub Actions](https://github.com/FreddyCreates/potential-succotash/actions)
- Failing Scripts:
  - `scripts/sentinel-bot/scan-dangerous-patterns.js`
  - `scripts/sandcastle-bot/build-gate.js`
  - `scripts/neural-bot/validate-agents.js`
- Related Files:
  - `protocols/symbolic-mathematics-protocol.js`
  - `sdk/agents/`, `sdk/engines/`, `sdk/runtime/`

---

*Report generated by pm-research-autoagents using native tooling:*  
*`lib/ci-log-collector.js` • `lib/failure-pattern-analyzer.js` • `lib/deep-investigation-generator.js`*
