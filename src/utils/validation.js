/**
 * Utility functions for validating Email and Mobile Numbers across the application.
 */

// Email regex check
export const isValidEmail = (email) => {
  if (!email || !email.trim()) return true; // Empty is considered valid if optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Strict Email validation (for required email fields like login/signup)
export const isRequiredEmailValid = (email) => {
  if (!email || !email.trim()) return false;
  return isValidEmail(email);
};

/**
 * Mobile number check:
 * Validates that the actual mobile number contains exactly 10 digits,
 * after accounting for optional country code (+91, 91, or leading 0).
 */
export const isValidMobile = (phone) => {
  if (!phone || !phone.trim() || phone.trim() === "+91-") return true; // Empty is valid if optional
  let cleanDigits = phone.replace(/\D/g, "");
  // If starts with 91 (country code) and length is greater than 10, strip 91
  if (cleanDigits.length > 10 && cleanDigits.startsWith("91")) {
    cleanDigits = cleanDigits.slice(2);
  } else if (cleanDigits.length > 10 && cleanDigits.startsWith("0")) {
    cleanDigits = cleanDigits.slice(1);
  }
  return cleanDigits.length === 10;
};

/**
 * Sanitize Mobile Input:
 * Allows user to freely edit, add, or remove "+91-" or any country code.
 * Restricts input length so user cannot type an 11th digit after +91- (max 14 chars)
 * or more than 10 pure digits without prefix.
 */
export const sanitizeMobileInput = (val) => {
  if (!val) return "";
  let sanitized = val.replace(/[^0-9+-]/g, "");

  if (sanitized.startsWith("+91-")) {
    // "+91-" (4 chars) + 10 digits = max 14 chars
    if (sanitized.length > 14) {
      sanitized = sanitized.slice(0, 14);
    }
  } else if (sanitized.startsWith("+91")) {
    // "+91" (3 chars) + 10 digits = max 13 chars
    if (sanitized.length > 13) {
      sanitized = sanitized.slice(0, 13);
    }
  } else if (!sanitized.startsWith("+")) {
    // Pure digits without country code: max 10 digits
    let digitsOnly = sanitized.replace(/\D/g, "");
    if (digitsOnly.length > 10) {
      sanitized = digitsOnly.slice(0, 10);
    }
  } else {
    // Other country codes: max 15 chars
    if (sanitized.length > 15) {
      sanitized = sanitized.slice(0, 15);
    }
  }
  return sanitized;
};

