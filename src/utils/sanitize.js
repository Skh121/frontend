import DOMPurify from 'dompurify';

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} dirty - Potentially unsafe HTML string
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
};

/**
 * Sanitize user input (remove all HTML)
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHTML = (text) => {
  if (typeof text !== 'string') return text;

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if unsafe
 */
export const sanitizeURL = (url) => {
  if (typeof url !== 'string') return '';

  const trimmedURL = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmedURL.startsWith('javascript:') ||
    trimmedURL.startsWith('data:') ||
    trimmedURL.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
};

export default {
  sanitizeHTML,
  sanitizeInput,
  escapeHTML,
  sanitizeURL,
};
