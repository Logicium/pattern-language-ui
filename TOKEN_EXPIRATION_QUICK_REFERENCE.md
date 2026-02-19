# Quick Reference: Token Expiration Handling

## For Developers

### How to Test the Fix

#### Test 1: Expired Token Detection on App Load
```javascript
// In browser console:
// 1. Login normally first
// 2. Run this to create an expired token:
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImV4cCI6MTYwOTQ1OTIwMH0.FAKE_SIGNATURE'
localStorage.setItem('auth_token', expiredToken)
// 3. Refresh the page
// 4. You should be logged out and see the login page
```

#### Test 2: Token Expiration During Navigation
```javascript
// In browser console while logged in:
// 1. Navigate to a page
// 2. Run this:
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImV4cCI6MTYwOTQ1OTIwMH0.FAKE_SIGNATURE'
localStorage.setItem('auth_token', expiredToken)
// 3. Try to navigate to /dashboard
// 4. You should be redirected to /login
```

#### Test 3: Rapid Expiration for Testing
```typescript
// In pattern-language-service/src/auth/auth.module.ts
// Change the token expiration to 30 seconds:
signOptions: { expiresIn: '30s' }
// Restart the service, login, wait 31 seconds, try to use the app
```

### Using the JWT Utilities

```typescript
import { isTokenExpired, decodeJWT, getTimeUntilExpiration } from '@/utils/jwt'

// Check if token is expired
const token = localStorage.getItem('auth_token')
if (token && isTokenExpired(token)) {
  console.log('Token is expired!')
}

// Decode token to inspect payload
const payload = decodeJWT(token)
console.log('User ID:', payload?.sub)
console.log('Email:', payload?.email)

// Check how much time is left
const timeLeft = getTimeUntilExpiration(token)
console.log(`Token expires in ${Math.floor(timeLeft / 1000)} seconds`)
```

### Auth Store Methods

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Check if user is authenticated (includes expiration check)
if (authStore.isAuthenticated) {
  console.log('User is logged in with valid token')
}

// Manually check token validity
if (authStore.checkTokenValidity()) {
  console.log('Token is valid')
} else {
  console.log('Token is invalid or expired')
}

// Logout user
authStore.logout()
```

## Common Scenarios

### Scenario: User's Session Expired
**What happens:**
1. User returns to app after 8 days (token expires after 7 days)
2. Auth store detects expired token on initialization
3. Token and user data are cleared from localStorage
4. User is redirected to login page

**User sees:** Login page with option to sign in again

### Scenario: API Request with Expired Token
**What happens:**
1. User tries to save a playbook
2. API service checks token before making request
3. Token is expired
4. User is logged out and redirected to login
5. Error message: "Session expired. Please login again."

**User sees:** Login page with error message

### Scenario: Server Rejects Expired Token
**What happens:**
1. Token was valid when frontend checked (edge case)
2. Token expired before server processed request
3. Server returns 401 Unauthorized
4. API service catches 401
5. User is logged out and redirected to login

**User sees:** Login page with error message

## Debugging

### Check Token in Console
```javascript
// Get current token
const token = localStorage.getItem('auth_token')
console.log('Token:', token)

// Decode token
const parts = token?.split('.')
if (parts && parts[1]) {
  const payload = JSON.parse(atob(parts[1]))
  console.log('Payload:', payload)
  console.log('Expires:', new Date(payload.exp * 1000))
  console.log('Is expired:', payload.exp * 1000 < Date.now())
}
```

### Check Auth State
```javascript
// In Vue component
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
console.log('Token:', authStore.token)
console.log('User:', authStore.user)
console.log('Is authenticated:', authStore.isAuthenticated)
```

### Enable Debug Logging
The implementation includes console.log statements:
- "Token expired on initialization, clearing auth state"
- "Token expired, redirecting to login"
- "Received 401 Unauthorized, clearing auth and redirecting to login"

Check browser console for these messages.

## Configuration

### Backend Token Expiration
File: `pattern-language-service/src/auth/auth.module.ts`

```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: '7d' }, // Change this value
  }),
})
```

Valid expiration formats:
- `'7d'` - 7 days
- `'24h'` - 24 hours
- `'60m'` - 60 minutes
- `'3600s'` - 3600 seconds
- `3600` - 3600 seconds (number)

## Error Messages

| Message | Meaning | Action |
|---------|---------|--------|
| "Session expired. Please login again." | Token is expired or invalid | User redirected to login |
| "API error: Unauthorized" | Generic 401 error | User redirected to login |
| "Failed to decode JWT" | Token is malformed | Token is treated as expired |

## Integration with Existing Code

### No Breaking Changes
- Existing login/signup flows work as before
- Existing API calls work as before
- Existing route guards work as before
- Only adds token expiration handling

### Automatic Logout Triggers
1. Token expired when app loads
2. Token expired during navigation
3. Token expired before API request
4. Server returns 401 Unauthorized

All triggers result in:
1. Token removed from localStorage
2. User data removed from localStorage
3. Auth store state cleared
4. Redirect to `/login`

## Best Practices

1. **Don't store sensitive data in localStorage** - Tokens are already there, but avoid storing other sensitive info
2. **Always use the auth store** - Don't directly manipulate localStorage for auth
3. **Handle errors gracefully** - API calls may throw "Session expired" errors
4. **Test token expiration** - Use short expiration times during development

## Support

If users report being logged out unexpectedly:
1. Check token expiration setting (should be 7 days)
2. Verify system clocks are correct
3. Check browser console for debug messages
4. Verify JWT_SECRET hasn't changed on server
