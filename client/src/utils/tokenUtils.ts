/**
 * Token utility functions for proactive JWT refresh
 */

interface DecodedToken {
    sub: string;
    exp: number;
    iat: number;
}

/**
 * Decode a JWT token without verification (client-side only)
 */
export const decodeToken = (token: string): DecodedToken | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

/**
 * Get the expiration time of the token in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
    const decoded = decodeToken(token);
    if (!decoded) return null;
    return decoded.exp * 1000; // Convert seconds to milliseconds
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return true;
    return Date.now() >= expirationTime;
};

/**
 * Check if token should be refreshed (when 80% of its lifetime has passed)
 */
export const shouldRefreshToken = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    const issuedAt = decoded.iat * 1000;
    const expirationTime = decoded.exp * 1000;
    const tokenLifetime = expirationTime - issuedAt;
    const refreshThreshold = issuedAt + (tokenLifetime * 0.8); // Refresh at 80% of lifetime

    return Date.now() >= refreshThreshold;
};

/**
 * Get time until token should be refreshed (in milliseconds)
 */
export const getTimeUntilRefresh = (token: string): number => {
    const decoded = decodeToken(token);
    if (!decoded) return 0;

    const issuedAt = decoded.iat * 1000;
    const expirationTime = decoded.exp * 1000;
    const tokenLifetime = expirationTime - issuedAt;
    const refreshTime = issuedAt + (tokenLifetime * 0.8);

    const timeUntilRefresh = refreshTime - Date.now();
    return Math.max(0, timeUntilRefresh);
};
