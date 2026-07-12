"""Shared constants for the GitHub MCP server."""

GITHUB_API_URL = "https://api.github.com"
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
API_VERSION = "2022-11-28"

# Maximum size (in characters) of a single tool response before truncation.
CHARACTER_LIMIT = 25_000

DEFAULT_PER_PAGE = 30
MAX_PER_PAGE = 100
