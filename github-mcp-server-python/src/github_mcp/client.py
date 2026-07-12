"""Shared GitHub REST + GraphQL client, auth, and error handling.

All tool modules go through the functions in this file rather than
constructing their own httpx clients, so auth headers, timeouts, and
error formatting stay consistent across every tool.
"""

from __future__ import annotations

import os
from typing import Any, Optional

import httpx

from .constants import API_VERSION, CHARACTER_LIMIT, GITHUB_API_URL, GITHUB_GRAPHQL_URL


class GitHubConfigError(RuntimeError):
    """Raised when GITHUB_TOKEN is missing at call time."""


def _get_token() -> str:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise GitHubConfigError(
            "GITHUB_TOKEN environment variable is not set. "
            "Set it to a GitHub personal access token before starting this server."
        )
    return token


def _rest_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {_get_token()}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": API_VERSION,
    }


def _graphql_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {_get_token()}",
        "Content-Type": "application/json",
    }


async def github_request(
    endpoint: str,
    method: str = "GET",
    json_body: Optional[dict[str, Any]] = None,
    params: Optional[dict[str, Any]] = None,
) -> Any:
    """Make an authenticated REST request against the GitHub API.

    Args:
        endpoint: Path beginning with "/", e.g. "/repos/{owner}/{repo}".
        method: HTTP method.
        json_body: JSON request body, if any.
        params: Query string parameters, if any (None values are dropped).

    Returns:
        The parsed JSON response body.

    Raises:
        httpx.HTTPStatusError: on non-2xx responses.
        GitHubConfigError: if GITHUB_TOKEN is not set.
    """
    clean_params = {k: v for k, v in (params or {}).items() if v is not None}
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(
            method,
            f"{GITHUB_API_URL}{endpoint}",
            headers=_rest_headers(),
            json=json_body,
            params=clean_params,
        )
        response.raise_for_status()
        if response.status_code == 204 or not response.content:
            return {}
        return response.json()


async def github_graphql(query: str, variables: dict[str, Any]) -> dict[str, Any]:
    """Make an authenticated GraphQL request against the GitHub API.

    Used for the handful of operations the REST API doesn't expose,
    such as converting a draft PR to ready-for-review.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            GITHUB_GRAPHQL_URL,
            headers=_graphql_headers(),
            json={"query": query, "variables": variables},
        )
        response.raise_for_status()
        body = response.json()
        if body.get("errors"):
            messages = "; ".join(e.get("message", str(e)) for e in body["errors"])
            raise RuntimeError(f"GitHub GraphQL error: {messages}")
        return body["data"]


def handle_github_error(error: Exception, context: str = "") -> str:
    """Format any exception raised by github_request/github_graphql into an
    actionable error string, consistent across all tools."""
    prefix = f"Error ({context}): " if context else "Error: "

    if isinstance(error, GitHubConfigError):
        return f"{prefix}{error}"

    if isinstance(error, httpx.HTTPStatusError):
        status = error.response.status_code
        try:
            api_message = error.response.json().get("message")
        except Exception:
            api_message = None

        if status == 401:
            return f"{prefix}Authentication failed (401). Check that GITHUB_TOKEN is set and valid."
        if status == 403:
            suffix = f": {api_message}" if api_message else ""
            return (
                f"{prefix}Permission denied or rate limited (403){suffix}. "
                "Check the token has the required scopes (repo / contents / pull-requests) "
                "for this repository."
            )
        if status == 404:
            return (
                f"{prefix}Not found (404). Check the owner/repo/branch/PR number is correct "
                "and the token has access to it."
            )
        if status == 409:
            suffix = f": {api_message}" if api_message else ""
            return (
                f"{prefix}Conflict (409){suffix}. This often means a branch/file SHA is out of "
                "date, or a merge conflict exists."
            )
        if status == 422:
            suffix = f": {api_message}" if api_message else ""
            return (
                f"{prefix}Validation failed (422){suffix}. Check the request parameters "
                "(e.g. branch already exists, PR already open for this head/base pair)."
            )
        suffix = f": {api_message}" if api_message else ""
        return f"{prefix}GitHub API request failed with status {status}{suffix}"

    if isinstance(error, httpx.TimeoutException):
        return f"{prefix}Request timed out. Please try again."

    return f"{prefix}{type(error).__name__}: {error}"


def truncate_text(text: str, limit: int = CHARACTER_LIMIT) -> tuple[str, bool]:
    """Truncate text to at most `limit` characters, returning (text, was_truncated)."""
    if len(text) <= limit:
        return text, False
    remaining = len(text) - limit
    return (
        f"{text[:limit]}\n\n[...truncated, {remaining} more characters. "
        "Narrow your query or use pagination.]",
        True,
    )
