import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  COMMON_PASSWORD_SEEDS,
  COUNTRIES,
  ROLES,
  DISPOSABLE_EMAIL_DOMAINS,
  PASSWORD_SYMBOLS,
  RESERVED_USERNAMES,
} from '../data/onboarding-data';

/**
 * Every validator below returns ALL failing rule keys at once, not just the first.
 * The UI relies on that: each key maps to one rule chip, so a field can show
 * exactly which of its rules pass and which do not while the user types.
 */

type Errors = Record<string, boolean>;

const str = (c: AbstractControl): string => (c.value ?? '').toString();
const fail = (e: Errors): ValidationErrors | null => (Object.keys(e).length ? e : null);

const countryOf = (c: AbstractControl) => {
  const code = c.parent?.get('country')?.value;
  return COUNTRIES.find((x) => x.code === code) ?? null;
};

/* -- 01 . Legal name ----------------------------------------------------- */

const NAME_SHAPE = /^\p{L}[\p{L}'.-]*(?: \p{L}[\p{L}'.-]*)+$/u;

export const fullNameValidator: ValidatorFn = (c) => {
  const raw = str(c);
  const e: Errors = {};
  if (!raw.trim()) return { required: true };
  if (raw !== raw.trim()) e['nameTrim'] = true;
  const v = raw.trim();
  if (v.length < 4 || v.length > 60) e['nameLength'] = true;
  if (/\d/.test(v)) e['nameNoDigits'] = true;
  if (/ {2,}/.test(v)) e['nameSingleSpace'] = true;
  if (!NAME_SHAPE.test(v)) e['nameShape'] = true;
  const words = v.split(' ').filter(Boolean);
  if (words.length < 2 || words.some((w) => w.replace(/[^\p{L}]/gu, '').length < 2)) {
    e['nameTwoParts'] = true;
  }
  return fail(e);
};

/* -- 02 . Username ------------------------------------------------------- */

export const usernameValidator: ValidatorFn = (c) => {
  const v = str(c);
  const e: Errors = {};
  if (!v) return { required: true };
  if (v.length < 3 || v.length > 20) e['userLength'] = true;
  if (!/^[a-z0-9_]*$/.test(v)) e['userCharset'] = true;
  if (!/^[a-z]/.test(v)) e['userStart'] = true;
  if (/_$/.test(v)) e['userEnd'] = true;
  if (/__/.test(v)) e['userRepeatUnderscore'] = true;
  if (RESERVED_USERNAMES.includes(v.toLowerCase())) e['userReserved'] = true;
  return fail(e);
};

/* -- 03 . Date of birth -------------------------------------------------- */

export const MIN_AGE = 18;
export const MAX_AGE = 100;

export const dateOfBirthValidator: ValidatorFn = (c) => {
  const v = str(c);
  if (!v) return { required: true };
  const dob = new Date(v + 'T00:00:00');
  if (Number.isNaN(dob.getTime())) return { dobValid: true };

  const e: Errors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dob.getTime() > today.getTime()) e['dobPast'] = true;

  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age--;

  if (age < MIN_AGE) e['dobMinAge'] = true;
  if (age > MAX_AGE) e['dobMaxAge'] = true;
  return fail(e);
};

/* -- 04 . Country -------------------------------------------------------- */

export const countryValidator: ValidatorFn = (c) => {
  const v = str(c);
  if (!v) return { required: true };
  return COUNTRIES.some((x) => x.code === v) ? null : { countryKnown: true };
};

/* -- 05 . Email ---------------------------------------------------------- */

const EMAIL_LOCAL = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const EMAIL_DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

export const emailValidator: ValidatorFn = (c) => {
  const raw = str(c);
  if (!raw.trim()) return { required: true };
  const v = raw.trim().toLowerCase();
  const e: Errors = {};

  if (v.length > 254) e['emailLength'] = true;
  if (/\s/.test(raw)) e['emailNoSpace'] = true;

  const at = v.lastIndexOf('@');
  const local = at > -1 ? v.slice(0, at) : '';
  const domain = at > -1 ? v.slice(at + 1) : '';

  if (at < 1 || !domain) {
    e['emailShape'] = true;
  } else {
    if (local.length > 64 || !EMAIL_LOCAL.test(local)) e['emailShape'] = true;
    if (!EMAIL_DOMAIN.test(domain)) e['emailDomain'] = true;
    if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) e['emailDisposable'] = true;
  }
  return fail(e);
};

/* -- 06 . Phone ---------------------------------------------------------- */

