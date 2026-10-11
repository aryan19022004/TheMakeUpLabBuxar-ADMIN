import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'admin_token';
export const EXPIRY_KEY = 'admin_token_expiry';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Pure JavaScript base64url decoding (no DOM/atob dependency)
 */
function decodeBase64Url(base64Url: string): string {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    base64 = String(base64).replace(/=+$/, '');
    for (let bc = 0, bs = 0, buffer, idx = 0; (buffer = base64.charAt(idx++)); ) {
      const bIndex = chars.indexOf(buffer);
      if (~bIndex) {
        bs = bc % 4 ? bs * 64 + bIndex : bIndex;
        if (bc++ % 4) {
          output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
        }
      }
    }
    return output;
  } catch (err) {
    return '';
  }
}

/**
 * Checks if a JWT token or stored expiry timestamp is expired.
 */
export function isTokenExpired(token: string | null, expiryTimestamp?: number | null): boolean {
  if (!token) return true;

  // 1. Check stored expiry timestamp if present
  if (expiryTimestamp && typeof expiryTimestamp === 'number') {
    if (Date.now() >= expiryTimestamp) {
      return true;
    }
  }

  // 2. Decode JWT payload to check exact 'exp' claim
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const decodedPayload = decodeBase64Url(parts[1]);
      if (decodedPayload) {
        const parsed = JSON.parse(decodedPayload);
        if (parsed && typeof parsed.exp === 'number') {
          // parsed.exp is in seconds, Date.now() is in milliseconds
          const expMs = parsed.exp * 1000;
          return Date.now() >= expMs;
        }
      }
    }
  } catch (err) {
    return true;
  }

  return false;
}

/**
 * Stores token and its expiry timestamp (7 days or parsed from JWT).
 */
export async function saveAuthToken(token: string, expiresAt?: number): Promise<void> {
  let expiry = expiresAt;

  if (!expiry) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(decodeBase64Url(parts[1]));
        if (decoded?.exp) {
          expiry = decoded.exp * 1000;
        }
      }
    } catch {}
  }

  // Fallback to 7 days from now
  if (!expiry) {
    expiry = Date.now() + SEVEN_DAYS_MS;
  }

  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem(EXPIRY_KEY, String(expiry)),
  ]);
}

/**
 * Retrieves valid token. If expired or missing, purges storage and returns null.
 */
export async function getValidAuthToken(): Promise<string | null> {
  try {
    const [token, expiryStr] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(EXPIRY_KEY),
    ]);

    const expiry = expiryStr ? parseInt(expiryStr, 10) : null;

    if (!token) return null;

    if (isTokenExpired(token, expiry)) {
      console.log('Stored admin token is expired. Purging from storage.');
      await clearAuthToken();
      return null;
    }

    return token;
  } catch (err) {
    console.error('Error checking auth token:', err);
    await clearAuthToken();
    return null;
  }
}

/**
 * Clears token and expiry from AsyncStorage.
 */
export async function clearAuthToken(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(EXPIRY_KEY),
    ]);
  } catch (e) {
    console.error('Error clearing auth token:', e);
  }
}
