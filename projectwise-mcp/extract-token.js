// Script to extract auth token from browser
// This will be executed in the browser context to get the OIDC token

// The token is typically stored in localStorage or sessionStorage by oidc-client-js
// The key format is usually: oidc.user:<authority>:<clientId>

const getTokenFromStorage = () => {
  const result = {
    localStorage: {},
    sessionStorage: {},
    accessToken: null,
    idToken: null,
    user: null,
    expiresAt: null
  };

  // Check localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('oidc') || key.includes('token') || key.includes('user') || key.includes('auth'))) {
      try {
        const value = localStorage.getItem(key);
        result.localStorage[key] = value;
        
        // Try to parse as JSON to extract token
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.access_token) {
              result.accessToken = parsed.access_token;
              result.idToken = parsed.id_token;
              result.user = parsed.profile;
              result.expiresAt = parsed.expires_at;
            }
          } catch (e) {
            // Not JSON, check if it looks like a token
            if (value.startsWith('eyJ')) {
              result.accessToken = value;
            }
          }
        }
      } catch (e) {
        console.error('Error reading localStorage key:', key, e);
      }
    }
  }

  // Check sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('oidc') || key.includes('token') || key.includes('user') || key.includes('auth'))) {
      try {
        const value = sessionStorage.getItem(key);
        result.sessionStorage[key] = value;
        
        // Try to parse as JSON to extract token
        if (value && !result.accessToken) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.access_token) {
              result.accessToken = parsed.access_token;
              result.idToken = parsed.id_token;
              result.user = parsed.profile;
              result.expiresAt = parsed.expires_at;
            }
          } catch (e) {
            // Not JSON, check if it looks like a token
            if (value.startsWith('eyJ')) {
              result.accessToken = value;
            }
          }
        }
      } catch (e) {
        console.error('Error reading sessionStorage key:', key, e);
      }
    }
  }

  return result;
};

// Execute and return the result
getTokenFromStorage();
