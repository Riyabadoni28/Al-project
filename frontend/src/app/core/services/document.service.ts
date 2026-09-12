import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DocumentStatus {
  resume: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    pageCount: number;
    charCount: number;
    preview: string;
  } | null;
  jobDescription: {
    id: string;
    filename: string;
    fileSize: number;
    uploadedAt: string;
    pageCount: number;
    charCount: number;
    preview: string;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private apiService: ApiService) {}

  getStatus(): Observable<{ status: string; documents: DocumentStatus }> {
    return this.apiService.get('/documents/status');
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post('/documents/upload-resume', formData);
  }

  uploadJobDescriptionFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post('/documents/upload-jd', formData);
  }

  uploadJobDescriptionText(text: string, title?: string): Observable<any> {
    const formData = new FormData();
    formData.append('text', text);
    if (title) {
      formData.append('title', title);
    }
    return this.apiService.post('/documents/upload-jd/text', formData);
  }

  deleteDocument(type: 'resume' | 'job_description'): Observable<any> {
    return this.apiService.delete(`/documents/${type}`);
  }
}
