# ClickHouse MCP Server Setup Guide

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **ClickHouse** database running locally or remotely
3. **Claude Desktop** application installed

## Installation Steps

### 1. Install Dependencies
```bash
npm install @modelcontextprotocol/sdk @clickhouse/client typescript @types/node
```

### 2. Create the Server File
Copy the main server code into `index.js` and make it executable:
```bash
chmod +x dist/index.js
```

### 3. Configure Claude Desktop

#### On macOS:
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

#### On Windows:
Edit `%APPDATA%\Claude\claude_desktop_config.json`

Add the ClickHouse server configuration to your existing config or create a new one with the provided JSON.

**Important**: Update the path in the config to point to your actual `index.js` file location.

### 6. Environment Variables

Set your ClickHouse connection details through environment variables or update them directly in the Claude Desktop config:

- `CLICKHOUSE_HOST`: Your ClickHouse server URL (default: http://localhost:8123)
- `CLICKHOUSE_USERNAME`: Username (default: default)
- `CLICKHOUSE_PASSWORD`: Password (default: empty)
- `CLICKHOUSE_DATABASE`: Database name (default: default)

### 7. Test the Server

Before configuring Claude Desktop, test the server locally:
```bash
node dist/index.js
```

The server should start and display "ClickHouse MCP server running on stdio".

### 8. Restart Claude Desktop

After updating the configuration, restart Claude Desktop for the changes to take effect.

## Available Tools

Once configured, Claude will have access to these ClickHouse tools:

1. **clickhouse_query**: Execute SELECT queries
3. **clickhouse_show_tables**: List all tables
4. **clickhouse_describe_table**: Get table schema

## Example Usage

After setup, you can ask Claude to:
- "Show me all tables in the ClickHouse database"
- "Query the user_events table for today's data"

## Security Notes
- The server only allows SELECT queries for the query tool
- Consider setting up proper authentication for your ClickHouse instance
- Use environment variables for sensitive credentials
- Restrict network access to your ClickHouse server as needed

## Troubleshooting

1. **Connection Issues**: Check your ClickHouse server is running and accessible
2. **Permission Errors**: Ensure the Node.js script has proper file permissions
3. **Config Issues**: Verify the path in Claude Desktop config points to the correct file
4. **Dependencies**: Make sure all npm packages are properly installed