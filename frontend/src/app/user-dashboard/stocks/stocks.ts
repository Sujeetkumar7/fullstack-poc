import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StocksService } from '../../services/stocks-service/stocks-service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Table } from '../../common/table/table';
import { Spinner } from '../../common/spinner/spinner';

@Component({
  selector: 'app-stocks',
  templateUrl: './stocks.html',
  imports: [CommonModule, Table, Spinner],
  styleUrls: ['./stocks.scss'],
})
export class Stocks implements OnInit {
  stocks: any[] = [];
  loading = false;

  displayedColumns = [
    'Sym',
    'Mcap',
    'High1Yr',
    'Low1Yr',
    'Pe',
    'ROCE',
    'PricePerchng1mon',
    'PricePerchng1year',
    'Sector',
    'AnalystRating',
  ];

  columnNames: any = {
    Sym: 'Name',
    Mcap: 'Market Cap',
    High1Yr: '52W High',
    Low1Yr: '52W Low',
    Pe: 'PE Ratio',
    ROCE: 'ROCE %',
    PricePerchng1mon: '1M %',
    PricePerchng1year: '1Y %',
    Sector: 'Sector',
    AnalystRating: 'Rating',
  };

  constructor(private stocksService: StocksService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadStocks();
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
