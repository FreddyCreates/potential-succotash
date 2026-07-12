import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { githubRequest, handleGitHubError, truncateText } from "../services/github-client.js";
import type { GitHubFileContent } from "../types.js";

export function registerFileTools(server: McpServer): void {
  server.registerTool(
    "github_get_file_contents",
    {
      title: "Get GitHub File or Directory Contents",
      description: `Read a file's decoded text content, or list a directory's entries, from a GitHub repo at a given ref.

Args:
  - owner (string): Repository owner
  - repo (string): Repository name
  - path (string): File or directory path relative to repo root. Use "" for repo root.
  - ref (string, optional): Branch, tag, or commit SHA. Defaults to the repo's default branch.

Returns JSON:
  - For a file: { type: "file", path, sha, size, content, truncated }
  - For a directory: { type: "dir", path, entries: [{ name, path, type, size }] }

Error Handling:
  - Returns "Error ... Not found (404)" if the path/ref doesn't exist.
  - Binary files are returned with a note instead of raw content.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        path: z.string().default("").describe("File or directory path, empty string for repo root"),
        ref: z.string().optional().describe("Branch, tag, or commit SHA (defaults to default branch)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ owner, repo, path, ref }) => {
      try {
        const data = await githubRequest<GitHubFileContent | GitHubFileContent[]>(
          `/repos/${owner}/${repo}/contents/${path}`,
          "GET",
          undefined,
          ref ? { ref } : undefined
        );

        if (Array.isArray(data)) {
          const output = {
            type: "dir" as const,
            path: path || "/",
            entries: data.map((e) => ({ name: e.name, path: e.path, type: e.type, size: e.size })),
          };
          return {
            content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
            structuredContent: output,
          };
        }

        if (data.type !== "file") {
          const output = { type: data.type, path: data.path };
          return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
        }

        let decoded: string;
        try {
          decoded = data.content && data.encoding === "base64"
            ? Buffer.from(data.content, "base64").toString("utf-8")
            : (data.content ?? "");
        } catch {
          decoded = "[binary or non-UTF-8 content omitted]";
        }
        const { text: truncatedContent, truncated } = truncateText(decoded);
        const output = {
          type: "file" as const,
          path: data.path,
          sha: data.sha,
          size: data.size,
          content: truncatedContent,
          truncated,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_get_file_contents") }],
        };
      }
    }
  );

  server.registerTool(
    "github_create_or_update_file",
    {
      title: "Create or Update a GitHub File",
      description: `Create a new file or update an existing file's content on a specific branch, as a single commit. This makes a real commit — use with intent.

Args:
  - owner (string): Repository owner
  - repo (string): Repository name
  - path (string): File path relative to repo root
  - content (string): New full file content (plain text, will be base64-encoded automatically)
  - message (string): Commit message
  - branch (string): Branch to commit to (must already exist; use github_create_branch first if needed)
  - sha (string, optional): The blob SHA of the file being replaced. Required when updating an existing file;
    omit when creating a brand-new file. If unsure, call github_get_file_contents first to get the current sha.

Returns JSON with the new commit sha and the file's html_url.

Error Handling:
  - Returns a 409/422 error if "sha" is missing or stale for an existing file (someone else changed it since you read it) — re-fetch and retry.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        path: z.string().min(1),
        content: z.string().describe("New full file content as plain text"),
        message: z.string().min(1).describe("Commit message"),
        branch: z.string().min(1).describe("Branch to commit to"),
        sha: z.string().optional().describe("Current blob SHA, required when updating an existing file"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ owner, repo, path, content, message, branch, sha }) => {
      try {
        const body: Record<string, unknown> = {
          message,
          content: Buffer.from(content, "utf-8").toString("base64"),
          branch,
        };
        if (sha) body.sha = sha;

        const data = await githubRequest<{
          content: { sha: string; html_url: string; path: string };
          commit: { sha: string; html_url: string };
        }>(`/repos/${owner}/${repo}/contents/${path}`, "PUT", body);

        const output = {
          path: data.content.path,
          file_sha: data.content.sha,
          file_url: data.content.html_url,
          commit_sha: data.commit.sha,
          commit_url: data.commit.html_url,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_create_or_update_file") }],
        };
      }
    }
  );
}