export const phoneValidator: ValidatorFn = (c) => {
  const raw = str(c);
  if (!raw.trim()) return { required: true };
  const e: Errors = {};

  if (/[^0-9+\-() ]/.test(raw)) e['phoneCharset'] = true;
  const compact = raw.replace(/[()\-\s]/g, '');
  if (!/^\+[1-9][0-9]{6,17}$/.test(compact)) e['phoneE164'] = true;

  const country = countryOf(c);
  if (country) {
    if (!compact.startsWith(country.dial)) {
      e['phoneDial'] = true;
    } else {
      const nsn = compact.slice(country.dial.length);
      const [min, max] = country.nsn;
      if (nsn.length < min || nsn.length > max) e['phoneLength'] = true;
      if (nsn && country.nsnLeading && !country.nsnLeading.includes(nsn[0])) e['phoneLeading'] = true;
    }
  }
  return fail(e);
};

/* -- 07 . Password ------------------------------------------------------- */

export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 64;

const symbolClass = new RegExp('[' + PASSWORD_SYMBOLS.replace(/[\\\]^-]/g, '\\$&') + ']');

export const passwordValidator: ValidatorFn = (c) => {
  const v = str(c);
  if (!v) return { required: true };
  const e: Errors = {};

  if (v.length < PASSWORD_MIN || v.length > PASSWORD_MAX) e['pwLength'] = true;
  if (!/[A-Z]/.test(v)) e['pwUpper'] = true;
  if (!/[a-z]/.test(v)) e['pwLower'] = true;
  if (!/[0-9]/.test(v)) e['pwDigit'] = true;
  if (!symbolClass.test(v)) e['pwSymbol'] = true;
  if (/\s/.test(v)) e['pwNoSpace'] = true;
  if (/(.)\1\1/.test(v)) e['pwNoRepeat'] = true;

  const lower = v.toLowerCase();
  if (COMMON_PASSWORD_SEEDS.some((seed) => lower.includes(seed))) e['pwNotCommon'] = true;

  const username = (c.parent?.get('username')?.value ?? '').toString().toLowerCase();
  const emailLocal = (c.parent?.get('email')?.value ?? '').toString().toLowerCase().split('@')[0];
  const personal = [username, emailLocal].filter((s) => s.length >= 3);
  if (personal.some((s) => lower.includes(s))) e['pwNotPersonal'] = true;

  return fail(e);
};

/** 0-5 bar score derived from the same rules, for the strength meter. */
export function passwordScore(value: string): number {
  if (!value) return 0;
  const checks = [
    value.length >= PASSWORD_MIN,
    value.length >= 16,
    /[A-Z]/.test(value) && /[a-z]/.test(value),
    /[0-9]/.test(value),
    symbolClass.test(value),
  ];
  return checks.filter(Boolean).length;
}

/* -- 08 . Confirm password ----------------------------------------------- */

export const confirmPasswordValidator: ValidatorFn = (c) => {
  const v = str(c);
  if (!v) return { required: true };
  const password = (c.parent?.get('password')?.value ?? '').toString();
  return v === password ? null : { confirmMatch: true };
};

/* -- 09 . Postal code ---------------------------------------------------- */

export const postalCodeValidator: ValidatorFn = (c) => {
  const raw = str(c);
  if (!raw.trim()) return { required: true };
  const e: Errors = {};
  const v = raw.trim().toUpperCase();

  if (raw !== raw.trim()) e['postalTrim'] = true;

  const country = countryOf(c);
  if (!country) {
    e['postalCountryFirst'] = true;
  } else if (!country.postal.test(v)) {
    e['postalFormat'] = true;
  }
  return fail(e);
};

/* -- 10 . Role ----------------------------------------------------------- */

export const roleValidator: ValidatorFn = (c) => {
  const v = str(c);
  if (!v) return { required: true };
  return ROLES.includes(v) ? null : { roleKnown: true };
};

/* -- 11 . Portfolio URL (optional, but strict when present) -------------- */

export const portfolioUrlValidator: ValidatorFn = (c) => {
  const raw = str(c);
  if (!raw.trim()) return null; // optional field
  const e: Errors = {};

  if (/\s/.test(raw)) e['urlNoSpace'] = true;
  const v = raw.trim();
  if (v.length > 200) e['urlLength'] = true;

  let parsed: URL | null = null;
  try {
    parsed = new URL(v);
  } catch {
    e['urlParse'] = true;
  }

  if (parsed) {
    if (parsed.protocol !== 'https:') e['urlHttps'] = true;
    const host = parsed.hostname.toLowerCase();
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(host)) e['urlHost'] = true;
    if (host === 'localhost' || /^[0-9.]+$/.test(host) || host.endsWith('.local')) e['urlPublic'] = true;
  }
  return fail(e);
};

/* -- 12 . Terms ---------------------------------------------------------- */

export const acceptTermsValidator: ValidatorFn = (c) =>
  c.value === true ? null : { termsAccepted: true };
