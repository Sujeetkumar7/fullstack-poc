import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV, API_ENDPOINTS } from '../../constants';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = ENV.apiUrl;

  constructor(private http: HttpClient) {}

  startAnalytics(): Observable<{ status: string; jobRunId: string }> {
    return this.http.get<{ status: string; jobRunId: string }>(
      `${this.apiUrl + API_ENDPOINTS.analytics + API_ENDPOINTS.start}`
    );
  }

  getAnalyticsStatus(jobId: string): Observable<{ jobId: string; status: string }> {
    return this.http.get<{ jobId: string; status: string }>(
      `${this.apiUrl + API_ENDPOINTS.analytics + API_ENDPOINTS.status}?jobId=${jobId}`
    );
  }

  getDownloadUrl(): Observable<Blob> {
    return this.http.get(`${this.apiUrl + API_ENDPOINTS.analytics + API_ENDPOINTS.download}`, {
      responseType: 'blob',
    });
  }
}
