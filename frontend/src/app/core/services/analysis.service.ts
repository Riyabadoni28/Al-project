import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface JobFitData {
  isComplete: boolean;
  message?: string;
  resumeUploaded?: boolean;
  jobDescriptionUploaded?: boolean;
  overallMatch?: number;
  matchGrade?: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  relevantExperience?: { project: string; relevance: 'High' | 'Medium' | 'Low'; description: string }[];
  recommendations?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  constructor(private apiService: ApiService) {}

  getFitAnalysis(): Observable<{ status: string; data: JobFitData }> {
    return this.apiService.get('/analysis/fit');
  }
}
