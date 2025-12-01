import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Admin } from './admin-dashboard/admin/admin';
import { Analytics } from './admin-dashboard/analytics/analytics';
import { UserComponent } from './user-dashboard/user-component/user-component';
// import { AuthGuard } from './services/auth-service/auth-guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'admin', component: Admin },
  //  { path: 'admin', component: Admin, canActivate: [AuthGuard] },
  { path: 'admin/analytics', component: Analytics },
  { path: 'user', component: UserComponent },
  { path: '**', redirectTo: '' },
];
