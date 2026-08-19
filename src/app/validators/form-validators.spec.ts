import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import {
  confirmPasswordValidator,
  countryValidator,
  dateOfBirthValidator,
  roleValidator,
  emailValidator,
  fullNameValidator,
  passwordScore,
  passwordValidator,
  phoneValidator,
  portfolioUrlValidator,
  postalCodeValidator,
  usernameValidator,
} from './form-validators';

/** Builds a control inside a parent group so cross-field rules can resolve. */
function field(name: string, value: unknown, validator: ValidatorFn, siblings: Record<string, unknown> = {}) {
  const controls: Record<string, FormControl> = {
    country: new FormControl(siblings['country'] ?? ''),
    username: new FormControl(siblings['username'] ?? ''),
    email: new FormControl(siblings['email'] ?? ''),
    password: new FormControl(siblings['password'] ?? ''),
  };
  controls[name] = new FormControl(value, validator);
  const control = new FormGroup(controls).get(name)!;
  // A control validates once at construction, before it has a parent, so
  // cross-field rules only resolve after it is attached. Re-run them here.
  control.updateValueAndValidity();
  return control;
}

const yearsAgo = (years: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
};

describe('fullName', () => {
  it('accepts a two-part name with accents and punctuation', () => {
    expect(field('fullName', "Ada O'Neill-Löve", fullNameValidator).errors).toBeNull();
  });
  it('rejects a single word', () => {
    expect(field('fullName', 'Ada', fullNameValidator).errors?.['nameTwoParts']).toBeTrue();
  });
  it('rejects digits and double spaces', () => {
    const errors = field('fullName', 'Ada  Lovelace2', fullNameValidator).errors!;
    expect(errors['nameNoDigits']).toBeTrue();
    expect(errors['nameSingleSpace']).toBeTrue();
  });
});

describe('username', () => {
  it('accepts a lowercase handle', () => {
    expect(field('username', 'ada_lovelace', usernameValidator).errors).toBeNull();
  });
  it('rejects uppercase, leading digit, trailing and doubled underscores', () => {
    expect(field('username', 'Ada', usernameValidator).errors?.['userCharset']).toBeTrue();
    expect(field('username', '1ada', usernameValidator).errors?.['userStart']).toBeTrue();
    expect(field('username', 'ada_', usernameValidator).errors?.['userEnd']).toBeTrue();
    expect(field('username', 'ada__x', usernameValidator).errors?.['userRepeatUnderscore']).toBeTrue();
  });
  it('rejects reserved handles', () => {
    expect(field('username', 'admin', usernameValidator).errors?.['userReserved']).toBeTrue();
  });
});

describe('dateOfBirth', () => {
  it('accepts someone over 18', () => {
    expect(field('dateOfBirth', yearsAgo(25), dateOfBirthValidator).errors).toBeNull();
  });
  it('rejects someone under 18', () => {
    expect(field('dateOfBirth', yearsAgo(17), dateOfBirthValidator).errors?.['dobMinAge']).toBeTrue();
  });
  it('rejects a future date', () => {
    expect(field('dateOfBirth', yearsAgo(-1), dateOfBirthValidator).errors?.['dobPast']).toBeTrue();
  });
});

describe('country and role', () => {
  it('accepts a known country code', () => {
    expect(field('country', 'IN', countryValidator).errors).toBeNull();
  });
  it('rejects an unknown code', () => {
    expect(field('country', 'ZZ', countryValidator).errors?.['countryKnown']).toBeTrue();
  });
  it('rejects a role outside the list', () => {
    expect(field('role', 'Alchemy', roleValidator).errors?.['roleKnown']).toBeTrue();
  });
});

describe('email', () => {
  it('accepts a normal address', () => {
    expect(field('email', 'ada@lovelace.dev', emailValidator).errors).toBeNull();
  });
  it('rejects a missing TLD', () => {
    expect(field('email', 'ada@localhost', emailValidator).errors?.['emailDomain']).toBeTrue();
  });
  it('rejects disposable domains', () => {
    expect(field('email', 'ada@mailinator.com', emailValidator).errors?.['emailDisposable']).toBeTrue();
  });
  it('rejects a leading dot in the local part', () => {
    expect(field('email', '.ada@lovelace.dev', emailValidator).errors?.['emailShape']).toBeTrue();
  });
});

