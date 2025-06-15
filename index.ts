import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient, ClickHouseClient } from "@clickhouse/client";

class ClickHouseMCPServer {
  private server: Server;
  private clickhouse: ClickHouseClient;

  constructor() {
    this.server = new Server(
      {
        name: "clickhouse-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.setupToolHandlers();
  }

  async initializeClickHouse() {
    if (!this.clickhouse) {
      this.clickhouse = createClient({
        host: process.env.CLICKHOUSE_HOST,
        username: process.env.CLICKHOUSE_USERNAME,
        password: process.env.CLICKHOUSE_PASSWORD,
        database: process.env.CLICKHOUSE_DATABASE,
      });
    }
    return this.clickhouse;
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "clickhouse_query",
            description: "Execute a SELECT query on ClickHouse database",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "SQL SELECT query to execute",
                },
                format: {
                  type: "string",
                  description: "Output format (JSON, TabSeparated, CSV, etc.)",
                  default: "JSON",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "clickhouse_insert",
            description: "Insert data into ClickHouse table",
            inputSchema: {
              type: "object",
              properties: {
                table: {
                  type: "string",
                  description: "Table name to insert data into",
                },
                data: {
                  type: "array",
                  description: "Array of objects representing rows to insert",
                  items: {
                    type: "object",
                  },
                },
              },
              required: ["table", "data"],
            },
          },
          {
            name: "clickhouse_show_tables",
            description: "List all tables in the ClickHouse database",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "clickhouse_describe_table",
            description: "Get table schema and structure",
            inputSchema: {
              type: "object",
              properties: {
                table: {
                  type: "string",
                  description: "Table name to describe",
                },
              },
              required: ["table"],
            },
          },
          {
            name: "clickhouse_create_table",
            description: "Create a new table in ClickHouse",
            inputSchema: {
              type: "object",
              properties: {
                tableName: {
                  type: "string",
                  description: "Name of the table to create",
                },
                schema: {
                  type: "string",
                  description: "CREATE TABLE SQL statement",
                },
              },
              required: ["tableName", "schema"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const client = await this.initializeClickHouse();

        switch (name) {
          case "clickhouse_query":
            return await this.handleQuery(client, args);

          case "clickhouse_show_tables":
            return await this.handleShowTables(client);

          case "clickhouse_describe_table":
            return await this.handleDescribeTable(client, args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `ClickHouse operation failed: ${error.message}`
        );
      }
    });
  }

  async handleQuery(client: ClickHouseClient, args: any) {
    const { query, format = "JSON" } = args;

    // Security check - only allow SELECT statements
    if (!query.trim().toLowerCase().startsWith("select")) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Only SELECT queries are allowed"
      );
    }

    const result = await client.query({
      query,
      format,
    });

    const data = await result.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }

  async handleShowTables(client: ClickHouseClient) {
    const result = await client.query({
      query: "SHOW TABLES",
      format: "JSON",
    });

    const tables = await result.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(tables, null, 2),
        },
      ],
    };
  }

  async handleDescribeTable(client: ClickHouseClient, args: any) {
    const { table } = args;

    const result = await client.query({
      query: `DESCRIBE TABLE ${table}`,
      format: "JSON",
    });

    const schema = await result.json();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("ClickHouse MCP server running on stdio");
  }
}

const server = new ClickHouseMCPServer();
server.run().catch(console.error);
