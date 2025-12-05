import { Component, Input, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { formatIndianNumber, formatPercent, formatCurrencyINR } from '../../utils';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './table.html',
  styleUrls: ['./table.scss'],
})
export class Table implements AfterViewInit {
  @Input() data: any[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() showFilter: boolean = true;
  @Input() showActions: boolean = true;
  @Input() columnNames: { [key: string]: string } = {};
  @Input() freezeFirstColumn: boolean = false;

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() invest = new EventEmitter<any>();



  dataSource = new MatTableDataSource<any>();
  allColumns: string[] = [];
  originalData: any[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  pages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  hoveredRow: any = null;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.originalData = this.data;
    this.dataSource.data = this.data;
    this.allColumns = this.showActions
      ? [...this.displayedColumns, 'actions']
      : [...this.displayedColumns];
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.data.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.startIndex = (this.currentPage - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, this.data.length);
    this.dataSource.data = this.data.slice(this.startIndex, this.endIndex);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

    const filteredData = this.originalData.filter((item) =>
      this.displayedColumns.some((col) => {
        const formatted = String(this.formatValue(col, item[col])).toLowerCase();
        return formatted.includes(filterValue);
      })
    );

    this.data = filteredData;
    this.currentPage = 1;
    this.updatePagination();
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  formatValue(col: string, value: any) {
    const decimalColumns = ['Ltp', 'High1Yr', 'Low1Yr'];
    const zeroDecimalColumns = ['Volume'];
    const percentColumns = ['PPerchange', 'PricePerchng1mon'];
    const currencyColumns = ['Mcap'];

    if (currencyColumns.includes(col)) {
      return formatCurrencyINR(value);
    }

    if (percentColumns.includes(col)) {
      return formatPercent(value);
    }

    if (zeroDecimalColumns.includes(col)) {
      return formatIndianNumber(value, 0);
    }

    if (decimalColumns.includes(col)) {
      return formatIndianNumber(value);
    }

    return value;
  }

  getColorClass(col: string, value: any): string {
    const percentColumns = ['PPerchange', 'PricePerchng1mon'];

    if (!percentColumns.includes(col)) return '';

    const num = Number(value);
    if (isNaN(num)) return '';

    return num >= 0 ? 'positive' : 'negative';
  }

  onInvest(row: any) {
    console.log('Invest clicked for:', row);
  }
}
