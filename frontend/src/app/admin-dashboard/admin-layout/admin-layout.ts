import { Component } from '@angular/core';
import { Sidebar } from '../../common/sidebar/sidebar';
import { Header } from '../../common/header/header';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [Sidebar, Header],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  sidebarOpen = false;

  title = 'Admin Dashboard';
  username = 'AdminUser';
  menuItems = [
    { label: 'User Management', icon: 'bi-person', route: '/admin' },
    { label: 'Analytics', icon: 'bi-graph-up', route: '/admin/analytics' },
  ];

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.router.navigate(['/']);
  }
}
