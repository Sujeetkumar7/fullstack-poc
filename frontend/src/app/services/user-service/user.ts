import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV, API_ENDPOINTS } from '../../constants';

export interface UserRequest {
  userName: string;
  userRole: string;
}

export interface UserResponse {
  currentBalance: number;
  userId: string;
  userName: string;
  userRole: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = ENV.apiUrl;

  constructor(private http: HttpClient) {}

  getUserByUsername(username: string) {
    return this.http.get<any>(`${this.apiUrl + API_ENDPOINTS.users}/${username}`);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl + API_ENDPOINTS.users);
  }

  createUser(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl + API_ENDPOINTS.users, user);
  }

  updateUser(userId: string, user: UserResponse): Observable<string> {
    return this.http.put<string>(`${this.apiUrl + API_ENDPOINTS.users}/${userId}`, user, {
      responseType: 'text' as 'json',
    });
  }

  deleteUser(userId: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl + API_ENDPOINTS.users}/${userId}`, {
      responseType: 'text' as 'json',
    });
  }
}
