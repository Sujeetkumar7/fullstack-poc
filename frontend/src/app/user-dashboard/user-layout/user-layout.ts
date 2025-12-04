import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

import { Header } from '../../common/header/header';
import { AuthService } from '../../services/auth-service/auth-service';
import { Sidebar } from '../../common/sidebar/sidebar';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, Header, RouterOutlet, Sidebar],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.scss'],
})
export class UserLayout implements OnInit {
  title = 'User Dashboard';
  username = '';
  sidebarOpen = false;

  menuItems = [
    { label: 'Transactions', icon: 'bi-person', route: '/user' },
    { label: 'Stocks', icon: 'bi-graph-up', route: '/user/stocks' },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    this.username = user?.username ?? '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
