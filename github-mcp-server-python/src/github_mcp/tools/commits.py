"""Commit history read tools."""

import json
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from ..app import mcp
from ..client import github_request, handle_github_error
from ..constants import DEFAULT_PER_PAGE, MAX_PER_PAGE


class ListCommitsInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    sha: Optional[str] = Field(default=None, description="Branch, tag, or commit SHA to list from")
    per_page: int = Field(default=DEFAULT_PER_PAGE, ge=1, le=MAX_PER_PAGE)
    page: int = Field(default=1, ge=1)


@mcp.tool(
    name="github_list_commits",
    annotations={
        "title": "List GitHub Commits",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_list_commits(params: ListCommitsInput) -> str:
    """List commits on a branch (or the default branch if none given), most
    recent first.

    Args:
        params (ListCommitsInput): owner, repo, sha (optional branch/tag/commit
            to start from), per_page (default 30, max 100), page (default 1)

    Returns:
        str: JSON with "commits" array (sha, message [first line],
        author_login, author_name, date, html_url) and pagination info.
    """
    try:
        data = await github_request(
            f"/repos/{params.owner}/{params.repo}/commits",
            params={"sha": params.sha, "per_page": params.per_page, "page": params.page},
        )
        commits = [
            {
                "sha": c["sha"],
                "message": c["commit"]["message"].split("\n", 1)[0],
                "author_login": (c.get("author") or {}).get("login"),
                "author_name": (c["commit"].get("author") or {}).get("name"),
                "date": (c["commit"].get("author") or {}).get("date"),
                "html_url": c["html_url"],
            }
            for c in data
        ]
        output = {
            "page": params.page,
            "per_page": params.per_page,
            "count": len(commits),
            "has_more": len(commits) == params.per_page,
            "commits": commits,
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_list_commits")
