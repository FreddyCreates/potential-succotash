"""Importing this package registers every tool module's @mcp.tool decorators
against the shared FastMCP instance in github_mcp.app."""

from . import branches, commits, files, pulls, repos  # noqa: F401
