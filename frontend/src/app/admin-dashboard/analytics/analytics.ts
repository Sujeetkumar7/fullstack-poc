import { ChangeDetectorRef, Component } from '@angular/core';
import { AdminLayout } from '../admin-layout/admin-layout';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  imports: [AdminLayout, CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {
  isRunning = false;
  statusMessage = '';
  analyticsCompleted = false;
  analyticsData: any[] = [];

  title = 'Admin Dashboard';
  username = 'AdminUser';

  constructor(private cdr: ChangeDetectorRef) {}

  runAnalytics() {
    this.isRunning = true;
    this.statusMessage = 'Analytics is running...';
    this.analyticsCompleted = false;

    setTimeout(() => {
      this.isRunning = false;
      this.statusMessage = 'Analytics completed!';
      this.analyticsCompleted = true;

      this.analyticsData = [
        { id: 1, username: 'John', amount: 120 },
        { id: 2, username: 'Alice', amount: 95 },
        { id: 3, username: 'Bob', amount: 80 },
      ];

      this.cdr.detectChanges();
    }, 3000);
  }

  downloadReport() {
    const csvContent = this.convertToCSV(this.analyticsData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'analytics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(',')).join('\n');
    return `${headers}\n${rows}`;
  }
}
