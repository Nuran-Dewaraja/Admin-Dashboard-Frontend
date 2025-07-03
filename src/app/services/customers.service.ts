import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface ApiResponse {
  data: Customer[];
  isSuccess: boolean;
  statusCode: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private apiUrl = 'https://localhost:7239/api/Customer';

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => {
        if (response.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch customers');
        }
      }),
      catchError(error => {
        console.error('API error:', error);
        return throwError(() => error);
      })
    );
  }
}
