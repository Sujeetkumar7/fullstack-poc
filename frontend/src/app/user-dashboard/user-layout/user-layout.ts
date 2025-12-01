import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

import { Header } from '../../common/header/header';
import { AuthService } from '../../services/auth-service/auth-service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, Header, RouterOutlet],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.scss'],
})
export class UserLayout implements OnInit {
  title = 'User Dashboard';
  username = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    this.username = user?.username ?? '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}