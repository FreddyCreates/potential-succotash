import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  githubGraphQL,
  githubRequest,
  handleGitHubError,
  truncateText,
} from "../services/github-client.js";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "../constants.js";
import type { GitHubIssueComment, GitHubPullRequest, GitHubPullRequestFile } from "../types.js";

function summarizePr(pr: GitHubPullRequest) {
  return {
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: pr.draft,
    merged: pr.merged,
    mergeable: pr.mergeable,
    mergeable_state: pr.mergeable_state,
    author: pr.user?.login ?? null,
    head: pr.head.ref,
    base: pr.base.ref,
    commits: pr.commits,
    additions: pr.additions,
    deletions: pr.deletions,
    changed_files: pr.changed_files,
    html_url: pr.html_url,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
  };
}

export function registerPullRequestTools(server: McpServer): void {
  server.registerTool(
    "github_list_pull_requests",
    {
      title: "List GitHub Pull Requests",
      description: `List pull requests in a repository, most recently updated first.

Args:
  - owner (string), repo (string)
  - state ('open' | 'closed' | 'all', default 'open')
  - base (string, optional): Filter to PRs targeting this base branch
  - per_page (number, default 30, max 100), page (number, default 1)

Returns JSON with a "pull_requests" array (number, title, state, draft, author, head, base, html_url, updated_at) and pagination info.

Note: this list view does NOT include mergeable/diff-stat fields — call github_get_pull_request for those.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        state: z.enum(["open", "closed", "all"]).default("open"),
        base: z.string().optional(),
        per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
        page: z.number().int().min(1).default(1),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ owner, repo, state, base, per_page, page }) => {
      try {
        const data = await githubRequest<GitHubPullRequest[]>(`/repos/${owner}/${repo}/pulls`, "GET", undefined, {
          state,
          base,
          per_page,
          page,
          sort: "updated",
          direction: "desc",
        });
        const output = {
          page,
          per_page,
          count: data.length,
          has_more: data.length === per_page,
          pull_requests: data.map((pr) => ({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            draft: pr.draft,
            author: pr.user?.login ?? null,
            head: pr.head.ref,
            base: pr.base.ref,
            html_url: pr.html_url,
            updated_at: pr.updated_at,
          })),
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_list_pull_requests") }],
        };
      }
    }
  );

  server.registerTool(
    "github_get_pull_request",
    {
      title: "Get GitHub Pull Request",
      description: `Get full detail for a single pull request, including draft/merge state and diff stats.

Args:
  - owner (string), repo (string), pull_number (number)

Returns JSON with: number, title, state, draft, merged, mergeable, mergeable_state, author, head, base, commits, additions, deletions, changed_files, html_url, created_at, updated_at.

"mergeable_state" is especially useful: "clean" means it can be merged now, "dirty" means there are merge conflicts that must be resolved first, "blocked" means required checks/reviews are missing.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        pull_number: z.number().int().min(1),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const pr = await githubRequest<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${pull_number}`);
        const output = summarizePr(pr);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return { content: [{ type: "text", text: handleGitHubError(error, "github_get_pull_request") }] };
      }
    }
  );

  server.registerTool(
    "github_get_pull_request_files",
    {
      title: "Get GitHub Pull Request Diff / Changed Files",
      description: `List the files changed by a pull request, including per-file diff patches. This is how you read "what changed" in a PR.

Args:
  - owner (string), repo (string), pull_number (number)
  - per_page (number, default 30, max 100), page (number, default 1)

Returns JSON with a "files" array: filename, status (added/modified/removed/renamed), additions, deletions, changes, and patch (unified diff text, may be omitted by GitHub for very large files).
Total response is truncated at ~25000 characters if the combined patches are huge — narrow with pagination if you hit that.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        pull_number: z.number().int().min(1),
        per_page: z.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
        page: z.number().int().min(1).default(1),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ owner, repo, pull_number, per_page, page }) => {
      try {
        const data = await githubRequest<GitHubPullRequestFile[]>(
          `/repos/${owner}/${repo}/pulls/${pull_number}/files`,
          "GET",
          undefined,
          { per_page, page }
        );
        const output = {
          page,
          per_page,
          count: data.length,
          has_more: data.length === per_page,
          files: data.map((f) => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            changes: f.changes,
            patch: f.patch,
          })),
        };
        const { text, truncated } = truncateText(JSON.stringify(output, null, 2));
        return {
          content: [{ type: "text", text }],
          structuredContent: truncated ? { ...output, truncated: true } : output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_get_pull_request_files") }],
        };
      }
    }
  );

  server.registerTool(
    "github_create_pull_request",
    {
      title: "Create a GitHub Pull Request",
      description: `Open a new pull request from a head branch into a base branch. The head branch must already exist and have commits ahead of base (use github_create_branch and github_create_or_update_file first).

Args:
  - owner (string), repo (string)
  - title (string): PR title
  - head (string): Branch containing your changes, e.g. "feature/add-receipts"
  - base (string): Branch you want to merge into, e.g. "main"
  - body (string, optional): PR description (markdown)
  - draft (boolean, default false): Open as a draft PR

Returns JSON with the new PR's number and html_url.

Error Handling:
  - Returns a 422 error if head has no commits ahead of base, or if a PR for this head/base pair is already open.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        title: z.string().min(1),
        head: z.string().min(1),
        base: z.string().min(1),
        body: z.string().optional(),
        draft: z.boolean().default(false),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ owner, repo, title, head, base, body, draft }) => {
      try {
        const pr = await githubRequest<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls`, "POST", {
          title,
          head,
          base,
          body,
          draft,
        });
        const output = { number: pr.number, html_url: pr.html_url, draft: pr.draft, state: pr.state };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_create_pull_request") }],
        };
      }
    }
  );

  server.registerTool(
    "github_mark_pull_request_ready",
    {
      title: "Mark a GitHub Pull Request Ready for Review",
      description: `Convert a draft pull request to "ready for review" so it can be merged. GitHub's REST API doesn't expose this directly, so this tool uses the GraphQL API under the hood — you don't need to do anything differently.

Args:
  - owner (string), repo (string), pull_number (number)

Returns JSON confirming the PR is no longer a draft.

Error Handling:
  - No-op (returns current state) if the PR is already ready for review.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        pull_number: z.number().int().min(1),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const pr = await githubRequest<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${pull_number}`);
        if (!pr.draft) {
          const output = { number: pr.number, draft: false, note: "PR was already ready for review." };
          return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
        }
        const mutation = `mutation($id: ID!) {
          markPullRequestReadyForReview(input: { pullRequestId: $id }) {
            pullRequest { number isDraft }
          }
        }`;
        const result = await githubGraphQL<{
          markPullRequestReadyForReview: { pullRequest: { number: number; isDraft: boolean } };
        }>(mutation, { id: pr.node_id });
        const output = {
          number: result.markPullRequestReadyForReview.pullRequest.number,
          draft: result.markPullRequestReadyForReview.pullRequest.isDraft,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_mark_pull_request_ready") }],
        };
      }
    }
  );

  server.registerTool(
    "github_merge_pull_request",
    {
      title: "Merge a GitHub Pull Request",
      description: `Merge a pull request into its base branch. This is a real, hard-to-reverse action.

Preconditions this tool does NOT bypass:
  - The PR must not be a draft (use github_mark_pull_request_ready first).
  - The PR must have mergeable_state "clean" (check with github_get_pull_request first) — this tool will NOT force through merge conflicts, required-check failures, or review requirements; GitHub itself blocks those.

Args:
  - owner (string), repo (string), pull_number (number)
  - merge_method ('merge' | 'squash' | 'rebase', default 'merge')
  - commit_title (string, optional), commit_message (string, optional)

Returns JSON with merged (boolean), sha of the merge commit, and a message.

Error Handling:
  - Returns a 405 error if the PR is not mergeable (conflicts, draft, or failing required checks) — resolve that first.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        pull_number: z.number().int().min(1),
        merge_method: z.enum(["merge", "squash", "rebase"]).default("merge"),
        commit_title: z.string().optional(),
        commit_message: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    },
    async ({ owner, repo, pull_number, merge_method, commit_title, commit_message }) => {
      try {
        const result = await githubRequest<{ merged: boolean; message: string; sha: string }>(
          `/repos/${owner}/${repo}/pulls/${pull_number}/merge`,
          "PUT",
          {
            merge_method,
            commit_title,
            commit_message,
          }
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_merge_pull_request") }],
        };
      }
    }
  );

  server.registerTool(
    "github_add_issue_comment",
    {
      title: "Add a Comment to a GitHub Issue or Pull Request",
      description: `Post a comment on an issue or pull request (pull requests are issues under the hood, so this works for both).

Args:
  - owner (string), repo (string), issue_number (number): the issue or PR number
  - body (string): Comment text (markdown supported)

Returns JSON with the new comment's id and html_url.`,
      inputSchema: {
        owner: z.string().min(1),
        repo: z.string().min(1),
        issue_number: z.number().int().min(1),
        body: z.string().min(1),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async ({ owner, repo, issue_number, body }) => {
      try {
        const comment = await githubRequest<GitHubIssueComment>(
          `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
          "POST",
          { body }
        );
        const output = { id: comment.id, html_url: comment.html_url };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: handleGitHubError(error, "github_add_issue_comment") }],
        };
      }
    }
  );
}
