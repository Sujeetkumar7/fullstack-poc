import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AdminLayout } from '../admin-layout/admin-layout';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics-service/analytics';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';

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
  downloadUrl: string | null = null;
  pollSubscription!: Subscription;

  constructor(private analyticsService: AnalyticsService, private cdr: ChangeDetectorRef) {}

  runAnalytics() {
    this.isRunning = true;
    this.statusMessage = 'Analytics is running...';
    this.downloadUrl = null;

    this.analyticsService.runAnalytics().subscribe({
      next: (response: any) => {
        console.log('Analytics started:', response);
        this.startPollingForDownload();
      },
      error: (err: any) => {
        console.error('Failed to start analytics:', err);
        this.isRunning = false;
        this.statusMessage = 'Failed to start analytics.';
        this.cdr.detectChanges();
      },
    });
  }

  startPollingForDownload() {
    this.pollSubscription = interval(30000)
      .pipe(switchMap(() => this.analyticsService.getDownloadUrl()))
      .subscribe({
        next: (response) => {
          console.log('Download API response:', response);
          if (response.includes('http')) {
            this.downloadUrl = response;
            this.isRunning = false;
            this.statusMessage = 'Analytics completed! Report ready.';
            this.cdr.detectChanges();
            this.pollSubscription.unsubscribe();
          }
        },
        error: (err) => {
          console.error('Polling failed:', err);
          this.isRunning = false;
          this.statusMessage = 'Error while fetching report.';
          this.cdr.detectChanges();
          this.pollSubscription.unsubscribe();
        },
      });
  }

  downloadReport() {
    if (!this.downloadUrl) return;
    window.open(this.downloadUrl, '_blank');
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }
}
