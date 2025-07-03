import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BookingComponent } from './pages/booking/booking.component';
import { CustomerComponent } from './pages/customers/customers.component';

export const routes: Routes = [
{ path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'customer', component: CustomerComponent },
  { path: '**', redirectTo: 'login' } 
];
