import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AnalyticsService } from './analytics';

interface AnalyticsState {
  isRunning: boolean;
  statusMessage: string;
  csvContent: string | null;
  headers: string[];
  tableData: string[][];
  isReportReady: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsStateService {
  private stateSubject = new BehaviorSubject<AnalyticsState>({
    isRunning: false,
    statusMessage: '',
    csvContent: null,
    headers: [],
    tableData: [],
    isReportReady: false,
  });

  state$ = this.stateSubject.asObservable();
  private pollSubscription!: Subscription;

  constructor(private analyticsService: AnalyticsService) {
    this.restoreState();
  }

  startAnalytics() {
    this.updateState({
      isRunning: true,
      statusMessage: 'Analytics is running...',
      csvContent: null,
      headers: [],
      tableData: [],
      isReportReady: false,
    });

    this.analyticsService.startAnalytics().subscribe({
      next: (response) => {
        const jobId = response.jobRunId;
        this.updateState({ statusMessage: 'Analytics is running...' });
        this.startPollingForStatus(jobId);
      },
      error: () => {
        this.updateState({ isRunning: false, statusMessage: 'Failed to start analytics.' });
      },
    });
  }

  private startPollingForStatus(jobId: string) {
    this.pollSubscription = interval(30000)
      .pipe(
        switchMap(() =>
          this.analyticsService
            .getAnalyticsStatus(jobId)
            .pipe(catchError(() => of({ status: 'ERROR' })))
        )
      )
      .subscribe((response) => {
        const status = response.status;
        if (status === 'RUNNING') return;

        this.pollSubscription.unsubscribe();

        if (status === 'SUCCEEDED') {
          this.fetchDownloadUrl();
        } else {
          this.updateState({ isRunning: false, statusMessage: 'Analytics failed.' });
        }
      });
  }

  private fetchDownloadUrl() {
    this.analyticsService.getDownloadUrl().subscribe({
      next: (csv) => {
        const rows = csv
          .trim()
          .split('\n')
          .map((r) => r.split(','));
        this.updateState({
          csvContent: csv,
          headers: rows[0],
          tableData: rows.slice(1),
          isReportReady: true,
          isRunning: false,
          statusMessage: 'Analytics completed. Report is ready.',
        });
      },
      error: () => {
        this.updateState({ isRunning: false, statusMessage: 'Failed to fetch report.' });
      },
    });
  }

  private updateState(partial: Partial<AnalyticsState>) {
    const current = this.stateSubject.value;
    const newState = { ...current, ...partial };
    this.stateSubject.next(newState);
    this.saveState(newState);
  }

  private saveState(state: AnalyticsState) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('analyticsState', JSON.stringify(state));
    }
  }

  private restoreState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('analyticsState');
      if (saved) {
        this.stateSubject.next(JSON.parse(saved));
      }
    }
  }
}
