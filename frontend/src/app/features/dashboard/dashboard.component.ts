import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { HealthService } from '../../core/services/health.service';
import { DashboardResponse, HealthResponse, AtsScoreData } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardResponse['data'] | null = null;
  healthData: HealthResponse | null = null;
  atsData: AtsScoreData | null = null;
  isScanning = false;

  constructor(
    private dashboardService: DashboardService,
    private healthService: HealthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isScanning = true;
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.dashboardData = res.data;
        this.atsData = res.data.atsScoreData || null;
        this.isScanning = false;
      },
      error: () => {
        this.isScanning = false;
      },
    });

    this.healthService.checkHealth().subscribe({
      next: (res) => {
        this.healthData = res;
      },
    });
  }

  getScoreClass(score?: number): string {
    if (!score) return 'score-low';
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  }

  getScoreGrade(score?: number): string {
    if (!score) return 'ATS Audit Pending';
    if (score >= 85) return '🎉 Excellent ATS Optimization';
    if (score >= 70) return '👍 Good ATS Compatibility';
    if (score >= 50) return '⚠️ Moderate ATS Pass Rate';
    return '❌ High Risk of ATS Filter Rejection';
  }
}
