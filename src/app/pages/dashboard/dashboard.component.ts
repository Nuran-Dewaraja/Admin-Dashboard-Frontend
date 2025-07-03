import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Analytics, DashboardService } from '../../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('salesChart', { static: true }) salesChart!: ElementRef;
  @ViewChild('trafficChart', { static: true }) trafficChart!: ElementRef;
  @ViewChild('revenueChart', { static: true }) revenueChart!: ElementRef;
  @ViewChild('conversionChart', { static: true }) conversionChart!: ElementRef;

  private charts: Chart[] = [];
  analyticsData: Analytics[] = [];

  // KPI values
  totalUsers = 0;
  totalRevenue = 0;
  conversionRate = 0;
  averageOrderValue = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dashboardService: DashboardService
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.dashboardService.getCustomers().subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.calculateKpis();
          this.initializeCharts();
        },
        error: (err) => console.error('Analytics fetch failed', err)
      });
    }
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  private calculateKpis(): void {
    const totalBookings = this.analyticsData.reduce((sum, item) => sum + item.totalBookings, 0);
    this.totalRevenue = this.analyticsData.reduce((sum, item) => sum + item.totalRevenue, 0);
    this.totalUsers = totalBookings; // assuming each booking is by 1 user

    this.averageOrderValue = totalBookings > 0
      ? +(this.totalRevenue / totalBookings).toFixed(2)
      : 0;

    // Sample: assuming conversion rate is proportional to bookings / max bookings * 100
    const maxBookings = Math.max(...this.analyticsData.map(a => a.totalBookings));
    this.conversionRate = maxBookings > 0
      ? +(totalBookings / (this.analyticsData.length * maxBookings) * 100).toFixed(1)
      : 0;
  }

  private initializeCharts(): void {
    this.createSalesChart();
    this.createTrafficChart();
    this.createRevenueChart();
    this.createConversionChart();
  }

  private createSalesChart(): void {
    const ctx = this.salesChart.nativeElement.getContext('2d');
    if (!ctx || this.analyticsData.length === 0) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.analyticsData.map(a => a.date),
        datasets: [{
          label: 'Bookings',
          data: this.analyticsData.map(a => a.totalBookings),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createTrafficChart(): void {
    const ctx = this.trafficChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Organic', 'Direct', 'Social', 'Referral'],
        datasets: [{
          data: [45, 25, 15, 15],
          backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createRevenueChart(): void {
    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx || this.analyticsData.length === 0) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.analyticsData.map(a => a.date),
        datasets: [
          {
            label: 'Revenue',
            data: this.analyticsData.map(a => a.totalRevenue),
            backgroundColor: '#3b82f6',
            borderRadius: 4
          },
          {
            label: 'Bookings',
            data: this.analyticsData.map(a => a.totalBookings),
            backgroundColor: '#10b981',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createConversionChart(): void {
    const ctx = this.conversionChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Conversion Rate (%)',
          data: [2.8, 3.1, 3.4, 3.2], // You can replace this with calculated dynamic values if available
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 2.5,
            max: 3.5,
            grid: { color: '#f3f4f6' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });

    this.charts.push(chart);
  }
}
