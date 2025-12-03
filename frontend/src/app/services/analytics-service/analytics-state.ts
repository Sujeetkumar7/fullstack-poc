import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AnalyticsService } from './analytics';
import * as XLSX from 'xlsx';

interface AnalyticsState {
  isRunning: boolean;
  statusMessage: string;
  xlsxBlob: Blob | null;
  sheets: Array<{
    name: string;
    headers: string[];
    rows: string[][];
  }>;
  isReportReady: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsStateService {
  private stateSubject = new BehaviorSubject<AnalyticsState>({
    isRunning: false,
    statusMessage: '',
    xlsxBlob: null,
    sheets: [],
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
      xlsxBlob: null,
      sheets: [],
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
      next: async (blob: Blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const sheets = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name];
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          const processedRows = rows.map((row) =>
            row.map((cell) => {
              if (typeof cell === 'number' && cell > 30000 && cell < 60000) {
                return this.excelDateToJSDate(cell);
              }
              return cell;
            })
          );

          return {
            name: this.formatSheetName(name),
            headers: processedRows[0] || [],
            rows: processedRows.slice(1) || [],
          };
        });

        this.updateState({
          xlsxBlob: blob,
          sheets,
          isReportReady: true,
          isRunning: false,
          statusMessage: 'Analytics completed. Report is ready.',
        });
      },
      error: () => {
        this.updateState({
          isRunning: false,
          statusMessage: 'Failed to fetch report.',
        });
      },
    });
  }

  private formatSheetName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase())
      .trim();
  }

  private excelDateToJSDate(serial: number): string {
    if (typeof serial !== 'number') return serial as any;

    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const dateInfo = new Date(utc_value * 1000);

    const year = dateInfo.getFullYear();
    const month = String(dateInfo.getMonth() + 1).padStart(2, '0');
    const day = String(dateInfo.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
