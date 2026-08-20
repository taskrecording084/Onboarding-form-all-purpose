import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { COUNTRIES, Country, ROLES } from '../data/onboarding-data';
import { ThemeStore } from '../services/theme';
import { UsernameAvailability, usernameAvailabilityValidator } from '../services/username-availability';
import {
  acceptTermsValidator,
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
} from '../validators/form-validators';
import { FIELDS, FieldSpec, RuleContext, STEPS } from './field-rules';

type CheckStatus = 'waiting' | 'checking' | 'passed' | 'failed' | 'skipped';

@Component({
  selector: 'app-onboarding',
  imports: [ReactiveFormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding {
  private readonly fb = inject(FormBuilder);
  protected readonly theme = inject(ThemeStore);

  protected readonly countries = COUNTRIES;
  protected readonly roles = ROLES;
  protected readonly steps = STEPS;
  protected readonly fields = FIELDS;

  protected readonly step = signal(0);
  protected readonly focused = signal<string | null>(null);
  protected readonly revealPassword = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);

  protected readonly today = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.group({
    fullName: this.fb.nonNullable.control('', fullNameValidator),
    username: this.fb.nonNullable.control('', {
      validators: usernameValidator,
      asyncValidators: usernameAvailabilityValidator(),
    }),
    dateOfBirth: this.fb.nonNullable.control('', dateOfBirthValidator),
    country: this.fb.nonNullable.control('', countryValidator),
    email: this.fb.nonNullable.control('', emailValidator),
    phone: this.fb.nonNullable.control('', phoneValidator),
    password: this.fb.nonNullable.control('', passwordValidator),
    confirmPassword: this.fb.nonNullable.control('', confirmPasswordValidator),
    role: this.fb.nonNullable.control('', roleValidator),
    postalCode: this.fb.nonNullable.control('', postalCodeValidator),
    portfolioUrl: this.fb.nonNullable.control('', portfolioUrlValidator),
    acceptTerms: this.fb.nonNullable.control(false, acceptTermsValidator),
  });

  /** Bumped on every form change so the computed views below re-evaluate. */
  private readonly revision = signal(0);

  constructor() {
    inject(UsernameAvailability); // eager, so the first handle check has no cold start

    // Cross-field dependencies: re-run the dependent validators when their input changes.
    this.recheck('country', ['phone', 'postalCode']);
    this.recheck('password', ['confirmPassword']);
    this.recheck('username', ['password']);
    this.recheck('email', ['password']);

    this.form.valueChanges.subscribe(() => this.revision.update((n) => n + 1));
    this.form.statusChanges.subscribe(() => this.revision.update((n) => n + 1));
  }

  private recheck(source: string, targets: string[]): void {
    this.form.get(source)!.valueChanges.subscribe(() => {
      for (const target of targets) {
        const control = this.form.get(target)!;
        if (control.value !== '' || control.touched) {
          control.updateValueAndValidity({ emitEvent: false });
        }
      }
      this.revision.update((n) => n + 1);
    });
  }

  /* -- lookups ----------------------------------------------------------- */

  protected control(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  protected spec(name: string): FieldSpec {
    return FIELDS.find((f) => f.name === name)!;
  }

  protected get selectedCountry(): Country | null {
    return COUNTRIES.find((c) => c.code === this.form.controls.country.value) ?? null;
  }

  private get ruleContext(): RuleContext {
    return { country: this.selectedCountry };
  }

  protected fieldsForStep(step: number): FieldSpec[] {
    return FIELDS.filter((f) => f.step === step);
  }

  /* -- rule chips and messages ------------------------------------------- */

  /** Every rule for a field with its live pass/fail state, for the chip strip. */
  protected chips(name: string): { key: string; label: string; ok: boolean }[] {
    this.revision();
    const control = this.control(name);
    const errors = control.errors ?? {};
    return this.spec(name)
      .rules.filter((r) => !!r.chip)
      .map((r) => ({
        key: r.key,
        label: r.chip!,
        // A server rule only counts as satisfied once the lookup has actually run.
        ok: r.async ? control.valid : !errors[r.key],
      }));
  }

  /** The first failing rule decides the message, so guidance is never ambiguous. */
  protected message(name: string): string | null {
    this.revision();
    const control = this.control(name);
    const errors = control.errors;
    if (!errors) return null;
    const rule = this.spec(name).rules.find((r) => errors[r.key]);
    if (!rule) return null;
    return typeof rule.message === 'function' ? rule.message(this.ruleContext) : rule.message;
  }

  protected showMessage(name: string): boolean {
    const control = this.control(name);
    return control.invalid && (control.touched || control.dirty) && this.focused() !== name;
  }

  protected showChips(name: string): boolean {
    const control = this.control(name);
    return this.focused() === name || (control.invalid && control.touched);
  }

  protected status(name: string): CheckStatus {
    this.revision();
    const control = this.control(name);
    const spec = this.spec(name);
    if (control.pending) return 'checking';
    if (control.valid) {
      const empty = control.value === '' || control.value === false;
      return spec.optional && empty ? 'skipped' : 'passed';
    }
    return control.touched || control.dirty ? 'failed' : 'waiting';
  }

  /* -- preflight ledger --------------------------------------------------- */

  protected readonly passing = computed(() => {
    this.revision();
    return FIELDS.filter((f) => {
      const s = this.status(f.name);
      return s === 'passed' || s === 'skipped';
    }).length;
  });

  protected readonly total = FIELDS.length;

  protected ledgerNote(name: string): string | null {
    return this.status(name) === 'failed' ? this.message(name) : null;
  }

  /* -- password meter ----------------------------------------------------- */

  protected get strength(): number {
    this.revision();
    return passwordScore(this.form.controls.password.value);
  }

  protected get strengthLabel(): string {
    return ['Empty', 'Fragile', 'Weak', 'Fair', 'Strong', 'Excellent'][this.strength];
  }

  /* -- navigation --------------------------------------------------------- */

  protected stepComplete(step: number): boolean {
    this.revision();
    return this.fieldsForStep(step).every((f) => this.control(f.name).valid);
  }

  protected next(): void {
    const current = this.step();
    if (!this.stepComplete(current)) {
      this.touchStep(current);
      this.focusFirstProblem(current);
      return;
    }
    this.step.set(Math.min(current + 1, STEPS.length - 1));
    this.scrollToTop();
  }

  protected back(): void {
    this.step.update((s) => Math.max(s - 1, 0));
    this.scrollToTop();
  }

  protected jumpTo(name: string): void {
    const spec = this.spec(name);
    this.step.set(spec.step);
    setTimeout(() => document.getElementById(name)?.focus(), 60);
  }

  private touchStep(step: number): void {
    for (const f of this.fieldsForStep(step)) this.control(f.name).markAsTouched();
    this.revision.update((n) => n + 1);
  }

  private focusFirstProblem(step: number): void {
    const first = this.fieldsForStep(step).find((f) => this.control(f.name).invalid);
    if (first) setTimeout(() => document.getElementById(first.name)?.focus(), 0);
  }

  private scrollToTop(): void {
    document.querySelector('.panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* -- submit -------------------------------------------------------------- */

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = FIELDS.find((f) => this.control(f.name).invalid);
      if (first) this.jumpTo(first.name);
      this.revision.update((n) => n + 1);
      return;
    }
    this.submitting.set(true);
    setTimeout(() => {
      this.submitting.set(false);
      this.submitted.set(true);
    }, 900);
  }

  protected get summary(): { label: string; value: string }[] {
    const v = this.form.getRawValue();
    return [
      { label: 'Name', value: v.fullName },
      { label: 'Handle', value: '@' + v.username },
      { label: 'Email', value: v.email },
      { label: 'Phone', value: v.phone },
      { label: 'Country', value: this.selectedCountry?.name ?? '' },
      { label: 'Postal code', value: v.postalCode },
      { label: 'Role', value: v.role },
      { label: 'Portfolio', value: v.portfolioUrl || 'Not provided' },
    ];
  }

  protected startOver(): void {
    this.form.reset();
    this.step.set(0);
    this.submitted.set(false);
    this.revision.update((n) => n + 1);
  }
}
