import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

import { TransactionService } from '../../services/transaction-service/transaction-service';
import { UserService, UserResponse } from '../../services/user-service/user';
import { AuthService } from '../../services/auth-service/auth-service';

import { TransferDialogComponent } from '../transfer-dialog-component/transfer-dialog-component';
import { Table } from '../../common/table/table';
import { Spinner } from '../../common/spinner/spinner';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatDialogModule, Table, Spinner],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.scss'],
})
export class UserComponent implements OnInit {
  userName: string = '';
  balance: number = 0;
  transactions: any[] = [];
  loading = false; 

  displayedColumns = ['transactionId', 'transactionType', 'amount', 'timestamp', 'username'];

  constructor(
    private transactionService: TransactionService,
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserDetails();
    this.userName = user?.username ?? '';
    this.balance = user?.currentBalance ?? 0;
    if (this.userName) {
      this.loadUserDetails();
    }
  }


loadUserDetails() {
  this.loading = true; // show spinner
  this.userService.getUserByUsername(this.userName)
    .pipe(take(1))
    .subscribe({
      next: (user: UserResponse) => {
        this.balance = user?.currentBalance ?? 0;
      },
      error: () => {
        this.balance = 0;
      }
    });

  // Fetch transaction history
  this.transactionService.getTransactionHistory(this.userName)
    .pipe(
      take(1),                
      finalize(() => {
        this.loading = false;
      })
    )
    .subscribe({
      next: (res: any[]) => {
        this.transactions = res ?? [];
      },
      error: () => {
        this.transactions = [];
      }
    });
}


  openTransfer() {
    this.userService.getAllUsers().subscribe(users => {
      const dialogRef = this.dialog.open(TransferDialogComponent, {
        width: '400px',
        data: { users, fromUser: this.userName }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.transactionService.saveTransaction(result).subscribe(() => {
            this.loadUserDetails();
          });
        }
      });
    });
  }
}