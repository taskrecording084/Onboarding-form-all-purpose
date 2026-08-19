import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

/**
 * Stands in for a real `GET /api/handles/:username` lookup.
 * Swap the body of `isTaken` for an HttpClient call when the API exists.
 */
@Injectable({ providedIn: 'root' })
export class UsernameAvailability {
  private readonly taken = new Set([
    'ada', 'grace', 'linus', 'naomi', 'john_doe', 'test_user',
    'designer', 'engineer', 'alan_t', 'margaret', 'sam',
  ]);

  isTaken(username: string): Observable<boolean> {
    return timer(550).pipe(map(() => this.taken.has(username.toLowerCase())));
  }
}

/** Only hits the network once the synchronous username rules already pass. */
export function usernameAvailabilityValidator(): AsyncValidatorFn {
  const service = inject(UsernameAvailability);

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').toString();
    if (!value || control.errors) return of(null);

    return timer(450).pipe(
      switchMap(() => service.isTaken(value)),
      map((taken) => (taken ? { usernameTaken: true } : null)),
    );
  };
}
