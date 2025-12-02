import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayout } from '../admin-layout/admin-layout';
import { AnalyticsStateService } from '../../services/analytics-service/analytics-state';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [AdminLayout, CommonModule],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.scss'],
})
export class Analytics {
  constructor(private analyticsState: AnalyticsStateService) {}

  get analyticsState$() {
    return this.analyticsState.state$;
  }

  startAnalytics() {
    this.analyticsState.startAnalytics();
  }

  downloadReport(csvContent: string | null) {
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.csv';
    a.click();

    URL.revokeObjectURL(url);
  }
}
