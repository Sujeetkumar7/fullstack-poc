import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsStateService } from '../../services/analytics-service/analytics-state';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
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

  downloadReport(content: Blob | null) {
    if (!content) return;

    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-report.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  }
}
