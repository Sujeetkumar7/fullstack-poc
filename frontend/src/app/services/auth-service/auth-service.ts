import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserDetails {
  userId: string;
  username: string;
  userRole: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();
  private userDetails: UserDetails | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedLogin = localStorage.getItem('isLoggedIn') === 'true';
      const savedUser = localStorage.getItem('userDetails');
      if (savedLogin && savedUser) {
        this.loggedIn.next(true);
        this.userDetails = JSON.parse(savedUser);
      }
    }
  }

  login(user: UserDetails) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userDetails', JSON.stringify(user));
    }
    this.loggedIn.next(true);
    this.userDetails = user;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userDetails');
    }
    this.loggedIn.next(false);
    this.userDetails = null;
  }

  getLoginStatus(): boolean {
    return this.loggedIn.value;
  }

  getUserDetails(): UserDetails | null {
    return this.userDetails;
  }
}
