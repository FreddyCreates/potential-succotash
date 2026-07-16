# VIGIL-4B — Local Chrome Multi-Swarm Agent Brain

## What this is

**VIGIL-4B** is the enterprise agent runtime for the Vigil Chrome / Edge Multi-Swarm IDE.

It is **not** a multi-gigabyte foundation model weight checked into git. Training a true 4B parameter model requires GPUs, data, and weeks of compute. Instead, VIGIL-4B is:

1. **Neural path** — talks to a local **~3–4B class** model via [Ollama](https://ollama.com)  
   Preferred tags: `phi3:3.8b`, `qwen2.5:3b`, `llama3.2:3b`, `gemma2:2b`
2. **Orchestrator path** — when Ollama is offline, a deterministic planner still embeds **sub-agents** and Chrome tools (multi-swarm, researcher, scout, read page, forge report, …)
3. **Tool router** — LLM (or planner) emits tool JSON; the extension executes real Chrome / swarm work

## Install local 4B-class model

```bash
# Install Ollama from https://ollama.com then:
ollama pull phi3:3.8b
ollama serve   # usually auto-starts on Windows
```

Vigil probes `http://127.0.0.1:11434`. Status shows **OLLAMA LIVE** when reachable.

## Embedded sub-agents

| Sub-agent | Role |
|-----------|------|
| multi-swarm | researcher + scout + digest in parallel |
| researcher | Wikipedia + news sources |
| scout / crawler / scraper | URL intelligence |
| digest / analyst | multi-topic / multi-URL synthesis |
| chrome tools | read page, list tabs, forge report |

## UI

- **Command** — 4K enterprise dashboard + KPIs + command surface  
- **VIGIL-4B** — dedicated model console  
- **Chat** — routes through VIGIL-4B first, legacy chat fallback  
- **Swarms** — multi-swarm operator panel  

## API (extension messages)

| action | purpose |
|--------|---------|
| `vigil4bStatus` | probe Ollama + runtime meta |
| `vigil4bChat` | plan + tool-call + answer |
| `vigil4bSetModel` | pin Ollama model name |
| `vigil4bSetEndpoint` | custom Ollama host |
| `vigil4bClear` | clear short chat history |

## Commercial positioning

| Tier | Brain |
|------|--------|
| Starter | Orchestrator only |
| Pro | Local Ollama 4B-class |
| Team / Enterprise | Shared Ollama host + policy |

See root `COMMERCIAL.md`.
