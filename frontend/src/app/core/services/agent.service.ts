import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface BulletOptimizationResponse {
  original: string;
  improvedBullets: string[];
  keyKeywordsAdded: string[];
  impactScore: number;
}

export interface CoverLetterResponse {
  company: string;
  role: string;
  subjectLine: string;
  coverLetterText: string;
  matchHighlights: string[];
}

export interface AnswerEvaluationResponse {
  score: number;
  grade: string;
  strengths: string[];
  improvements: string[];
  refinedAnswer: string;
  followUpQuestion: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentToolsService {
  constructor(private apiService: ApiService) {}

  optimizeBullet(originalBullet: string, targetRole?: string): Observable<{ status: string; data: BulletOptimizationResponse }> {
    return this.apiService.post('/agent/optimize-bullet', { originalBullet, targetRole });
  }

  generateCoverLetter(companyName?: string, jobTitle?: string, tone?: string): Observable<{ status: string; data: CoverLetterResponse }> {
    return this.apiService.post('/agent/cover-letter', { companyName, jobTitle, tone });
  }

  evaluateAnswer(question: string, userAnswer: string, suggestedAnswer?: string): Observable<{ status: string; data: AnswerEvaluationResponse }> {
    return this.apiService.post('/agent/evaluate-answer', { question, userAnswer, suggestedAnswer });
  }
}
