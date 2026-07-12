"""Pull request read/write tools: list, get, diff, create, ready, merge, comment."""

import json
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from ..app import mcp
from ..client import github_graphql, github_request, handle_github_error, truncate_text
from ..constants import DEFAULT_PER_PAGE, MAX_PER_PAGE


class PrState(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    ALL = "all"


class MergeMethod(str, Enum):
    MERGE = "merge"
    SQUASH = "squash"
    REBASE = "rebase"


def _summarize_pr(pr: dict) -> dict:
    return {
        "number": pr["number"],
        "title": pr["title"],
        "state": pr["state"],
        "draft": pr["draft"],
        "merged": pr.get("merged", False),
        "mergeable": pr.get("mergeable"),
        "mergeable_state": pr.get("mergeable_state"),
        "author": (pr.get("user") or {}).get("login"),
        "head": pr["head"]["ref"],
        "base": pr["base"]["ref"],
        "commits": pr.get("commits"),
        "additions": pr.get("additions"),
        "deletions": pr.get("deletions"),
        "changed_files": pr.get("changed_files"),
        "html_url": pr["html_url"],
        "created_at": pr["created_at"],
        "updated_at": pr["updated_at"],
    }


class ListPullRequestsInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    state: PrState = Field(default=PrState.OPEN)
    base: Optional[str] = Field(default=None, description="Filter to PRs targeting this base branch")
    per_page: int = Field(default=DEFAULT_PER_PAGE, ge=1, le=MAX_PER_PAGE)
    page: int = Field(default=1, ge=1)


@mcp.tool(
    name="github_list_pull_requests",
    annotations={
        "title": "List GitHub Pull Requests",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_list_pull_requests(params: ListPullRequestsInput) -> str:
    """List pull requests in a repository, most recently updated first.

    Args:
        params (ListPullRequestsInput): owner, repo, state ('open'|'closed'|'all',
            default 'open'), base (optional), per_page (default 30, max 100), page (default 1)

    Returns:
        str: JSON with "pull_requests" array (number, title, state, draft,
        author, head, base, html_url, updated_at) and pagination info.

        Note: this list view does NOT include mergeable/diff-stat fields --
        call github_get_pull_request for those.
    """
    try:
        data = await github_request(
            f"/repos/{params.owner}/{params.repo}/pulls",
            params={
                "state": params.state.value,
                "base": params.base,
                "per_page": params.per_page,
                "page": params.page,
                "sort": "updated",
                "direction": "desc",
            },
        )
        prs = [
            {
                "number": pr["number"],
                "title": pr["title"],
                "state": pr["state"],
                "draft": pr["draft"],
                "author": (pr.get("user") or {}).get("login"),
                "head": pr["head"]["ref"],
                "base": pr["base"]["ref"],
                "html_url": pr["html_url"],
                "updated_at": pr["updated_at"],
            }
            for pr in data
        ]
        output = {
            "page": params.page,
            "per_page": params.per_page,
            "count": len(prs),
            "has_more": len(prs) == params.per_page,
            "pull_requests": prs,
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_list_pull_requests")


class GetPullRequestInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    pull_number: int = Field(..., ge=1)


@mcp.tool(
    name="github_get_pull_request",
    annotations={
        "title": "Get GitHub Pull Request",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_get_pull_request(params: GetPullRequestInput) -> str:
    """Get full detail for a single pull request, including draft/merge
    state and diff stats.

    Args:
        params (GetPullRequestInput): owner, repo, pull_number

    Returns:
        str: JSON with number, title, state, draft, merged, mergeable,
        mergeable_state, author, head, base, commits, additions, deletions,
        changed_files, html_url, created_at, updated_at.

        "mergeable_state" is especially useful: "clean" means it can be
        merged now, "dirty" means there are merge conflicts that must be
        resolved first, "blocked" means required checks/reviews are missing.
    """
    try:
        pr = await github_request(f"/repos/{params.owner}/{params.repo}/pulls/{params.pull_number}")
        return json.dumps(_summarize_pr(pr), indent=2)
    except Exception as e:
        return handle_github_error(e, "github_get_pull_request")


class GetPullRequestFilesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    pull_number: int = Field(..., ge=1)
    per_page: int = Field(default=DEFAULT_PER_PAGE, ge=1, le=MAX_PER_PAGE)
    page: int = Field(default=1, ge=1)


@mcp.tool(
    name="github_get_pull_request_files",
    annotations={
        "title": "Get GitHub Pull Request Diff / Changed Files",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_get_pull_request_files(params: GetPullRequestFilesInput) -> str:
    """List the files changed by a pull request, including per-file diff
    patches. This is how you read "what changed" in a PR.

    Args:
        params (GetPullRequestFilesInput): owner, repo, pull_number,
            per_page (default 30, max 100), page (default 1)

    Returns:
        str: JSON with "files" array: filename, status (added/modified/
        removed/renamed), additions, deletions, changes, and patch (unified
        diff text, may be omitted by GitHub for very large files). Total
        response is truncated at ~25000 characters if combined patches are
        huge -- narrow with pagination if you hit that.
    """
    try:
        data = await github_request(
            f"/repos/{params.owner}/{params.repo}/pulls/{params.pull_number}/files",
            params={"per_page": params.per_page, "page": params.page},
        )
        files = [
            {
                "filename": f["filename"],
                "status": f["status"],
                "additions": f["additions"],
                "deletions": f["deletions"],
                "changes": f["changes"],
                "patch": f.get("patch"),
            }
            for f in data
        ]
        output = {
            "page": params.page,
            "per_page": params.per_page,
            "count": len(files),
            "has_more": len(files) == params.per_page,
            "files": files,
        }
        text, truncated = truncate_text(json.dumps(output, indent=2))
        if truncated:
            output["truncated"] = True
        return text
    except Exception as e:
        return handle_github_error(e, "github_get_pull_request_files")


class CreatePullRequestInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    head: str = Field(..., min_length=1, description='Branch containing your changes, e.g. "feature/add-receipts"')
    base: str = Field(..., min_length=1, description='Branch you want to merge into, e.g. "main"')
    body: Optional[str] = Field(default=None, description="PR description (markdown)")
    draft: bool = Field(default=False, description="Open as a draft PR")


@mcp.tool(
    name="github_create_pull_request",
    annotations={
        "title": "Create a GitHub Pull Request",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def github_create_pull_request(params: CreatePullRequestInput) -> str:
    """Open a new pull request from a head branch into a base branch. The
    head branch must already exist and have commits ahead of base (use
    github_create_branch and github_create_or_update_file first).

    Args:
        params (CreatePullRequestInput): owner, repo, title, head, base,
            body (optional), draft (default false)

    Returns:
        str: JSON with number, html_url, draft, state.

    Error Handling:
        Returns a 422 error if head has no commits ahead of base, or if a PR
        for this head/base pair is already open.
    """
    try:
        pr = await github_request(
            f"/repos/{params.owner}/{params.repo}/pulls",
            method="POST",
            json_body={
                "title": params.title,
                "head": params.head,
                "base": params.base,
                "body": params.body,
                "draft": params.draft,
            },
        )
        output = {"number": pr["number"], "html_url": pr["html_url"], "draft": pr["draft"], "state": pr["state"]}
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_create_pull_request")


class MarkPullRequestReadyInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    pull_number: int = Field(..., ge=1)


@mcp.tool(
    name="github_mark_pull_request_ready",
    annotations={
        "title": "Mark a GitHub Pull Request Ready for Review",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_mark_pull_request_ready(params: MarkPullRequestReadyInput) -> str:
    """Convert a draft pull request to "ready for review" so it can be
    merged. GitHub's REST API doesn't expose this directly, so this tool
    uses the GraphQL API under the hood -- you don't need to do anything
    differently.

    Args:
        params (MarkPullRequestReadyInput): owner, repo, pull_number

    Returns:
        str: JSON confirming the PR is no longer a draft.

    Error Handling:
        No-op (returns current state) if the PR is already ready for review.
    """
    try:
        pr = await github_request(f"/repos/{params.owner}/{params.repo}/pulls/{params.pull_number}")
        if not pr["draft"]:
            return json.dumps({"number": pr["number"], "draft": False, "note": "PR was already ready for review."}, indent=2)

        mutation = """
        mutation($id: ID!) {
          markPullRequestReadyForReview(input: { pullRequestId: $id }) {
            pullRequest { number isDraft }
          }
        }
        """
        result = await github_graphql(mutation, {"id": pr["node_id"]})
        pr_result = result["markPullRequestReadyForReview"]["pullRequest"]
        output = {"number": pr_result["number"], "draft": pr_result["isDraft"]}
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_mark_pull_request_ready")


class MergePullRequestInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    pull_number: int = Field(..., ge=1)
    merge_method: MergeMethod = Field(default=MergeMethod.MERGE)
    commit_title: Optional[str] = Field(default=None)
    commit_message: Optional[str] = Field(default=None)


@mcp.tool(
    name="github_merge_pull_request",
    annotations={
        "title": "Merge a GitHub Pull Request",
        "readOnlyHint": False,
        "destructiveHint": True,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def github_merge_pull_request(params: MergePullRequestInput) -> str:
    """Merge a pull request into its base branch. This is a real,
    hard-to-reverse action.

    Preconditions this tool does NOT bypass:
      - The PR must not be a draft (use github_mark_pull_request_ready first).
      - The PR must have mergeable_state "clean" (check with
        github_get_pull_request first) -- this tool will NOT force through
        merge conflicts, required-check failures, or review requirements;
        GitHub itself blocks those.

    Args:
        params (MergePullRequestInput): owner, repo, pull_number,
            merge_method ('merge'|'squash'|'rebase', default 'merge'),
            commit_title (optional), commit_message (optional)

    Returns:
        str: JSON with merged (bool), sha of the merge commit, and a message.

    Error Handling:
        Returns a 405 error if the PR is not mergeable (conflicts, draft, or
        failing required checks) -- resolve that first.
    """
    try:
        result = await github_request(
            f"/repos/{params.owner}/{params.repo}/pulls/{params.pull_number}/merge",
            method="PUT",
            json_body={
                "merge_method": params.merge_method.value,
                "commit_title": params.commit_title,
                "commit_message": params.commit_message,
            },
        )
        return json.dumps(result, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_merge_pull_request")


class AddIssueCommentInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    issue_number: int = Field(..., ge=1, description="The issue or PR number")
    body: str = Field(..., min_length=1, description="Comment text (markdown supported)")


@mcp.tool(
    name="github_add_issue_comment",
    annotations={
        "title": "Add a Comment to a GitHub Issue or Pull Request",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def github_add_issue_comment(params: AddIssueCommentInput) -> str:
    """Post a comment on an issue or pull request (pull requests are issues
    under the hood, so this works for both).

    Args:
        params (AddIssueCommentInput): owner, repo, issue_number, body

    Returns:
        str: JSON with the new comment's id and html_url.
    """
    try:
        comment = await github_request(
            f"/repos/{params.owner}/{params.repo}/issues/{params.issue_number}/comments",
            method="POST",
            json_body={"body": params.body},
        )
        output = {"id": comment["id"], "html_url": comment["html_url"]}
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_add_issue_comment")
