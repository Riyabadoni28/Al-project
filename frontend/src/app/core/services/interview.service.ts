import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface InterviewQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  suggestedAnswer: string;
  keyPoints?: string[];
}

export interface InterviewData {
  resumeFilename: string;
  jobDescriptionFilename: string;
  generatedBy: string;
  questions: InterviewQuestion[];
}

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  constructor(private apiService: ApiService) {}

  getQuestions(): Observable<{ status: string; data: InterviewData }> {
    return this.apiService.get('/interview/questions');
  }
}
