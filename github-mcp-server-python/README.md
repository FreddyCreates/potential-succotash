# github-mcp-server (Python)

A local MCP server giving Claude direct read/write access to GitHub: repos, files, branches, commits, and pull requests (including opening, marking ready, and merging).

This is the Python/FastMCP rewrite of `github-mcp-server` (the original TypeScript version lives alongside it) — same 14 tools, same behavior, different backend language. Python was chosen over TypeScript for this rebuild by request; both are official, fully-supported MCP languages, so this isn't a maturity difference, just a language one.

## 1. Create a GitHub personal access token

Go to https://github.com/settings/tokens and create one of:

- **Fine-grained token** (recommended): scoped to the specific repos you want Claude to touch, with **Contents: Read and write**, **Pull requests: Read and write**, and **Metadata: Read-only** permissions.
- **Classic token**: needs the **repo** scope (or **public_repo** if you only work with public repos).

Copy the token value somewhere safe — GitHub only shows it once.

## 2. Install

```
cd github-mcp-server-python
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .
```

## 3. Connect it to Claude

Add it as an MCP server in your Claude Desktop / Cowork config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "python",
      "args": ["-m", "github_mcp.server"],
      "cwd": "C:\\Users\\Medin\\GPTREPO\\github-mcp-server-python",
      "env": {
        "GITHUB_TOKEN": "paste-your-token-here",
        "PYTHONPATH": "C:\\Users\\Medin\\GPTREPO\\github-mcp-server-python\\src"
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
- The token lives in your local Claude config, not in this repo.

## Verification

Verified in the build sandbox: all source files compile (`py_compile`), the package installs editable, all 14 tools register on the FastMCP instance with no name collisions, the server exits cleanly with an actionable error when `GITHUB_TOKEN` is unset, and starts and blocks correctly on stdio when it is set. Live GitHub API calls were not exercised (no token was used against the real API during the build) — the REST/GraphQL client logic mirrors the TypeScript version's, which has the same untested-against-live-API caveat.

## Local development

```
python -m github_mcp.server
```
