"""Shared FastMCP server instance.

Tool modules import `mcp` from here and register themselves via the
`@mcp.tool` decorator at import time. `server.py` imports the tools
package (for its registration side effects) and runs the server.
"""

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("github_mcp")
