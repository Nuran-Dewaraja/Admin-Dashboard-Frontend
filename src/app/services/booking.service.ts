import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  status: string; 
  amount: number;
  paymentStatus: string; 
  appointmentDate: string | null; 
}


export interface ApiResponse {
  data: Booking[];
  isSuccess: boolean;
  statusCode: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://localhost:7239/api/Bookings';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Booking[]> {
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