describe('phone', () => {
  it('accepts a formatted Indian mobile number', () => {
    expect(field('phone', '+91 98765 43210', phoneValidator, { country: 'IN' }).errors).toBeNull();
  });
  it('rejects a number whose dial code is not the selected country', () => {
    expect(field('phone', '+1 4155550123', phoneValidator, { country: 'IN' }).errors?.['phoneDial']).toBeTrue();
  });
  it('rejects the wrong national length', () => {
    expect(field('phone', '+9198765', phoneValidator, { country: 'IN' }).errors?.['phoneLength']).toBeTrue();
  });
  it('rejects an Indian number starting with 5', () => {
    expect(field('phone', '+91 5876543210', phoneValidator, { country: 'IN' }).errors?.['phoneLeading']).toBeTrue();
  });
});

describe('password', () => {
  it('accepts a strong password', () => {
    expect(field('password', 'Tr0ubad0ur#Sky', passwordValidator).errors).toBeNull();
  });
  it('reports every missing character class at once', () => {
    const errors = field('password', 'shortone', passwordValidator).errors!;
    expect(errors['pwLength']).toBeTrue();
    expect(errors['pwUpper']).toBeTrue();
    expect(errors['pwDigit']).toBeTrue();
    expect(errors['pwSymbol']).toBeTrue();
  });
  it('rejects triples, common seeds and personal strings', () => {
    expect(field('password', 'Aaaa1234!xyz', passwordValidator).errors?.['pwNoRepeat']).toBeTrue();
    expect(field('password', 'MyPassword12!', passwordValidator).errors?.['pwNotCommon']).toBeTrue();
    expect(
      field('password', 'Zx#ada_lovelace9', passwordValidator, { username: 'ada_lovelace' }).errors?.['pwNotPersonal'],
    ).toBeTrue();
  });
  it('scores strength from 0 to 5', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('Tr0ubad0ur#SkyLine')).toBe(5);
  });
});

describe('confirmPassword', () => {
  it('accepts a match', () => {
    expect(field('confirmPassword', 'Tr0ubad0ur#Sky', confirmPasswordValidator, { password: 'Tr0ubad0ur#Sky' }).errors)
      .toBeNull();
  });
  it('rejects a mismatch', () => {
    expect(
      field('confirmPassword', 'Tr0ubad0ur#Sk', confirmPasswordValidator, { password: 'Tr0ubad0ur#Sky' }).errors?.[
        'confirmMatch'
      ],
    ).toBeTrue();
  });
});

describe('postalCode', () => {
  it('accepts codes matching the selected country', () => {
    expect(field('postalCode', '560001', postalCodeValidator, { country: 'IN' }).errors).toBeNull();
    expect(field('postalCode', 'SW1A 1AA', postalCodeValidator, { country: 'GB' }).errors).toBeNull();
    expect(field('postalCode', '94107-1234', postalCodeValidator, { country: 'US' }).errors).toBeNull();
  });
  it('rejects a code from the wrong country', () => {
    expect(field('postalCode', '94107', postalCodeValidator, { country: 'IN' }).errors?.['postalFormat']).toBeTrue();
  });
  it('asks for a country first', () => {
    expect(field('postalCode', '560001', postalCodeValidator).errors?.['postalCountryFirst']).toBeTrue();
  });
});

describe('portfolioUrl', () => {
  it('passes when empty, because the field is optional', () => {
    expect(field('portfolioUrl', '', portfolioUrlValidator).errors).toBeNull();
  });
  it('accepts an https link', () => {
    expect(field('portfolioUrl', 'https://ada.dev/work', portfolioUrlValidator).errors).toBeNull();
  });
  it('rejects http, localhost and bare hostnames', () => {
    expect(field('portfolioUrl', 'http://ada.dev', portfolioUrlValidator).errors?.['urlHttps']).toBeTrue();
    expect(field('portfolioUrl', 'https://localhost:4200', portfolioUrlValidator).errors?.['urlPublic']).toBeTrue();
    expect(field('portfolioUrl', 'ada.dev', portfolioUrlValidator).errors?.['urlParse']).toBeTrue();
  });
});
