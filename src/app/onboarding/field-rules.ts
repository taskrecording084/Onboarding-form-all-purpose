import { Country } from '../data/onboarding-data';

export interface RuleContext {
  country: Country | null;
}

export interface FieldRule {
  /** Error key produced by the validator. */
  key: string;
  /** Short label for the rule chip under the input. Omit to hide the chip. */
  chip?: string;
  /** Sentence shown when this is the first failing rule. */
  message: string | ((ctx: RuleContext) => string);
  /**
   * Server-side rule. Its chip only turns green once the whole control is valid,
   * because a lookup that never ran must not read as a lookup that passed.
   */
  async?: boolean;
}

export interface FieldSpec {
  name: string;
  /** Position in the preflight ledger, 01-12. */
  index: string;
  step: number;
  ledger: string;
  optional?: boolean;
  rules: FieldRule[];
}

const country = (ctx: RuleContext) => ctx.country?.name ?? 'your country';

export const FIELDS: FieldSpec[] = [
  {
    name: 'fullName', index: '01', step: 0, ledger: 'Legal name',
    rules: [
      { key: 'required', message: 'Enter your full legal name.' },
      { key: 'nameLength', chip: '4-60 characters', message: 'Use between 4 and 60 characters.' },
      { key: 'nameNoDigits', chip: 'no digits', message: 'Names cannot contain digits.' },
      { key: 'nameShape', chip: "letters ' - . only", message: 'Use letters, spaces, hyphens, apostrophes and periods only.' },
      { key: 'nameTwoParts', chip: 'two or more parts', message: 'Enter at least two name parts, each with 2 or more letters.' },
      { key: 'nameSingleSpace', chip: 'single spaces', message: 'Use single spaces between name parts.' },
      { key: 'nameTrim', chip: 'no edge spaces', message: 'Remove the space at the start or end.' },
    ],
  },
  {
    name: 'username', index: '02', step: 0, ledger: 'Handle',
    rules: [
      { key: 'required', message: 'Pick a handle.' },
      { key: 'userLength', chip: '3-20 characters', message: 'Use between 3 and 20 characters.' },
      { key: 'userCharset', chip: 'a-z 0-9 _', message: 'Use lowercase letters, digits and underscores only.' },
      { key: 'userStart', chip: 'starts with a letter', message: 'Start the handle with a letter.' },
      { key: 'userEnd', chip: 'no trailing _', message: 'A handle cannot end with an underscore.' },
      { key: 'userRepeatUnderscore', chip: 'no __', message: 'Use single underscores, not doubles.' },
      { key: 'userReserved', chip: 'not reserved', message: 'That handle is reserved. Pick another.' },
      { key: 'usernameTaken', chip: 'available', async: true, message: 'That handle is taken. Pick another.' },
    ],
  },
  {
    name: 'dateOfBirth', index: '03', step: 0, ledger: 'Date of birth',
    rules: [
      { key: 'required', message: 'Enter your date of birth.' },
      { key: 'dobValid', chip: 'a real date', message: 'Enter a real calendar date.' },
      { key: 'dobPast', chip: 'in the past', message: 'Date of birth must be in the past.' },
      { key: 'dobMinAge', chip: '18 or older', message: 'You must be 18 or older to apply.' },
      { key: 'dobMaxAge', chip: 'under 100', message: 'Check the year: that is more than 100 years ago.' },
    ],
  },
  {
    name: 'country', index: '04', step: 0, ledger: 'Country',
    rules: [
      { key: 'required', message: 'Select the country you work from.' },
      { key: 'countryKnown', chip: 'from the list', message: 'Select a country from the list.' },
    ],
  },
  {
    name: 'email', index: '05', step: 1, ledger: 'Email',
    rules: [
      { key: 'required', message: 'Enter the email we should reply to.' },
      { key: 'emailNoSpace', chip: 'no spaces', message: 'An email address cannot contain spaces.' },
      { key: 'emailShape', chip: 'name@domain', message: 'Use the form name@domain.com.' },
      { key: 'emailDomain', chip: 'valid domain', message: 'The domain needs a valid ending, such as .com.' },
      { key: 'emailDisposable', chip: 'not disposable', message: 'Disposable mail domains are not accepted.' },
      { key: 'emailLength', chip: '254 characters max', message: 'Keep the address under 254 characters.' },
    ],
  },
  {
    name: 'phone', index: '06', step: 1, ledger: 'Phone',
    rules: [
      { key: 'required', message: 'Enter a number we can reach you on.' },
      { key: 'phoneCharset', chip: 'digits + - ( )', message: 'Use digits, plus, spaces, hyphens and parentheses only.' },
      { key: 'phoneE164', chip: 'E.164 format', message: 'Start with + and the country code, then 7 to 17 digits.' },
      {
        key: 'phoneDial', chip: 'matches country',
        message: (ctx) => `Numbers in ${country(ctx)} start with ${ctx.country?.dial ?? 'a country code'}.`,
      },
      {
        key: 'phoneLength', chip: 'national length',
        message: (ctx) => {
          const [min, max] = ctx.country?.nsn ?? [7, 15];
          const span = min === max ? `${min} digits` : `${min}-${max} digits`;
          return `${country(ctx)} numbers have ${span} after ${ctx.country?.dial ?? 'the country code'}.`;
        },
      },
      {
        key: 'phoneLeading', chip: 'valid prefix',
        message: (ctx) =>
          `Mobile numbers in ${country(ctx)} start with ${(ctx.country?.nsnLeading ?? '').split('').join(', ')}.`,
      },
    ],
  },
  {
    name: 'password', index: '07', step: 1, ledger: 'Password',
    rules: [
      { key: 'required', message: 'Set a password.' },
      { key: 'pwLength', chip: '12-64 characters', message: 'Use between 12 and 64 characters.' },
      { key: 'pwUpper', chip: 'uppercase', message: 'Add an uppercase letter.' },
      { key: 'pwLower', chip: 'lowercase', message: 'Add a lowercase letter.' },
      { key: 'pwDigit', chip: 'digit', message: 'Add a digit.' },
      { key: 'pwSymbol', chip: 'symbol', message: 'Add a symbol, such as ! @ # or $.' },
      { key: 'pwNoSpace', chip: 'no spaces', message: 'Remove the spaces.' },
      { key: 'pwNoRepeat', chip: 'no triples', message: 'Do not repeat a character three times in a row.' },
      { key: 'pwNotCommon', chip: 'not a common word', message: 'This contains a commonly guessed password.' },
      { key: 'pwNotPersonal', chip: 'not your handle', message: 'A password cannot contain your handle or email name.' },
    ],
  },
  {
    name: 'confirmPassword', index: '08', step: 1, ledger: 'Password repeat',
    rules: [
      { key: 'required', message: 'Type the password again.' },
      { key: 'confirmMatch', chip: 'matches password', message: 'The two passwords do not match.' },
    ],
  },
  {
    name: 'role', index: '09', step: 2, ledger: 'Role',
    rules: [
      { key: 'required', message: 'Choose your primary role.' },
      { key: 'roleKnown', chip: 'from the list', message: 'Choose a role from the list.' },
    ],
  },
  {
    name: 'postalCode', index: '10', step: 2, ledger: 'Postal code',
    rules: [
      { key: 'required', message: 'Enter your postal code.' },
      { key: 'postalCountryFirst', chip: 'country chosen', message: 'Select a country in step 01 first.' },
      { key: 'postalTrim', chip: 'no edge spaces', message: 'Remove the space at the start or end.' },
      {
        key: 'postalFormat', chip: 'country format',
        message: (ctx) =>
          `${country(ctx)} format: ${ctx.country?.postalHint ?? 'unknown'}, e.g. ${ctx.country?.postalExample ?? ''}.`,
      },
    ],
  },
  {
    name: 'portfolioUrl', index: '11', step: 2, ledger: 'Portfolio link', optional: true,
    rules: [
      { key: 'urlNoSpace', chip: 'no spaces', message: 'A URL cannot contain spaces.' },
      { key: 'urlParse', chip: 'complete URL', message: 'Enter a complete URL, e.g. https://example.com/work.' },
      { key: 'urlHttps', chip: 'https only', message: 'Only https:// links are accepted.' },
      { key: 'urlHost', chip: 'valid domain', message: 'Enter a valid domain name.' },
      { key: 'urlPublic', chip: 'public host', message: 'Use a public domain, not localhost or an IP address.' },
      { key: 'urlLength', chip: '200 characters max', message: 'Keep the URL under 200 characters.' },
    ],
  },
  {
    name: 'acceptTerms', index: '12', step: 2, ledger: 'Terms accepted',
    rules: [{ key: 'termsAccepted', message: 'Accept the terms to create your account.' }],
  },
];

export const STEPS = [
  {
    eyebrow: 'Step 01',
    title: 'Identity',
    blurb: 'Enter your name exactly as it appears on your government ID, so verification does not stall later.',
  },
  {
    eyebrow: 'Step 02',
    title: 'Contact and access',
    blurb: 'How we reach you, and how you get back in. Phone rules follow the country you selected.',
  },
  {
    eyebrow: 'Step 03',
    title: 'Profile and consent',
    blurb: 'What you do, where you are, and the terms you are agreeing to.',
  },
];
