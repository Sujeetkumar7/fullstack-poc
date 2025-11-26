import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Admin } from './admin/admin';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'admin', component: Admin },
  { path: '**', redirectTo: '' },
];
