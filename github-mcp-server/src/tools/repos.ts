import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { githubRequest, handleGitHubError } from "../services/github-client.js";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "../constants.js";
import type { GitHubRepo } from "../types.js";

export function registerRepoTools(server: McpServer): void {
  server.registerTool(
    "github_get_repo",
    {
      title: "Get GitHub Repository",
      description: `Get metadata for a single GitHub repository: description, default branch, visibility, star/fork/open-issue counts, language, and last push time.

Args:
  - owner (string): Repository owner (user or org login), e.g. "ItsNotAILABS"
  - repo (string): Repository name, e.g. "nexus"

Returns JSON with fields: name, full_name, description, default_branch, private, html_url, language, stargazers_count, forks_count, open_issues_count, archived, pushed_at, updated_at.

Error Handling:
  - Returns "Error ... Not found (404)" if the repo doesn't exist or the token can't see it.`,
      inputSchema: {
        owner: z.string().min(1).describe("Repository owner (user or org login)"),
        repo: z.string().min(1).describe("Repository name"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ owner, repo }) => {
      try {
        const data = await githubRequest<GitHubRepo>(`/repos/${owner}/${repo}`);
        const output = {
          name: data.name,
          full_name: data.full_name,
          description: data.description,
          default_branch: data.default_branch,
          private: data.private,
          html_url: data.html_url,
          language: data.language,
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          open_issues_count: data.open_issues_count,
          archived: data.archived,
          pushed_at: data.pushed_at,
          updated_at: data.updated_at,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleGitHubError(error, "github_get_repo") }] };
      }
    }
  );

  server.registerTool(
    "github_list_org_repos",
    {
      title: "List GitHub Organization or User Repositories",
      description: `List repositories belonging to a GitHub organization or user.

Args:
  - org (string): Organization or user login, e.g. "ItsNotAILABS"
  - per_page (number): Results per page, 1-100 (default 30)
  - page (number): Page number, 1-indexed (default 1)

Returns JSON with a "repos" array (name, full_name, description, default_branch, private, html_url, pushed_at) and pagination info (page, per_page, count, has_more).

Examples:
  - Use when: "What repos does ItsNotAILABS have?" -> org="ItsNotAILABS"
  - Don't use when: You already know the repo name (use github_get_repo instead)`,
      inputSchema: {
        org: z.string().min(1).describe("Organization or user login"),
        per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
        page: z.number().int().min(1).default(1),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ org, per_page, page }) => {
      try {
        const data = await githubRequest<GitHubRepo[]>(`/orgs/${org}/repos`, "GET", undefined, {
          per_page,
          page,
          sort: "pushed",
          direction: "desc",
        });
        const repos = data.map((r) => ({
          name: r.name,
          full_name: r.full_name,
          description: r.description,
          default_branch: r.default_branch,
          private: r.private,
          html_url: r.html_url,
          pushed_at: r.pushed_at,
        }));
        const output = {
          page,
          per_page,
          count: repos.length,
          has_more: repos.length === per_page,
          repos,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_list_org_repos") }],
        };
      }
    }
  );
}
