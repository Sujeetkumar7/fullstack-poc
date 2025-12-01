import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Spinner } from '../common/spinner/spinner';
import { UserService } from '../services/user-service/user';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './../services/auth-service/auth-service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Spinner, MatSnackBarModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('isLoggedIn') === 'true') {
        const user = JSON.parse(localStorage.getItem('userDetails') || '{}');
        this.router.navigate([user.userRole === 'ADMIN' ? '/admin' : '/user']);
      }
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.cdr.detectChanges();

    const username = this.loginForm.value.username;

    this.userService
      .getUserByUsername(username)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (!response || !response.userRole) {
            alert('Invalid username.');
            return;
          }
          this.authService.login({
            userId: response.userId,
            username: response.username,
            userRole: response.userRole,
          });
          this.router.navigate([response.userRole === 'ADMIN' ? '/admin' : '/user']);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.snackBar.open('User does not exist!', '', {
            duration: 3000,
            panelClass: ['error-snackbar'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }
}
