import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { InterviewService, InterviewQuestion } from '../../core/services/interview.service';

interface RatedQuestion extends InterviewQuestion {
  selfRating?: number;     // 1-5 stars
  practiced?: boolean;
  noteExpanded?: boolean;
}

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './interview.component.html',
  styleUrl: './interview.component.scss',
})
export class InterviewComponent implements OnInit {
  questions: RatedQuestion[] = [];
  interviewData: any = null;
  isLoading = false;

  get practicedCount(): number {
    return this.questions.filter((q) => q.practiced).length;
  }

  constructor(
    private interviewService: InterviewService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.interviewService.getQuestions().subscribe({
      next: (res) => {
        this.interviewData = res.data;
        this.questions = res.data.questions.map((q) => ({
          ...q,
          selfRating: undefined,
          practiced: false,
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load questions. Check backend.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  rateQuestion(q: RatedQuestion, rating: number): void {
    q.selfRating = q.selfRating === rating ? undefined : rating;
  }

  togglePracticed(q: RatedQuestion): void {
    q.practiced = !q.practiced;
    if (q.practiced) {
      this.snackBar.open('✅ Marked as practiced!', '', { duration: 1500 });
    }
  }
}
