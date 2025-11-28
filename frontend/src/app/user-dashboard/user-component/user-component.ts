import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TransactionService } from '../../transaction-service';
import { UserService } from '../../user-service';
import { MatTableModule } from '@angular/material/table';
import { TransferDialogComponent } from '../transfer-dialog-component/transfer-dialog-component';
import { UserLayout } from '../user-layout/user-layout';
import { Table } from '../../common/table/table';

@Component({
  selector: 'app-user-component',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatDialogModule, UserLayout, Table],
  templateUrl: './user-component.html',
  styleUrls: ['./user-component.scss'],
})
export class UserComponent implements OnInit {
  userName : string = '';
  balance : number = 0;
  users: any[] = [];
  transacations: any[] = [];
  loadingHistory = false;
  searchAttempted = false;

  displayedColumns = ['transactionId', 'transactionType', 'amount','timestamp', 'username'];

  constructor(private transactionService: TransactionService, private dialog: MatDialog, private userService: UserService, private ngZone: NgZone){}
  ngOnInit(): void {
   this.loadUsers();
  }

  loadUsers(){
    this.userService.getUsers().subscribe(res => { this.users = res});
  }
  
  searchUserHistory(){
    const name = this.userName?.trim();
    if(!name || name.length < 3) return;
    this.loadingHistory = true;
    this.searchAttempted = true;
    this.transactionService.getTransactionHistory(name).subscribe({
      next: (res: any[]) => {
        this.ngZone.run(() => {
          // sort by timestamp desc if timestamp present
          try{
            this.transacations = Array.isArray(res) ? res.slice().sort((a,b) => {
              const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
              const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
              return tb - ta;
            }) : [];
          }catch(e){
            this.transacations = res || [];
          }

          const user = this.users.find(u => u.userName === name || u.username === name);
          this.balance = user ? (user.currentbalance ?? user.currentBalance ?? 0) : 0;
          this.loadingHistory = false;
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Failed to load transaction history', err);
          this.transacations = [];
          this.loadingHistory = false;
        });
      }
    })
  }

  openTransfer(){
    const dialogRef = this.dialog.open(TransferDialogComponent, {
      width: '400px',
      data: { users: this.users, fromUser: this.userName }
    });    

    dialogRef.afterClosed().subscribe(result => {
      
      // You can handle any actions after the dialog is closed here
      if(result){
        this.transactionService.saveTransaction(result).subscribe(()=>{
          console.log('Transaction successful');
          this.searchUserHistory();
        })
      }
    });
  }

  onUserNameChange(value: string) {
    this.userName = value;
    const name = value?.trim();
    if (!name || name.length < 3) {
      this.transacations = [];
      this.balance = 0;
      this.loadingHistory = false;
      this.searchAttempted = false;
    }
  }
}