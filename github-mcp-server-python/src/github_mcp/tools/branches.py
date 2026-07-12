"""Branch read/create tools."""

import json
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from ..app import mcp
from ..client import github_request, handle_github_error
from ..constants import DEFAULT_PER_PAGE, MAX_PER_PAGE


class ListBranchesInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    per_page: int = Field(default=DEFAULT_PER_PAGE, ge=1, le=MAX_PER_PAGE)
    page: int = Field(default=1, ge=1)


@mcp.tool(
    name="github_list_branches",
    annotations={
        "title": "List GitHub Branches",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_list_branches(params: ListBranchesInput) -> str:
    """List branches in a repository.

    Args:
        params (ListBranchesInput): owner, repo, per_page (default 30, max 100), page (default 1)

    Returns:
        str: JSON with "branches" array (name, commit_sha, protected) and pagination info.
    """
    try:
        data = await github_request(
            f"/repos/{params.owner}/{params.repo}/branches",
            params={"per_page": params.per_page, "page": params.page},
        )
        branches = [{"name": b["name"], "commit_sha": b["commit"]["sha"], "protected": b["protected"]} for b in data]
        output = {
            "page": params.page,
            "per_page": params.per_page,
            "count": len(branches),
            "has_more": len(branches) == params.per_page,
            "branches": branches,
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_list_branches")


class CreateBranchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    new_branch: str = Field(..., min_length=1, description='Name for the new branch, e.g. "feature/add-receipts"')
    from_branch: Optional[str] = Field(
        default=None, description="Existing branch to branch from. Defaults to the repo's default branch."
    )


@mcp.tool(
    name="github_create_branch",
    annotations={
        "title": "Create a GitHub Branch",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def github_create_branch(params: CreateBranchInput) -> str:
    """Create a new branch from the tip of an existing branch (defaults to
    the repo's default branch if from_branch is omitted).

    Args:
        params (CreateBranchInput): owner, repo, new_branch, from_branch (optional)

    Returns:
        str: JSON with branch, from_branch, sha (the new branch's starting commit).

    Error Handling:
        Returns a 422 error if a branch with that name already exists.
    """
    try:
        base = params.from_branch
        if not base:
            repo_data = await github_request(f"/repos/{params.owner}/{params.repo}")
            base = repo_data["default_branch"]

        base_ref = await github_request(f"/repos/{params.owner}/{params.repo}/git/ref/heads/{base}")
        created = await github_request(
            f"/repos/{params.owner}/{params.repo}/git/refs",
            method="POST",
            json_body={"ref": f"refs/heads/{params.new_branch}", "sha": base_ref["object"]["sha"]},
        )
        output = {"branch": params.new_branch, "from_branch": base, "sha": created["object"]["sha"]}
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_create_branch")
