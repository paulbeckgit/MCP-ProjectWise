# PowerShell script to extract token from browser using Edge DevTools Protocol
# The token is stored in localStorage/sessionStorage after OIDC login

# Since we can't directly execute JS from the MCP browser tools,
# we'll need to intercept the token from network requests or use a different approach.

# The token format for Bentley IMS is stored with key pattern:
# oidc.user:https://imsoidc.bentley.com:spa-RYpfS7wXq0fBkXP3gLy5yQvCQ

Write-Host "To extract the auth token, please:"
Write-Host "1. Open browser Developer Tools (F12)"
Write-Host "2. Go to Application tab -> Local Storage"
Write-Host "3. Look for keys starting with 'oidc.user:'"
Write-Host "4. Copy the JSON value and save to login/auth-token.json"
Write-Host ""
Write-Host "Alternatively, go to Network tab and look for any API request"
Write-Host "The Authorization header will contain 'Bearer <token>'"
