"""File and directory read/write tools."""

import base64
import json
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from ..app import mcp
from ..client import github_request, handle_github_error, truncate_text


class GetFileContentsInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    path: str = Field(default="", description="File or directory path, empty string for repo root")
    ref: Optional[str] = Field(default=None, description="Branch, tag, or commit SHA (defaults to default branch)")


@mcp.tool(
    name="github_get_file_contents",
    annotations={
        "title": "Get GitHub File or Directory Contents",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def github_get_file_contents(params: GetFileContentsInput) -> str:
    """Read a file's decoded text content, or list a directory's entries,
    from a GitHub repo at a given ref.

    Args:
        params (GetFileContentsInput): owner, repo, path (empty for root), ref (optional)

    Returns:
        str: JSON. For a file: {type: "file", path, sha, size, content, truncated}.
        For a directory: {type: "dir", path, entries: [{name, path, type, size}]}.

    Error Handling:
        Returns "Error ... Not found (404)" if the path/ref doesn't exist.
        Binary files are returned with a placeholder note instead of raw content.
    """
    try:
        data = await github_request(
            f"/repos/{params.owner}/{params.repo}/contents/{params.path}",
            params={"ref": params.ref},
        )

        if isinstance(data, list):
            output = {
                "type": "dir",
                "path": params.path or "/",
                "entries": [
                    {"name": e["name"], "path": e["path"], "type": e["type"], "size": e["size"]}
                    for e in data
                ],
            }
            return json.dumps(output, indent=2)

        if data.get("type") != "file":
            return json.dumps({"type": data.get("type"), "path": data.get("path")}, indent=2)

        try:
            decoded = (
                base64.b64decode(data["content"]).decode("utf-8")
                if data.get("content") and data.get("encoding") == "base64"
                else data.get("content", "")
            )
        except (UnicodeDecodeError, ValueError):
            decoded = "[binary or non-UTF-8 content omitted]"

        truncated_content, was_truncated = truncate_text(decoded)
        output = {
            "type": "file",
            "path": data["path"],
            "sha": data["sha"],
            "size": data["size"],
            "content": truncated_content,
            "truncated": was_truncated,
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_get_file_contents")


class CreateOrUpdateFileInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    owner: str = Field(..., min_length=1)
    repo: str = Field(..., min_length=1)
    path: str = Field(..., min_length=1)
    content: str = Field(..., description="New full file content as plain text")
    message: str = Field(..., min_length=1, description="Commit message")
    branch: str = Field(..., min_length=1, description="Branch to commit to")
    sha: Optional[str] = Field(
        default=None,
        description="Current blob SHA, required when updating an existing file. "
        "Omit when creating a brand-new file.",
    )


@mcp.tool(
    name="github_create_or_update_file",
    annotations={
        "title": "Create or Update a GitHub File",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": True,
    },
)
async def github_create_or_update_file(params: CreateOrUpdateFileInput) -> str:
    """Create a new file or update an existing file's content on a specific
    branch, as a single real commit. This makes a real commit -- use with intent.

    Args:
        params (CreateOrUpdateFileInput): owner, repo, path, content, message,
            branch, sha (required only when updating an existing file --
            call github_get_file_contents first to get the current sha)

    Returns:
        str: JSON with path, file_sha, file_url, commit_sha, commit_url.

    Error Handling:
        Returns a 409/422 error if "sha" is missing or stale for an existing
        file (someone else changed it since you read it) -- re-fetch and retry.
    """
    try:
        body: dict = {
            "message": params.message,
            "content": base64.b64encode(params.content.encode("utf-8")).decode("ascii"),
            "branch": params.branch,
        }
        if params.sha:
            body["sha"] = params.sha

        data = await github_request(
            f"/repos/{params.owner}/{params.repo}/contents/{params.path}",
            method="PUT",
            json_body=body,
        )
        output = {
            "path": data["content"]["path"],
            "file_sha": data["content"]["sha"],
            "file_url": data["content"]["html_url"],
            "commit_sha": data["commit"]["sha"],
            "commit_url": data["commit"]["html_url"],
        }
        return json.dumps(output, indent=2)
    except Exception as e:
        return handle_github_error(e, "github_create_or_update_file")
