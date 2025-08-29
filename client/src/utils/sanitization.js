/**
 * Input Sanitization Utilities
 * Provides functions to sanitize user input and prevent XSS attacks
 */

// Constants for validation limits
const MIN_PHONE_LENGTH = 10;
const MAX_PHONE_LENGTH = 15;
const MAX_FILENAME_LENGTH = 255;
const MAX_SEARCH_TERM_LENGTH = 100;

// DOMPurify alternative - lightweight HTML sanitizer
const createHTMLSanitizer = () => {
  // Create a temporary element to test for potential XSS
  const temp = document.createElement('div');

  const sanitizeHTML = input => {
    if (typeof input !== 'string') return '';

    // Remove script tags and event handlers
    const sanitized = input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '')
      .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:(?!image)/gi, '');

    // Test with temporary element
    temp.innerHTML = sanitized;
    return temp.textContent || temp.innerText || '';
  };

  return { sanitizeHTML };
};

// Text sanitization for user inputs
export const sanitizeText = input => {
  if (typeof input !== 'string') return '';

  return input.trim().replace(/[<>'"&]/g, match => {
    const replacements = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return replacements[match];
  });
};

// Email sanitization
export const sanitizeEmail = email => {
  if (typeof email !== 'string') return '';

  // Basic email pattern - more restrictive than full RFC 5322
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const cleaned = email.trim().toLowerCase();

  return emailPattern.test(cleaned) ? cleaned : '';
};

// Phone number sanitization
export const sanitizePhone = phone => {
  if (typeof phone !== 'string') return '';

  // Remove all non-digit characters except + at the beginning
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Basic validation - should start with + or digit, and be reasonable length
  if (cleaned.length >= MIN_PHONE_LENGTH && cleaned.length <= MAX_PHONE_LENGTH) {
    return cleaned;
  }

  return '';
};

// Number sanitization
export const sanitizeNumber = (input, options = {}) => {
  const { min, max, decimals = 2 } = options;

  if (typeof input === 'number') {
    return isNaN(input) ? 0 : Number(input.toFixed(decimals));
  }

  if (typeof input !== 'string') return 0;

  // Remove all non-numeric characters except decimal point and minus sign
  const cleaned = input.replace(/[^\d.-]/g, '');
  const number = parseFloat(cleaned);

  if (isNaN(number)) return 0;

  let result = Number(number.toFixed(decimals));

  if (typeof min === 'number' && result < min) result = min;
  if (typeof max === 'number' && result > max) result = max;

  return result;
};

// URL sanitization
export const sanitizeURL = url => {
  if (typeof url !== 'string') return '';

  try {
    const urlObj = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    return urlObj.toString();
  } catch (error) {
    return '';
  }
};

// File name sanitization
export const sanitizeFileName = fileName => {
  if (typeof fileName !== 'string') return '';

  // Remove dangerous characters and limit length
  return fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // eslint-disable-line no-control-regex
    .replace(/\.$/, '') // Remove trailing dot
    .trim()
    .substring(0, MAX_FILENAME_LENGTH);
};

// SQL injection prevention for search terms
export const sanitizeSearchTerm = term => {
  if (typeof term !== 'string') return '';

  return term
    .trim()
    .replace(/['"`;\\]/g, '') // Remove SQL special characters
    .substring(0, MAX_SEARCH_TERM_LENGTH); // Limit length
};

// HTML content sanitizer (when you need to preserve some HTML)
export const sanitizeHTMLContent = html => {
  if (typeof html !== 'string') return '';

  const { sanitizeHTML } = createHTMLSanitizer();
  return sanitizeHTML(html);
};

// Form data sanitizer
export const sanitizeFormData = (formData, schema = {}) => {
  const sanitized = {};

  Object.keys(formData).forEach(key => {
    const value = formData[key];
    const fieldSchema = schema[key] || {};

    switch (fieldSchema.type) {
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'phone':
        sanitized[key] = sanitizePhone(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value, fieldSchema.options);
        break;
      case 'url':
        sanitized[key] = sanitizeURL(value);
        break;
      case 'fileName':
        sanitized[key] = sanitizeFileName(value);
        break;
      case 'search':
        sanitized[key] = sanitizeSearchTerm(value);
        break;
      case 'html':
        sanitized[key] = sanitizeHTMLContent(value);
        break;
      default:
        sanitized[key] = sanitizeText(value);
    }
  });

  return sanitized;
};

// Validation helpers
export const validateInput = (value, rules = {}) => {
  const errors = [];

  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('This field is required');
  }

  if (rules.minLength && value && value.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  if (rules.maxLength && value && value.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    errors.push(rules.patternMessage || 'Invalid format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all utilities as named exports
const sanitizationUtils = {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizeURL,
  sanitizeFileName,
  sanitizeSearchTerm,
  sanitizeHTMLContent,
  sanitizeFormData,
  validateInput
};

export default sanitizationUtils;
