#!/usr/bin/env node
/**
 * ProjectWise MCP Server (STDIO Transport)
 * 
 * This server integrates with Bentley ProjectWise via the WSG REST API,
 * exposing ProjectWise operations as MCP tools for VS Code agents.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadConfigFromEnv, ProjectWiseConfig } from './config.js';
import { ProjectWiseClient } from './projectwise-client.js';

// ─────────────────────────────────────────────────────────────────────────────
// Logging helper: STDIO requires logs go to stderr, not stdout
// ─────────────────────────────────────────────────────────────────────────────
function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, data };
  console.error(JSON.stringify(logEntry));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Server Setup
// ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  log('info', 'Starting ProjectWise MCP Server...');

  // Load configuration from environment
  let config: ProjectWiseConfig;
  let pwClient: ProjectWiseClient;

  try {
    config = loadConfigFromEnv();
    pwClient = new ProjectWiseClient(config);
    log('info', 'Configuration loaded successfully', {
      baseUrl: config.baseUrl,
      repositoryId: config.repositoryId,
    });
  } catch (error) {
    log('error', 'Failed to load configuration', { error: String(error) });
    process.exit(1);
  }

  // Create MCP server instance
  const server = new McpServer({
    name: 'projectwise-mcp',
    version: '1.0.0',
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: list_folders
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'list_folders',
    'List folders in ProjectWise. If parentId is omitted, lists root folders.',
    {
      parentId: z.string().optional().describe('Parent folder GUID (omit for root folders)'),
    },
    async ({ parentId }) => {
      try {
        log('info', 'Listing folders', { parentId });
        const result = await pwClient.listFolders(parentId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to list folders', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error listing folders: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: list_documents
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'list_documents',
    'List documents in a ProjectWise folder.',
    {
      folderId: z.string().describe('Folder GUID to list documents from'),
    },
    async ({ folderId }) => {
      try {
        log('info', 'Listing documents', { folderId });
        const result = await pwClient.listDocuments(folderId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to list documents', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error listing documents: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: get_document
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'get_document',
    'Get metadata for a specific document in ProjectWise.',
    {
      documentId: z.string().describe('Document GUID'),
    },
    async ({ documentId }) => {
      try {
        log('info', 'Getting document', { documentId });
        const result = await pwClient.getDocument(documentId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to get document', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error getting document: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: search_documents
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'search_documents',
    'Search for documents by name pattern in ProjectWise.',
    {
      namePattern: z.string().describe('Search pattern (partial name match)'),
      maxResults: z.number().optional().default(50).describe('Maximum results to return'),
    },
    async ({ namePattern, maxResults }) => {
      try {
        log('info', 'Searching documents', { namePattern, maxResults });
        const result = await pwClient.searchDocuments(namePattern, maxResults);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to search documents', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error searching documents: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: get_folder
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'get_folder',
    'Get metadata for a specific folder in ProjectWise.',
    {
      folderId: z.string().describe('Folder GUID'),
    },
    async ({ folderId }) => {
      try {
        log('info', 'Getting folder', { folderId });
        const result = await pwClient.getFolder(folderId);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to get folder', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error getting folder: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: list_projects
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'list_projects',
    'List all projects in the ProjectWise repository.',
    {},
    async () => {
      try {
        log('info', 'Listing projects');
        const result = await pwClient.listProjects();
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to list projects', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error listing projects: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Tool: get_repository_info
  // ───────────────────────────────────────────────────────────────────────────
  server.tool(
    'get_repository_info',
    'Get information about the connected ProjectWise repository.',
    {},
    async () => {
      try {
        log('info', 'Getting repository info');
        const result = await pwClient.getRepository();
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        log('error', 'Failed to get repository info', { error: String(error) });
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error getting repository info: ${error}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Connect transport and start server
  // ───────────────────────────────────────────────────────────────────────────
  const transport = new StdioServerTransport();
  
  log('info', 'Connecting STDIO transport...');
  await server.connect(transport);
  log('info', 'ProjectWise MCP Server is running (STDIO mode)');

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    log('info', 'Received SIGINT, shutting down...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    log('info', 'Received SIGTERM, shutting down...');
    await server.close();
    process.exit(0);
  });
}

// Run the server
main().catch((error) => {
  log('error', 'Fatal error starting server', { error: String(error) });
  process.exit(1);
});
