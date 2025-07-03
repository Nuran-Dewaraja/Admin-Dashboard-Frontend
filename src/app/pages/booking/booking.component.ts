import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, Booking } from '../../services/booking.service';

interface BookingRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingDate?: Date;
  appointmentDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes?: string;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css'
})
export class BookingComponent implements OnInit {
  bookings: BookingRecord[] = [];
  filteredBookings: BookingRecord[] = [];
  paginatedBookings: BookingRecord[] = [];

  // Filters
  searchTerm: string = '';
  statusFilter: string = '';
  paymentFilter: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  // Sorting
  sortField: string = 'appointmentDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  // Modal
  selectedBooking: BookingRecord | null = null;
  showModal: boolean = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    this.bookingService.getCustomers().subscribe({
      next: (data: Booking[]) => {
        this.bookings = data.map(b => ({
          id: b.id.toString(),
          customerName: b.customerName,
          customerEmail: b.customerEmail,
          bookingDate: new Date(), // or use real bookingDate if available
          appointmentDate: b.appointmentDate ? new Date(b.appointmentDate) : new Date(),
          status: this.status(b.status ),
          amount: b.amount,
          paymentStatus: this.mapPaymentStatus(b.paymentStatus),
          notes: ''
        }));
        this.filterBookings();
      },
      error: err => {
        console.error('Error fetching bookings:', err);
      }
    });
  }

  private mapPaymentStatus(code: string | number): 'paid' | 'pending' | 'refunded' {
    switch (code) {
      case '1':
      case 1:
        return 'paid';
      case '2':
      case 2:
        return 'pending';
      case '3':
      case 3:
        return 'refunded';
      default:
        return 'pending'; 
    }
  }

  private status(code: string | number): 'confirmed' | 'pending' | 'cancelled' | 'completed' {
    switch (code) {
      case '1':
      case 1:
        return 'completed';
      case '2':
      case 2:
        return 'pending';
      case '3':
      case 3:
        return 'confirmed';
      case '4':
      case 4:
        return 'cancelled';
      default:
        return 'pending'; 
    }
  }

  filterBookings(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      const matchesSearch = !this.searchTerm ||
        booking.customerName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || booking.status === this.statusFilter;
      const matchesPayment = !this.paymentFilter || booking.paymentStatus === this.paymentFilter;

      const matchesDate = !this.dateFrom ||
        new Date(booking.appointmentDate) >= new Date(this.dateFrom);

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });

    this.sortBookings();
    this.updatePagination();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortBookings();
    this.updatePagination();
  }

  sortBookings(): void {
    this.filteredBookings.sort((a, b) => {
      let aValue = a[this.sortField as keyof BookingRecord];
      let bValue = b[this.sortField as keyof BookingRecord];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return this.sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return this.sortDirection === 'asc' ? -1 : 1;

      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedBookings = this.filteredBookings.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPaginationPages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Statistics
  getTotalBookings(): number {
    return this.filteredBookings.length;
  }

  getTotalRevenue(): number {
    return this.filteredBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);
  }

  getPendingBookings(): number {
    return this.filteredBookings.filter(b => b.status === 'pending').length;
  }

  getCompletedBookings(): number {
    return this.filteredBookings.filter(b => b.status === 'completed').length;
  }

  // Modal
  openBookingDetails(booking: BookingRecord): void {
    this.selectedBooking = booking;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBooking = null;
  }

  updateBookingStatus(bookingId: string, newStatus: string): void {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = newStatus as any;
      this.filterBookings();
    }
  }

  deleteBooking(bookingId: string): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookings = this.bookings.filter(b => b.id !== bookingId);
      this.filterBookings();
    }
  }

  exportToCSV(): void {
    const headers = ['ID', 'Customer Name', 'Email', 'Appointment Date', 'Status', 'Amount', 'Payment Status'];
    const csvContent = [
      headers.join(','),
      ...this.filteredBookings.map(booking => [
        booking.id,
        `"${booking.customerName}"`,
        booking.customerEmail,
        booking.appointmentDate.toLocaleDateString(),
        booking.status,
        booking.amount,
        booking.paymentStatus
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'booking-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  trackByBookingId(index: number, booking: BookingRecord): string {
    return booking.id;
  }
}
