import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserDetails {
  userId: string;
  username: string;
  userRole: string;
  currentBalance: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();

  private userDetailsSubject = new BehaviorSubject<UserDetails | null>(null);
  userDetails$ = this.userDetailsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedLogin = localStorage.getItem('isLoggedIn') === 'true';
      const savedUser = localStorage.getItem('userDetails');
      if (savedLogin && savedUser) {
        this.loggedIn.next(true);
         this.userDetailsSubject.next(JSON.parse(savedUser));
      }
    }
  }

  login(user: UserDetails) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userDetails', JSON.stringify(user));
    }
    this.loggedIn.next(true);
    this.userDetailsSubject.next(user);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userDetails');
      localStorage.removeItem('analyticsState');
    }
    this.loggedIn.next(false);
   this.userDetailsSubject.next(null);
  }

  getLoginStatus(): boolean {
    return this.loggedIn.value;
  }

  getUserDetails(): UserDetails | null {
     return this.userDetailsSubject.value;
  }

  updateBalance(newBalance: number): void {
  const currentUser = this.userDetailsSubject.value;
  if (currentUser) {
    const updatedUser = { ...currentUser, currentBalance: newBalance };
    this.userDetailsSubject.next(updatedUser);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userDetails', JSON.stringify(updatedUser));
    }
  }
}

}


