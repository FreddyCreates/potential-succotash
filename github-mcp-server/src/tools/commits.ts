import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { githubRequest, handleGitHubError } from "../services/github-client.js";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "../constants.js";
import type { GitHubCommit } from "../types.js";

export function registerCommitTools(server: McpServer): void {
  server.registerTool(
    "github_list_commits",
    {
      title: "List GitHub Commits",
      description: `List commits on a branch (or the default branch if none given), most recent first.

Args:
  - owner (string), repo (string)
  - sha (string, optional): Branch name, tag, or commit SHA to start listing from. Defaults to the default branch.
  - per_page (number, default 30, max 100)
  - page (number, default 1)

Returns JSON with a "commits" array (sha, message [first line], author_login, author_name, date, html_url) and pagination info.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        sha: z.string().optional().describe("Branch, tag, or commit SHA to list from"),
        per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
        page: z.number().int().min(1).default(1),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ owner, repo, sha, per_page, page }) => {
      try {
        const data = await githubRequest<GitHubCommit[]>(`/repos/${owner}/${repo}/commits`, "GET", undefined, {
          sha,
          per_page,
          page,
        });
        const output = {
          page,
          per_page,
          count: data.length,
          has_more: data.length === per_page,
          commits: data.map((c) => ({
            sha: c.sha,
            message: c.commit.message.split("\n")[0],
            author_login: c.author?.login ?? null,
            author_name: c.commit.author?.name ?? null,
            date: c.commit.author?.date ?? null,
            html_url: c.html_url,
          })),
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleGitHubError(error, "github_list_commits") }] };
      }
    }
  );
}
