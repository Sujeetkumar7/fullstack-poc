import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Admin } from './admin-dashboard/admin/admin';
import { Analytics } from './admin-dashboard/analytics/analytics';
import { UserComponent } from './user-dashboard/user-component/user-component';
import { AuthGuard } from './services/auth-service/auth-guard';
import { UserLayout } from './user-dashboard/user-layout/user-layout';
import { AdminLayout } from './admin-dashboard/admin-layout/admin-layout';
import { Stocks } from './user-dashboard/stocks/stocks';
import { Portfolio } from './user-dashboard/portfolio/portfolio';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: Admin,
      },
      {
        path: 'analytics',
        component: Analytics,
      },
    ],
  },
  {
    path: 'user',
    component: UserLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: Portfolio,
      },
      {
        path: 'transactions',
        component: UserComponent,
      },
      {
        path: 'stocks',
        component: Stocks,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
