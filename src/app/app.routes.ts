import { Routes } from '@angular/router';
import { Onboarding } from './onboarding/onboarding';

export const routes: Routes = [
  { path: '', component: Onboarding, title: 'Thor - specialist onboarding' },
  { path: '**', redirectTo: '' },
];
