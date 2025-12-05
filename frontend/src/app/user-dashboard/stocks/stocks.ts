import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StocksService } from '../../services/stocks-service/stocks-service';
import { CommonModule } from '@angular/common';
import { Table } from '../../common/table/table';
import { Spinner } from '../../common/spinner/spinner';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.html',
  imports: [CommonModule, Table, Spinner],
  styleUrls: ['./stocks.scss'],
})
export class Stocks implements OnInit {
  stocks: any[] = [];
  loading = false;
  refreshSub!: Subscription;

  displayedColumns = [
    'DispSym',
    'Ltp',
    'PPerchange',
    'Volume',
    'Mcap',
    'Pe',
    'IndustryPE',
    'High1Yr',
    'Low1Yr',
    'PricePerchng1mon',
    'roe',
    'eps',
    'rsi',
  ];

  columnNames: any = {
    DispSym: 'Name',
    Ltp: 'LTP',
    PPerchange: 'Change %',
    Volume: 'Volume',
    Mcap: 'Market Cap (Cr.)',
    Pe: 'PE Ratio',
    IndustryPE: 'Industry PE',
    High1Yr: '52W High',
    Low1Yr: '52W Low',
    PricePerchng1mon: '1M Returns',
    roe: 'ROE',
    eps: 'EPS',
    rsi: 'RSI',
  };

  constructor(private stocksService: StocksService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loading = true;
    this.loadStocks();

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

  ngOnDestroy() {
    if (this.refreshSub) {
      this.refreshSub.unsubscribe();
    }
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
}
