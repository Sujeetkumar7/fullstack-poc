import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, finalize, map, shareReplay, startWith } from 'rxjs/operators';
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
export class UserComponent implements OnInit {
  userName = '';
  userId = '';

  private refresh$ = new BehaviorSubject<void>(undefined);

  transactions$!: Observable<any[]>;
  loading$ = new BehaviorSubject<boolean>(false);

  displayedColumns = [
    'transactionId',
    'userId',
    'transactionType',
    'amount',
    'fromUsername',
    'toUsername',
    'timestamp',
  ];

  tableColoumnNames: { [key: string]: string } = {
    transactionId: 'Transaction ID',
    userId: 'User ID',
    transactionType: 'Transaction Type',
    amount: 'Amount',
    fromUsername: 'From User',
    toUsername: 'To User',
    timestamp: 'Timestamp',
  };

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    this.userName = user?.username ?? '';
    this.userId = user?.userId ?? '';

    if (!this.userName) return;

    // Transactions observable
    this.transactions$ = this.refresh$.pipe(
      switchMap(() => {
        this.loading$.next(true);
        return this.transactionService.getTransactionHistory(this.userId).pipe(
          finalize(() => this.loading$.next(false)),
          map((transactions) =>
            transactions.sort(
              (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
          )
        );
      }),
      startWith([]),
      shareReplay(1)
    );

    // Initial load
    this.refresh();
  }

  private refresh() {
    this.refresh$.next();
  }

  openTransfer() {
    this.userService.getAllUsers().subscribe((users) => {
      const dialogRef = this.dialog.open(TransferDialogComponent, {
        width: '400px',
        data: { users, userId: this.userId },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const destinationUser = users.find((u) => u.userId === result.destinationUserId);

          this.transactionService.saveTransaction(result).subscribe({
            next: () => {
              this.refresh();
              this.snackBar.open(
                `₹${result.amount} transferred to ${destinationUser?.username}`,
                '',
                {
                  duration: 3000,
                  panelClass: ['success-snackbar'],
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                }
              );
            },
            error: (err) => {
              const message =
                err.status === 400
                  ? 'Transfer failed: Invalid request or insufficient balance.'
                  : 'Transfer failed. Please try again later.';
              this.snackBar.open(message, '', {
                duration: 3000,
                panelClass: ['error-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
              });
            },
          });
        }
      });
    });
  }
}
