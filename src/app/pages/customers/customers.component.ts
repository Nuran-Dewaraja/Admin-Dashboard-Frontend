import { Component, OnInit } from '@angular/core';
import { CustomersService, Customer as ApiCustomer } from '../../services/customers.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomerComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  paginatedCustomers: Customer[] = [];
  searchTerm: string = '';
  sortField: keyof Customer = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  showModal: boolean = false;
  selectedCustomer: Customer | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.fetchCustomers();
  }

  fetchCustomers() {
    this.loading = true;
    this.error = null;
    
    this.customersService.getCustomers().subscribe({
      next: (data: ApiCustomer[]) => {
        this.customers = data.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phoneNumber
        }));
        this.filteredCustomers = [...this.customers];
        this.updatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
        this.error = 'Failed to load customers. Please try again.';
        this.loading = false;
      }
    });
  }

  filterCustomers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.phone.toLowerCase().includes(term)
    );
    this.sortCustomers();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortBy(field: keyof Customer) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortCustomers();
    this.updatePagination();
  }

  sortCustomers() {
    this.filteredCustomers.sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];
      
      // Handle numeric sorting for ID
      if (this.sortField === 'id') {
        return this.sortDirection === 'asc' 
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }
      
      // Handle string sorting for other fields
      return this.sortDirection === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCustomers = this.filteredCustomers.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  trackByCustomerId(index: number, customer: Customer): number {
    return customer.id;
  }

  viewCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    this.showModal = true;
  }

  deleteCustomer(id: number) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customers = this.customers.filter(customer => customer.id !== id);
      this.filterCustomers();
      this.closeModal();
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedCustomer = null;
  }

  exportToCSV() {
    const headers = ['ID,Name,Email,Phone'];
    const rows = this.filteredCustomers.map(customer =>
      `${customer.id},"${customer.name}","${customer.email}","${customer.phone}"`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  retry() {
    this.fetchCustomers();
  }
}