import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Transaction {
  transactionId: string;
  transactionType: string;
  amount: number;
  timestamp: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  // Toggle this to `false` to call the real backend
  private useMock = true;
  private baseUrl = 'http://localhost:8080';

  // Simple in-memory mock store
  private mockTransactions: Transaction[] = [
    { transactionId: 't1', transactionType: 'debit', amount: 100, timestamp: new Date().toISOString(), username: 'John' },
    { transactionId: 't2', transactionType: 'credit', amount: 50, timestamp: new Date().toISOString(), username: 'Alice' },
  ];

  constructor(private http: HttpClient){}

  saveTransaction(body:any):Observable<any>{
    if(!this.useMock){
      return this.http.post<any>(`${this.baseUrl}/transaction/transfer`,body);
    }

    const tx: Transaction = {
      transactionId: `m_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      transactionType: body.transactionType || 'debit',
      amount: Number(body.amount) || 0,
      timestamp: new Date().toISOString(),
      username: body.username || body.fromUser || 'unknown'
    };

    this.mockTransactions.unshift(tx);
    return of({ success: true, data: tx });
  }

  getTransactionHistory(userId:string): Observable<any>{
    if(!this.useMock){
      return this.http.get<any>(`${this.baseUrl}/transaction/history/${userId}`);
    }

    const list = this.mockTransactions.filter(t => t.username === userId || t.username === (userId));
    return of(list);
  }
}
