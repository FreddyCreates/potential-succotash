"""Repository-level read tools: get repo metadata, list org/user repos."""

import json

from pydantic import BaseModel, ConfigDict, Field

from ..app import mcp
from ..client import github_request, handle_github_error
from ..constants import DEFAULT_PER_PAGE, MAX_PER_PAGE


class GetRepoInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., description="Repository owner (user or org login)", min_length=1)
    repo: str = Field(..., description="Repository name", min_length=1)


@mcp.tool(
    name="github_get_repo",
    annotations={
        "title": "Get GitHub Repository",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_get_repo(params: GetRepoInput) -> str:
    """Get metadata for a single GitHub repository.

    Args:
        params (GetRepoInput): owner, repo

    Returns:
        str: JSON with name, full_name, description, default_branch, private,
        html_url, language, stargazers_count, forks_count, open_issues_count,
        archived, pushed_at, updated_at.

    Error Handling:
        Returns "Error ... Not found (404)" if the repo doesn't exist or the
        token can't see it.
    """
    try:
        data = await github_request(f"/repos/{params.owner}/{params.repo}")
        output = {
            "name": data["name"],
            "full_name": data["full_name"],
            "description": data.get("description"),
            "default_branch": data["default_branch"],
            "private": data["private"],
            "html_url": data["html_url"],
            "language": data.get("language"),
            "stargazers_count": data["stargazers_count"],
            "forks_count": data["forks_count"],
            "open_issues_count": data["open_issues_count"],
            "archived": data["archived"],
            "pushed_at": data["pushed_at"],
            "updated_at": data["updated_at"],
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_get_repo")


class ListOrgReposInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    org: str = Field(..., description="Organization or user login", min_length=1)
    per_page: int = Field(default=DEFAULT_PER_PAGE, ge=1, le=MAX_PER_PAGE, description="Results per page")
    page: int = Field(default=1, ge=1, description="Page number, 1-indexed")


@mcp.tool(
    name="github_list_org_repos",
    annotations={
        "title": "List GitHub Organization or User Repositories",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_list_org_repos(params: ListOrgReposInput) -> str:
    """List repositories belonging to a GitHub organization or user, most
    recently pushed first.

    Args:
        params (ListOrgReposInput): org, per_page (default 30, max 100), page (default 1)

    Returns:
        str: JSON with "repos" array (name, full_name, description,
        default_branch, private, html_url, pushed_at) and pagination info
        (page, per_page, count, has_more).

    Examples:
        - Use when: "What repos does ItsNotAILABS have?" -> org="ItsNotAILABS"
        - Don't use when: you already know the repo name (use github_get_repo instead)
    """
    try:
        data = await github_request(
            f"/orgs/{params.org}/repos",
            params={
                "per_page": params.per_page,
                "page": params.page,
                "sort": "pushed",
                "direction": "desc",
            },
        )
        repos = [
            {
                "name": r["name"],
                "full_name": r["full_name"],
                "description": r.get("description"),
                "default_branch": r["default_branch"],
                "private": r["private"],
                "html_url": r["html_url"],
                "pushed_at": r["pushed_at"],
            }
            for r in data
        ]
        output = {
            "page": params.page,
            "per_page": params.per_page,
            "count": len(repos),
            "has_more": len(repos) == params.per_page,
            "repos": repos,
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_list_org_repos")
