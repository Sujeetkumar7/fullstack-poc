import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Admin } from './admin-dashboard/admin/admin';
import { Analytics } from './admin-dashboard/analytics/analytics';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'admin', component: Admin },
  { path: 'admin/analytics', component: Analytics },
  { path: '**', redirectTo: '' },
];
