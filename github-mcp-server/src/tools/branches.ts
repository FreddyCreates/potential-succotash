import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { githubRequest, handleGitHubError } from "../services/github-client.js";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "../constants.js";
import type { GitHubBranch, GitHubRepo } from "../types.js";

export function registerBranchTools(server: McpServer): void {
  server.registerTool(
    "github_list_branches",
    {
      title: "List GitHub Branches",
      description: `List branches in a repository.

Args:
  - owner (string), repo (string)
  - per_page (number, default 30, max 100)
  - page (number, default 1)

Returns JSON with a "branches" array (name, commit_sha, protected) and pagination info.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
        page: z.number().int().min(1).default(1),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ owner, repo, per_page, page }) => {
      try {
        const data = await githubRequest<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`, "GET", undefined, {
          per_page,
          page,
        });
        const output = {
          page,
          per_page,
          count: data.length,
          has_more: data.length === per_page,
          branches: data.map((b) => ({ name: b.name, commit_sha: b.commit.sha, protected: b.protected })),
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleGitHubError(error, "github_list_branches") }] };
      }
    }
  );

  server.registerTool(
    "github_create_branch",
    {
      title: "Create a GitHub Branch",
      description: `Create a new branch from the tip of an existing branch (defaults to the repo's default branch if from_branch is omitted).

Args:
  - owner (string), repo (string)
  - new_branch (string): Name for the new branch, e.g. "feature/add-receipts"
  - from_branch (string, optional): Existing branch to branch from. Defaults to the repo's default branch.

Returns JSON with the new branch name and its starting commit sha.

Error Handling:
  - Returns a 422 error if a branch with that name already exists.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        new_branch: z.string().min(1),
        from_branch: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ owner, repo, new_branch, from_branch }) => {
      try {
        let base = from_branch;
        if (!base) {
          const repoData = await githubRequest<GitHubRepo>(`/repos/${owner}/${repo}`);
          base = repoData.default_branch;
        }
        const baseRef = await githubRequest<{ object: { sha: string } }>(
          `/repos/${owner}/${repo}/git/ref/heads/${base}`
        );
        const created = await githubRequest<{ ref: string; object: { sha: string } }>(
          `/repos/${owner}/${repo}/git/refs`,
          "POST",
          { ref: `refs/heads/${new_branch}`, sha: baseRef.object.sha }
        );
        const output = {
          branch: new_branch,
          from_branch: base,
          sha: created.object.sha,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleGitHubError(error, "github_create_branch") }] };
      }
    }
  );
}
