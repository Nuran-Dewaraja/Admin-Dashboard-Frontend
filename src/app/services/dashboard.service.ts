import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Analytics {
  id: number;
  totalRevenue: number;
  totalBookings: number;
  date: string;
}

export interface ApiResponse {
  data: Analytics[];
  isSuccess: boolean;
  statusCode: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://localhost:7239/api/Analytics';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Analytics[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => {
        if (response.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch Bookings');
        }
      }),
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => error);
      })
    );
  }
}
