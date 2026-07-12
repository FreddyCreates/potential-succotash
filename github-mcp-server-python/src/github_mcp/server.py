#!/usr/bin/env python3
"""
GitHub MCP Server (Python / FastMCP).

Gives an MCP client (Claude Desktop, Cowork, etc.) tools to read and write
GitHub repositories: files, branches, commits, and pull requests (including
opening, marking ready, and merging).

Requires the GITHUB_TOKEN environment variable to be set to a GitHub
personal access token before starting.
"""

import os
import sys

from .app import mcp
from . import tools  # noqa: F401  (import triggers tool registration)


def main() -> None:
    if not os.environ.get("GITHUB_TOKEN"):
        print(
            "ERROR: GITHUB_TOKEN environment variable is required. "
            "Set it to a GitHub personal access token before starting this server. "
            "See .env.example / README.md for setup instructions.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("github-mcp-server (python) running via stdi