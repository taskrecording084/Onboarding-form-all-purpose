import { Routes } from '@angular/router';
import { Onboarding } from './onboarding/onboarding';

export const routes: Routes = [
  { path: '', component: Onboarding, title: 'Onboarding' },
  { path: '**', redirectTo: '' },
];
