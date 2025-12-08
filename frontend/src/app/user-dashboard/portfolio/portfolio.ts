import { Component, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user-service/user';
import { CommonModule, DatePipe } from '@angular/common';
import { Spinner } from '../../common/spinner/spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransferDialogComponent } from '../transfer-dialog-component/transfer-dialog-component';
import { TransactionService } from '../../services/transaction-service/transaction-service';

@Component({
  selector: 'app-portfolio',
  imports: [DatePipe, CommonModule, Spinner],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {
  portfolio: any;
  isLoading = true;
  investedAmount = 0;
  balance = 0;
  userId = 'U012'; // Hardcoded for now

  constructor(
    private userService: UserService,
    private transactionService: TransactionService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPortfolio(); // single API call
  }

  loadPortfolio() {
    this.isLoading = true;
    this.userService.getUserPortfolio(this.userId).subscribe({
      next: (data: any) => {
        this.portfolio = data;

        // Set balance from portfolio API
        this.balance = data?.currentBalance ?? 0;

        // Calculate invested amount
        this.investedAmount =
          data?.stocks?.reduce((sum: number, s: any) => sum + (s.amount ?? 0), 0) ?? 0;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  refreshBalance() {
    this.loadPortfolio();
  }

  openTransfer() {
    this.userService.getAllUsers().subscribe((users) => {
      const dialogRef = this.dialog.open(TransferDialogComponent, {
        width: '400px',
        data: { users, userId: this.userId, balance: this.balance },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const destinationUser = users.find((u) => u.userId === result.destinationUserId);

          this.transactionService.saveTransaction(result).subscribe({
            next: () => {
              this.refreshBalance();
              this.snackbar.open(
                `₹${result.amount} transferred to ${destinationUser?.username}`,
                '',
                { duration: 3000, panelClass: ['success-snackbar'] }
              );
            },
            error: () => {
              this.snackbar.open('Transfer failed. Please try again.', '', {
                duration: 3000,
                panelClass: ['error-snackbar'],
              });
            },
          });
        }
      });
    });
  }
}
