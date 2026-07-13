# Vigil AI — Commercial Multi-Swarm Agent IDE

**Product:** Vigil AI (Chrome / Edge extension + Windows Desktop)  
**Repo:** https://github.com/FreddyCreates/potential-succotash  
**Version:** 18.0 commercial pack

---

## What you ship

| SKU | Artifact | Audience |
|-----|----------|----------|
| **Edge / Chrome Extension** | `dist/extensions/vigil-ai-v18.0.0.zip` or `jarvis.zip` | Power users, teams |
| **One-click Windows installer** | `install-jarvis.bat` | Non-technical installs |
| **Desktop app (NSIS)** | `dist/desktop/Vigil AI Setup *.exe` | Commercial seats |
| **Desktop portable** | `dist/desktop/Vigil AI *.exe` | Air-gapped / USB |
| **Organism release bundle** | `dist/sovereign-organism-v*.zip` | Full platform pack |

---

## Pricing (Vigil Multi-Swarm IDE)

| Tier | Monthly | Seats | Multi-swarm | Agents | Support |
|------|---------|-------|-------------|--------|---------|
| **Starter** | Free | 1 | 1 swarm | 3 concurrent | Community |
| **Pro** | $49 | 5 | 4 swarms | 10 concurrent | Email |
| **Team** | $199 | 25 | Unlimited swarms | 10 / user | Priority |
| **Enterprise** | Custom | Unlimited | Custom policy | Custom | Dedicated + SLA |

### Included in Pro+
- Multi-swarm deploy (researcher + scout + digest)
- Side panel IDE (Nexus, Mirror, Agents, AGI tools)
- Offline-first core + optional cloud AI keys
- GitHub MCP server kits (TypeScript + Python)
- Desktop Windows app

---

## Install (commercial)

### Extension (Edge)
```bat
install-jarvis.bat
```
Uses local `dist\extensions\*.zip` when present; otherwise downloads from GitHub `main`.

### Desktop
1. Run `Vigil AI Setup *.exe` (NSIS), or  
2. Run portable `Vigil AI *.exe`

### From source (build machine)
```bat
cd extensions\jarvis && npm install && npm run build
cd ..\..\desktop && npm install && npm run dist
node scripts\bundle-release.js
```

---

## Multi-swarm quick start

In the side panel chat:

```text
deploy a swarm on multi agent systems
```

Or programmatically:

```js
chrome.runtime.sendMessage({ action: 'deploySwarm', goal: 'your topic' })
```

---

## License

MIT (see `LICENSE`) unless a customer enterprise agreement supersedes.
