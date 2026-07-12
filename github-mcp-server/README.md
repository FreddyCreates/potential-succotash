# github-mcp-server (TypeScript)

> A Python rewrite of this server now lives at `../github-mcp-server-python`, built by request to avoid TypeScript where it's not required. Both versions are kept — nothing here was deleted. Use whichever one you connect to Claude; they expose the same 14 tools.

A local MCP server giving Claude direct read/write access to GitHub: repos, files, branches, commits, and pull requests (including opening, marking ready, and merging).

Built for the ItsNotAILABS / NOVA repo family, but works with any repo your token can see.

## 1. Create a GitHub personal access token

Go to https://github.com/settings/tokens and create one of:

- **Fine-grained token** (recommended): scope it to the specific repos you want Claude to touch, with **Contents: Read and write**, **Pull requests: Read and write**, and **Metadata: Read-only** permissions.
- **Classic token**: needs the **repo** scope (or **public_repo** if you only work with public repos).

Copy the token value somewhere safe — GitHub only shows it once.

## 2. Install and build

```
cd github-mcp-server
npm install
npm run build
```

This produces `dist/index.js`, the server's entry point.

## 3. Connect it to Claude

Add it as an MCP server in your Claude Desktop / Cowork config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["C:\\Users\\Medin\\GPTREPO\\github-mcp-server\\dist\\index.js"],
      "env": {
        "GITHUB_TOKEN": "paste-your-token-here"
      }
    }
  }
}
```

Enter your token directly in your own config file — Claude never sees or handles the raw token value. Restart Claude Desktop / Cowork after editing the config.

## Tools this server exposes

**Repos** — `github_get_repo`, `github_list_org_repos`

**Files** — `github_get_file_contents` (read a file or list a directory), `github_create_or_update_file` (commit a file change)

**Branches** — `github_list_branches`, `github_create_branch`

**Commits** — `github_list_commits`

**Pull requests** — `github_list_pull_requests`, `github_get_pull_request`, `github_get_pull_request_files` (diffs), `github_create_pull_request`, `github_mark_pull_request_ready`, `github_merge_pull_request`, `github_add_issue_comment`

## Safety notes

- `github_merge_pull_request` will not force through a draft PR, merge conflicts, or failing required checks — those are GitHub's own guardrails and this server doesn't try to bypass them.
- `github_create_or_update_file` makes a real commit every time it's called. There's no dry-run mode.
- Nothing in this server auto-merges anything on its own — every write only happens when Claude (or you) explicitly calls the tool.
- The token lives in your local Claude config, not in this repo. `.env` is gitignored if you use one for local testing (`npm run dev`).

## Local development

```
npm run dev    # runs src/index.ts directly with tsx, auto-reloads
```
