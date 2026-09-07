import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { HealthService } from '../../../core/services/health.service';
import { HealthResponse } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  isBackendOnline = false;
  isSidebarOpen = true;
  isMobile = false;

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.checkBackendHealth();
    this.updateViewportState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportState();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private updateViewportState(): void {
    this.isMobile = window.innerWidth < 768;

    if (this.isMobile) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  checkBackendHealth(): void {
    this.healthService.checkHealth().subscribe({
      next: (res: HealthResponse) => {
        this.isBackendOnline = res.status === 'online';
      },
      error: () => {
        this.isBackendOnline = false;
      },
    });
  }
}
