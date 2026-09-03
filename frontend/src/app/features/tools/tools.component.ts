import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AgentToolsService, BulletOptimizationResponse, CoverLetterResponse, AnswerEvaluationResponse } from '../../core/services/agent.service';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
})
export class ToolsComponent {
  // Tab 1 state
  bulletInput = 'Developed REST API endpoints for user authentication and integrated PostgreSQL database.';
  bulletRole = 'Senior Backend Engineer';
  bulletResult: BulletOptimizationResponse | null = null;
  isBulletLoading = false;

  // Tab 2 state
  coverCompany = 'Acme Tech Solutions';
  coverRole = 'Full Stack Developer';
  coverTone = 'professional';
  coverResult: CoverLetterResponse | null = null;
  isCoverLoading = false;

  // Tab 3 state
  evalQuestion = 'How do you handle performance bottlenecks in a web application?';
  evalAnswer = 'I start by profiling using Chrome DevTools or server APM tools to find slow queries or rendering delays, then implement indexing, caching, or code splitting.';
  evalResult: AnswerEvaluationResponse | null = null;
  isEvalLoading = false;

  constructor(
    private agentToolsService: AgentToolsService,
    private snackBar: MatSnackBar
  ) {}

  runBulletOptimization(): void {
    if (!this.bulletInput.trim() || this.isBulletLoading) return;
    this.isBulletLoading = true;
    this.agentToolsService.optimizeBullet(this.bulletInput, this.bulletRole).subscribe({
      next: (res) => {
        this.bulletResult = res.data;
        this.isBulletLoading = false;
      },
      error: () => {
        this.isBulletLoading = false;
        this.snackBar.open('Optimization failed. Check backend.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  runCoverLetterGeneration(): void {
    this.isCoverLoading = true;
    this.agentToolsService.generateCoverLetter(this.coverCompany, this.coverRole, this.coverTone).subscribe({
      next: (res) => {
        this.coverResult = res.data;
        this.isCoverLoading = false;
      },
      error: () => {
        this.isCoverLoading = false;
        this.snackBar.open('Failed to generate cover letter.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  runAnswerEvaluation(): void {
    if (!this.evalQuestion.trim() || !this.evalAnswer.trim() || this.isEvalLoading) return;
    this.isEvalLoading = true;
    this.agentToolsService.evaluateAnswer(this.evalQuestion, this.evalAnswer).subscribe({
      next: (res) => {
        this.evalResult = res.data;
        this.isEvalLoading = false;
      },
      error: () => {
        this.isEvalLoading = false;
        this.snackBar.open('Evaluation failed.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  copyText(text: string): void {
    navigator.clipboard.writeText(text);
    this.snackBar.open('Copied to clipboard!', 'OK', { duration: 2000 });
  }
}
