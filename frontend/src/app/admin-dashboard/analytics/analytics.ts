import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AdminLayout } from '../admin-layout/admin-layout';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics-service/analytics';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [AdminLayout, CommonModule],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss'],
})
export class Analytics implements OnDestroy {
  isRunning = false;
  statusMessage = '';
  pollSubscription!: Subscription;

  csvContent: string | null = null;
  tableData: string[][] = [];
  headers: string[] = [];

  isReportReady = false;

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  runAnalytics() {
    this.isRunning = true;
    this.statusMessage = 'Analytics is running...';
    this.csvContent = null;
    this.isReportReady = false;

    this.analyticsService.runAnalytics().subscribe({
      next: () => this.startPollingForDownload(),
      error: () => {
        this.isRunning = false;
        this.statusMessage = 'Failed to start analytics.';
        this.cdr.detectChanges();
      },
    });
  }

  startPollingForDownload() {
    this.pollSubscription = interval(60000)
      .pipe(
        switchMap(() =>
          this.analyticsService.getDownloadUrl().pipe(
            catchError((err) => {
              if (err.status === 404) {
                console.log('Report not ready yet...');
                return of(null);
              }
              console.error('Polling failed:', err);
              this.isRunning = false;
              this.statusMessage = 'Error while fetching report.';
              this.cdr.detectChanges();
              this.pollSubscription.unsubscribe();
              return of(null);
            })
          )
        )
      )
      .subscribe((csv) => {
        if (!csv) return;

        this.csvContent = csv;
        this.parseCsv(csv);
        this.isReportReady = true;
        this.isRunning = false;
        this.statusMessage = 'Analytics completed. Report is ready.';
        this.cdr.detectChanges();

        this.pollSubscription.unsubscribe();
      });
  }

  parseCsv(csv: string) {
    const rows = csv
      .trim()
      .split('\n')
      .map((r) => r.split(','));

    this.headers = rows[0].map((h) => this.formatHeader(h));

    this.tableData = rows.slice(1);
  }

  formatHeader(header: string): string {
    return header
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
  }

  downloadReport() {
    if (!this.csvContent) return;

    const blob = new Blob([this.csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    a.click();

    URL.revokeObjectURL(url);
  }

  ngOnDestroy() {
    if (this.pollSubscription) this.pollSubscription.unsubscribe();
  }
}
