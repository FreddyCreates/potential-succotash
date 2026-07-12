#!/usr/bin/env node
/**
 * GitHub MCP Server
 *
 * Gives an MCP client (Claude Desktop, Cowork, etc.) tools to read and write
 * GitHub repositories: files, branches, commits, and pull requests (including
 * opening, marking ready, and merging).
 *
 * Requires the GITHUB_TOKEN environment variable to be set to a GitHub
 * personal access token before starting.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerRepoTools } from "./tools/repos.js";
import { registerFileTools } from "./tools/files.js";
import { registerBranchTools } from "./tools/branches.js";
import { registerCommitTools } from "./tools/commits.js";
import { registerPullRequestTools } from "./tools/pulls.js";

const server = new McpServer({
  name: "github-mcp-server",
  version: "1.0.0",
});

registerRepoTools(server);
registerFileTools(server);
registerBranchTools(server);
registerCommitTools(server);
registerPullRequestTools(server);

async function main(): Promise<void> {
  if (!process.env.GITHUB_TOKEN) {
    console.error(
      "ERROR: GITHUB_TOKEN environment variable is required. " +
        "Set it to a GitHub personal access token before starting this server. " +
        "See .env.example / README.md for setup instructions."
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("github-mcp-server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
