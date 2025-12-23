# ProjectWise MCP Server

An **STDIO-based MCP server** for VS Code that integrates with **Bentley ProjectWise** via the **Web Services Gateway (WSG) REST API**.

## Features

- 🔌 **STDIO Transport** - Secure subprocess communication with VS Code
- 📁 **Folder Operations** - List and navigate folder hierarchies
- 📄 **Document Operations** - List, search, and get document metadata
- 🏗️ **Project Listing** - View all projects in a repository
- 📊 **Repository Info** - Get repository connection details

## Prerequisites

- **Node.js** 18+ and **npm**
- **VS Code** with MCP client support (GitHub Copilot or compatible extension)
- Access to a **ProjectWise WSG** deployment

## Quick Start

### 1. Install Dependencies

```bash
cd projectwise-mcp
npm install
```

### 2. Build the Server

```bash
npm run build
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `PW_WSG_BASE_URL` | WSG base URL (e.g., `https://server/ws/v2.8`) |
| `PW_REPOSITORY_ID` | Repository/datasource GUID |
| `PW_TOKEN` | Bearer token from Bentley IMS |

Authentication is token-only; Basic authentication has been removed.

### 4. Test the Server

```bash
# Run in development mode
npm run dev

# Or run the built version
npm start
```

## VS Code Integration

The `.vscode/mcp.json` file is pre-configured. VS Code will prompt you for credentials when starting the server.

### Manual Configuration

If you need to configure manually, add to your VS Code settings:

```json
{
  "mcp.servers": {
    "projectwise": {
      "type": "stdio",
      "command": "node",
      "args": ["<path-to>/projectwise-mcp/dist/server.js"],
      "env": {
        "PW_WSG_BASE_URL": "https://your-server/ws/v2.8",
        "PW_REPOSITORY_ID": "your-repo-guid",
        "PW_TOKEN": "your-bentley-ims-token"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_folders` | List folders (root or by parent ID) |
| `list_documents` | List documents in a folder |
| `get_document` | Get document metadata by ID |
| `search_documents` | Search documents by name pattern |
| `get_folder` | Get folder metadata by ID |
| `list_projects` | List all projects |
| `get_repository_info` | Get repository information |

## Development

```bash
# Watch mode for TypeScript
npm run watch

# Run with tsx (auto-reloads)
npm run dev
```

## WSG API Reference

- **Authentication Headers**:
  - `Authorization`: Bearer token
  - `Mas-App-Guid`: Application identifier
  - `Mas-Uuid`: Session identifier

- **OData Query Support**: The WSG API supports `$filter`, `$select`, `$top`, `$skip`, and `$orderby` parameters.

## Troubleshooting

### Connection Issues

1. Verify `PW_WSG_BASE_URL` is correct and accessible
2. Check firewall/VPN settings
3. Ensure the repository ID exists

### Authentication Errors

- **401 Unauthorized**: Check credentials
- **403 Forbidden**: Verify user has repository access
- For cloud: Ensure token is valid and not expired

### Logs

Logs are written to `stderr` (required for STDIO transport). In VS Code, check the Output panel for the MCP server.

## License

ISC
