import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../../constants';

@Injectable({ providedIn: 'root' })
export class StocksService {
  private apiUrl = ENV.stocksApiUrl;
  private baseUrl = ENV.apiUrl;

  constructor(private http: HttpClient) {}

  getStocks(sort = 'Mcap', order = 'desc', page = 1, count = 50): Observable<any> {
    const body = {
      data: {
        sort: sort,
        sorder: order,
        count: count,
        params: [
          { field: 'idxlist.Indexid', op: '', val: '13' },
          { field: 'Exch', op: '', val: 'NSE' },
          { field: 'OgInst', op: '', val: 'ES' },
        ],
        fields: [
          'Sym',
          'Mcap',
          'High1Yr',
          'Low1Yr',
          'Pe',
          'ROCE',
          'PricePerchng1mon',
          'PricePerchng1year',
          'Sector',
          'sect_seo',
          'AnalystRating',
        ],
        pgno: page,
      },
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: '*/*',
      Origin: 'https://dhan.co',
      Referer: 'https://dhan.co/',
    });

    return this.http.post(this.apiUrl, body, { headers });
  }

  saveInvestment(body:any):Observable<any>{
    return this.http.post<any>(`${this.baseUrl}/stocks/invest`,body);
  }
}
