export function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function getJWTExpiration(token) {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  // JWT exp is in seconds, convert to milliseconds
  return decoded.exp * 1000;
}

export function checkJWTStatus(token, bufferSeconds = 0) {
  const expirationTime = getJWTExpiration(token);
  if (!expirationTime) {
    return { isExpired: true, expiresAt: null, timeUntilExpiration: 0 };
  }
  
  const now = Date.now();
  const timeUntilExpiration = expirationTime - now - (bufferSeconds * 1000);
  const isExpired = timeUntilExpiration <= 0;
  
  return {
    isExpired,
    expiresAt: expirationTime,
    timeUntilExpiration: Math.max(0, timeUntilExpiration)
  };
}