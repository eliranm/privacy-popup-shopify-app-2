import crypto from 'crypto';

/**
 * Verify HMAC signature for webhooks and OAuth callbacks
 * @param {string} data - Raw request body or query string
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - App secret key
 * @returns {boolean} - True if signature is valid
 */
export function verifyHmac(data, signature, secret) {
  if (!data || !signature || !secret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const computedSignature = hmac.digest('base64');
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'base64'),
      Buffer.from(computedSignature, 'base64')
    );
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Verify OAuth callback HMAC
 * @param {Object} query - Query parameters from OAuth callback
 * @param {string} secret - App secret key
 * @returns {boolean} - True if signature is valid
 */
export function verifyOAuthHmac(query, secret) {
  const { hmac, ...params } = query;
  
  if (!hmac) {
    return false;
  }

  // Create query string from parameters (excluding hmac)
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return verifyHmac(sortedParams, hmac, secret);
}

/**
 * Generate a secure session secret
 * @returns {string} - Random session secret
 */
export function generateSessionSecret() {
  return crypto.randomBytes(32).toString('hex');
}
