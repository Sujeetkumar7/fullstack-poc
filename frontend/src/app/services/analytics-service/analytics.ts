import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV, API_ENDPOINTS } from '../../constants';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = ENV.apiUrl;

  constructor(private http: HttpClient) {}

  runAnalytics(): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl + API_ENDPOINTS.transaction + API_ENDPOINTS.analytics}`,
      {
        responseType: 'text' as 'json',
      }
    );
  }

  getDownloadUrl(): Observable<string> {
    return this.http.get<string>(
      `${this.apiUrl + API_ENDPOINTS.transaction + API_ENDPOINTS.download}`,
      {
        responseType: 'text' as 'json',
      }
    );
  }
}
