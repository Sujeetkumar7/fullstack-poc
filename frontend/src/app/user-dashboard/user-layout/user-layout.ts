import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../common/header/header';


@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './user-layout.html',
  styleUrls: ['./user-layout.scss'],
})
export class UserLayout {
  title = 'User Dashboard';
  username = 'user';


  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/']);
  }
}
