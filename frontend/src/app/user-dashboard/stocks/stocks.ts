import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StocksService } from '../../services/stocks-service/stocks-service';
import { CommonModule } from '@angular/common';
import { Table } from '../../common/table/table';
import { Spinner } from '../../common/spinner/spinner';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvestingDialogComponent } from '../investing-dialog-component/investing-dialog-component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth-service/auth-service';
import { rmSync } from 'fs';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.html',
  imports: [CommonModule, Table, Spinner, MatDialogModule],
  styleUrls: ['./stocks.scss'],
})
export class Stocks implements OnInit {
  stocks: any[] = [];
  loading = false;
  refreshSub!: Subscription;
  userId :string ='';
  balance = 0;
  userName: string ='';

  displayedColumns = [
    'DispSym',
    'Ltp',
    'PPerchange',
    'Volume',
    'Mcap',
    'High1Yr',
    'Low1Yr',
    'PricePerchng1mon',
    'PricePerchng1year',
    'ROCE',
  ];

  columnNames: any = {
    DispSym: 'Name',
    Ltp: 'LTP',
    PPerchange: 'Change %',
    Volume: 'Volume',
    Mcap: 'Market Cap (Cr.)',
    High1Yr: '52W High',
    Low1Yr: '52W Low',
    PricePerchng1mon: '1M Returns',
    PricePerchng1year: '1 Yr Returns',
    ROCE: 'ROCE',
  };

  constructor(
    private stocksService: StocksService, 
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loading = true;
    this.loadStocks();
    this.authService.userDetails$.subscribe(user => {
    if (user) {
      this.userId = user.userId;
      this.balance = user.currentBalance ?? 0;
      this.userName = user.username;
      this.cd.markForCheck();
    }
    });
    this.refreshSub = interval(10000)
      .pipe(switchMap(() => this.stocksService.getStocks()))
      .subscribe({
        next: (res) => {
          this.stocks = res?.data ?? [];
          this.cd.markForCheck();
        },
        error: (err) => console.error(err),
      });
  }


  ngAfterViewInit(): void {
       const user = this.authService.getUserDetails();
       this.userId = user?.userId ?? '';
       this.balance = user?.currentBalance ?? 0;
       this.userName = user?.username ?? '';
  }

  loadStocks() {
    this.loading = true;

    this.stocksService.getStocks().subscribe({
      next: (res) => {
        this.stocks = res?.data ?? [];
        this.loading = false;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cd.markForCheck();
      },
    });
  }
  
  openInvestingDialog(row: any) {
  const dialogRef = this.dialog.open(InvestingDialogComponent, {
    width: '600px',
    maxHeight: '90vh',
    panelClass: 'custom-dialog-container', // optional styling
    data: {
      row,
      userId: this.userId,
      balance: this.balance,
      userName: this.userName,
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.stocksService.saveInvestment(result).subscribe({
        next: () => {
          this.authService.updateBalance(result.currentBalance);
          this.snackbar.open(
            `₹${result.amount} ${result.transactionType === 'buy' ? 'invested in' : 'sold from'} ${row?.DispSym}`,
            '',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            }
          );
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.cd.markForCheck();
          this.snackbar.open(
            'Transaction failed. Please try again later.',
            '',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            }
          );
        }
      });
    }
  });
}
   
ngOnDestroy() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
  }
}

