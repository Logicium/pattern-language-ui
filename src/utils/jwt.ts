/**
 * JWT Token Utilities
 * Provides functions to decode and validate JWT tokens
 */

interface JWTPayload {
  sub: string | number
  email: string
  iat?: number // issued at
  exp?: number // expiration time
}

/**
 * Decodes a JWT token without verification
 * Returns null if the token is invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    if (!payload) {
      return null
    }
    
    const decoded = JSON.parse(atob(payload))
    return decoded as JWTPayload
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Checks if a JWT token is expired
 * Returns true if the token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  
  if (!decoded || !decoded.exp) {
    // If we can't decode or there's no expiration, consider it expired
    return true
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}

/**
 * Gets the expiration time of a token in milliseconds
 * Returns null if the token is invalid or has no expiration
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeJWT(token)
  
  if (!decoded || !decoded.exp) {
    return null
  }

  // Convert from seconds to milliseconds
  return decoded.exp * 1000
}

/**
 * Gets the time remaining until token expiration in milliseconds
 * Returns 0 if the token is expired or invalid
 */
export function getTimeUntilExpiration(token: string): number {
  const expirationTime = getTokenExpiration(token)
  
  if (!expirationTime) {
    return 0
  }

  const timeRemaining = expirationTime - Date.now()
  return Math.max(0, timeRemaining)
}
