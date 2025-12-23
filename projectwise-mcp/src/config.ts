import crypto from 'crypto';

/**
 * ProjectWise WSG Client Configuration
 */
export interface ProjectWiseConfig {
  /** Base URL for WSG (e.g., "https://your-server/ws/v2.8") */
  baseUrl: string;
  
  /** ProjectWise Repository ID (datasource GUID) */
  repositoryId: string;

  /** Bearer token from Bentley IMS */
  token: string;
  
  /** Required: Application GUID (Mas-App-Guid header) */
  appGuid: string;
  
  /** Required: Unique session ID (Mas-Uuid header) */
  sessionUuid: string;
}

/**
 * Environment variable configuration loader
 */
export function loadConfigFromEnv(): ProjectWiseConfig {
  const baseUrl = process.env.PW_WSG_BASE_URL;
  const repositoryId = process.env.PW_REPOSITORY_ID;
  const token = process.env.PW_TOKEN;
  const appGuid = process.env.PW_APP_GUID || 'projectwise-mcp-server';
  const sessionUuid = process.env.PW_SESSION_UUID || crypto.randomUUID();

  if (!baseUrl) {
    throw new Error('PW_WSG_BASE_URL environment variable is required');
  }
  if (!repositoryId) {
    throw new Error('PW_REPOSITORY_ID environment variable is required');
  }
  if (!token) {
    throw new Error('PW_TOKEN is required for token authentication');
  }

  const config: ProjectWiseConfig = {
    baseUrl,
    repositoryId,
    token,
    appGuid,
    sessionUuid,
  };

  return config;
}
