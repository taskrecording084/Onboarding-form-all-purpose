/**
 * Static reference data driving the onboarding form's validation.
 * Kept in one place so VALIDATION_RULES.txt and the code cannot drift apart.
 */

export interface Country {
  code: string;
  name: string;
  dial: string;
  /** Allowed national significant number length, inclusive. */
  nsn: [number, number];
  /** Allowed first digit(s) of the national number, empty = any. */
  nsnLeading: string;
  postal: RegExp;
  postalExample: string;
  postalHint: string;
}

export const COUNTRIES: Country[] = [
  {
    code: 'IN', name: 'India', dial: '+91', nsn: [10, 10], nsnLeading: '6789',
    postal: /^[1-9][0-9]{5}$/, postalExample: '560001', postalHint: '6 digits, cannot start with 0',
  },
  {
    code: 'US', name: 'United States', dial: '+1', nsn: [10, 10], nsnLeading: '23456789',
    postal: /^[0-9]{5}(-[0-9]{4})?$/, postalExample: '94107', postalHint: 'ZIP: 5 digits, or ZIP+4',
  },
  {
    code: 'GB', name: 'United Kingdom', dial: '+44', nsn: [10, 10], nsnLeading: '1237',
    postal: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/, postalExample: 'SW1A 1AA', postalHint: 'UK postcode, e.g. SW1A 1AA',
  },
  {
    code: 'CA', name: 'Canada', dial: '+1', nsn: [10, 10], nsnLeading: '23456789',
    postal: /^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] ?[0-9][ABCEGHJ-NPRSTV-Z][0-9]$/,
    postalExample: 'K1A 0B1', postalHint: 'Forward sortation area + local unit',
  },
  {
    code: 'DE', name: 'Germany', dial: '+49', nsn: [10, 11], nsnLeading: '1234567890',
    postal: /^[0-9]{5}$/, postalExample: '10115', postalHint: '5 digits',
  },
  {
    code: 'AU', name: 'Australia', dial: '+61', nsn: [9, 9], nsnLeading: '234578',
    postal: /^[0-9]{4}$/, postalExample: '3000', postalHint: '4 digits',
  },
  {
    code: 'SG', name: 'Singapore', dial: '+65', nsn: [8, 8], nsnLeading: '689',
    postal: /^[0-9]{6}$/, postalExample: '018956', postalHint: '6 digits',
  },
  {
    code: 'NL', name: 'Netherlands', dial: '+31', nsn: [9, 9], nsnLeading: '123456789',
    postal: /^[1-9][0-9]{3} ?[A-Z]{2}$/, postalExample: '1012 AB', postalHint: '4 digits + 2 letters',
  },
];

export const ROLES = [
  'Engineering',
  'Design',
  'Product',
  'Data and analytics',
  'Marketing',
  'Sales',
  'Operations',
  'Customer support',
  'Finance',
  'People and HR',
  'Other',
];

/** Handles the platform keeps for itself. */
export const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'support', 'help', 'api', 'account',
  'system', 'null', 'undefined', 'moderator', 'staff', 'security', 'billing', 'www',
];

/** Throwaway mail providers are rejected outright — we need to reach the person. */
export const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'yopmail.com', 'trashmail.com', 'throwawaymail.com', 'sharklasers.com',
  'getnada.com', 'dispostable.com', 'temp-mail.org',
];

/** Substrings that make a password guessable regardless of the character mix. */
export const COMMON_PASSWORD_SEEDS = [
  'password', 'passw0rd', 'qwerty', 'asdfgh', 'letmein', 'welcome', 'iloveyou',
  'admin', 'monkey', 'dragon', 'football', 'sunshine', 'princess', 'abc123',
  '123456', '12345678', '87654321', 'starwars', 'changeme', 'trustno1',
];

export const PASSWORD_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~`|\\'\"";
