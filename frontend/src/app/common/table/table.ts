import { Component, Input, ViewChild, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

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

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  dataSource = new MatTableDataSource<any>();
  allColumns: string[] = [];
  originalData: any[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  pageSize = 5;
  currentPage = 1;
  totalPages = 0;
  pages: number[] = [];
  startIndex = 0;
  endIndex = 0;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.originalData = this.data;
    this.dataSource.data = this.data;
    this.allColumns = [...this.displayedColumns, 'actions'];
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
      this.displayedColumns.some((col) => String(item[col]).toLowerCase().includes(filterValue))
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
}
