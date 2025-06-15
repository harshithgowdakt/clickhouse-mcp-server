# ClickHouse MCP Server Setup Guide

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **ClickHouse** database running locally or remotely
3. **Claude Desktop** application installed

### Tools

* `clickhouse_query`
  * Execute SQL queries on your ClickHouse cluster.
  * Input: `sql` (string): The SQL query to execute.

* `clickhouse_show_tables`
  * List all tables in the ClickHouse database.
  * Input: None.

* `clickhouse_describe_table`
  * Describe a table in the ClickHouse database.
  * Input: `table` (string): The name of the table to describe.


## Installation Steps

### 1. Install Dependencies
```bash
npm install @modelcontextprotocol/sdk @clickhouse/client typescript @types/node
```

### 2. Build the TypeScript
```bash
npm run build
```

### 3. Create the Server File
Copy the main server code into `index.js` and make it executable:
```bash
chmod +x dist/index.js
```

### 4. Configure Claude Desktop

1. Open the Claude Desktop configuration file located at:
   * On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   * On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

2. Add the following:

```json
{
  "mcpServers": {
    "clickhouse": {
      "command": "node",
      "args": ["/path/to/your/clickhouse-mcp-server/dist/index.js"],
      "env": {
        "CLICKHOUSE_HOST": "<clickhouse-host>",
        "CLICKHOUSE_PORT": "<clickhouse-port>",
        "CLICKHOUSE_USER": "<clickhouse-user>",
        "CLICKHOUSE_PASSWORD": "<clickhouse-password>",
        "CLICKHOUSE_SECURE": "true",
        "CLICKHOUSE_VERIFY": "true",
        "CLICKHOUSE_CONNECT_TIMEOUT": "30",
        "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
      }
    }
  }
}
```

Update the environment variables to point to your own ClickHouse service.

Or, if you'd like to try it out with the [ClickHouse SQL Playground](https://sql.clickhouse.com/), you can use the following config:

```json
{
  "mcpServers": {
    "clickhouse": {
      "command": "node",
      "args": ["/path/to/your/clickhouse-mcp-server/dist/index.js"],
      "env": {
        "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
        "CLICKHOUSE_PORT": "8443",
        "CLICKHOUSE_USER": "demo",
        "CLICKHOUSE_PASSWORD": "",
        "CLICKHOUSE_SECURE": "true",
        "CLICKHOUSE_VERIFY": "true",
        "CLICKHOUSE_CONNECT_TIMEOUT": "30",
        "CLICKHOUSE_SEND_RECEIVE_TIMEOUT": "30"
      }
    }
  }
}
```

**Important**: Update the path in the config to point to your actual `dist/index.js` file location.

### 6. Test the Server

Before configuring Claude Desktop, test the server locally:
```bash
node dist/index.js
```

The server should start and display "ClickHouse MCP server running on stdio".

### 7. Restart Claude Desktop

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