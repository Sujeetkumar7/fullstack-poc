import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap, startWith, shareReplay } from 'rxjs/operators';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { TransactionService } from '../../services/transaction-service/transaction-service';
import { UserService, UserResponse } from '../../services/user-service/user';
import { AuthService } from '../../services/auth-service/auth-service';
import { TransferDialogComponent } from '../transfer-dialog-component/transfer-dialog-component';
import { Table } from '../../common/table/table';
import { Spinner } from '../../common/spinner/spinner';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatDialogModule, Table, Spinner, MatSnackBarModule],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.scss'],
})
export class UserComponent implements AfterViewInit {
  userName = '';
  balance = 0;

  // Triggers to refresh streams
  private refresh$ = new BehaviorSubject<void>(undefined);

  // Observables for template
  transactions$!: Observable<any[]>;
  loading$ = new BehaviorSubject<boolean>(false);

  displayedColumns = ['transactionId', 'transactionType', 'amount', 'timestamp', 'username'];

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngAfterViewInit(): void {
    const user = this.authService.getUserDetails();
    this.userName = user?.username ?? '';
    this.balance = user?.currentBalance ?? 0;
    if (!this.userName) return;
    // Transactions stream with refresh trigger
    this.transactions$ = this.refresh$.pipe(
      switchMap(() => {
        this.loading$.next(true);
        return this.transactionService.getTransactionHistory(this.userName).pipe(
          finalize(() => this.loading$.next(false))
        );
      }),
      startWith([]),
      shareReplay(1)
    );
    // Initial load
    this.refresh();
    this.refreshBalance();
  }

  private refresh() {
    this.refresh$.next();
  }

  private refreshBalance() {
    this.userService.getUserByUsername(this.userName).subscribe({
      next: (user: UserResponse) => {
        this.balance = user?.currentBalance ?? 0;
      },
      error: () => {
        this.balance = 0;
      }
    });
  }

  openTransfer() {
    this.userService.getAllUsers().subscribe(users => {
      const dialogRef = this.dialog.open(TransferDialogComponent, {
        width: '400px',
        data: { users, loggedInUser: this.userName }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.transactionService.saveTransaction(result).subscribe({
            next: () => {
              this.refresh();        // reload transactions from backend
              this.refreshBalance(); // reload balance
              this.snackBar.open(
                `₹${result.amount} transferred to ${result.username}`,
                '',
                { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'center', verticalPosition: 'bottom' }
              );
            },
            error: (err) => {
              const message = err.status === 400
              ? 'Transfer failed: Invalid request or insufficient balance.'
              : 'Transfer failed. Please try again later.';
              this.snackBar.open(message, '', { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'center', verticalPosition: 'bottom' });
            }
          });
        }
      });
    });
  }
}