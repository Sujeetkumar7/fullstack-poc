import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

export interface User {
  userId: string;
  userName: string;
  currentbalance: number;
  userRole: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users: User[] = [
    { userId: '1', userName: 'John' , currentbalance : 10000, userRole:'user'},
    { userId: '2', userName: 'Bob' , currentbalance : 90000, userRole:'user'},
    { userId: '3', userName: 'Alice' , currentbalance : 80000, userRole:'user'},
    { userId: '4', userName: 'snow' , currentbalance : 70000, userRole:'user'},
    { userId: '5', userName: 'sam' , currentbalance : 60000, userRole:'user'},
  ];
  
  constructor(private http: HttpClient){}
  
  getUsers(): Observable<User[]>{
    // Use localhost so the browser can reach the backend on the host machine.
    // Consider moving this URL into `environment.ts` for different deployments.
    // return this.http.get<User[]>('http://localhost:8080/users/allUsers');
    return of(this.users);
  }

}