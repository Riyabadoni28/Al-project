import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService, DocumentStatus } from '../../core/services/document.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {
  documents: DocumentStatus | null = null;
  isUploadingResume = false;
  isUploadingJd = false;
  plainTextJd = '';

  constructor(
    private documentService: DocumentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDocumentStatus();
  }

  loadDocumentStatus(): void {
    this.documentService.getStatus().subscribe({
      next: (res) => {
        this.documents = res.documents;
      },
    });
  }

  onResumeFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.snackBar.open('Please select a valid PDF file.', 'Close', { duration: 4000 });
      return;
    }

    this.isUploadingResume = true;
    this.documentService.uploadResume(file).subscribe({
      next: () => {
        this.isUploadingResume = false;
        this.snackBar.open('Resume PDF uploaded and parsed successfully!', 'OK', { duration: 4000 });
        this.loadDocumentStatus();
      },
      error: () => {
        this.isUploadingResume = false;
      },
    });
  }

  onJdFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploadingJd = true;
    this.documentService.uploadJobDescriptionFile(file).subscribe({
      next: () => {
        this.isUploadingJd = false;
        this.snackBar.open('Job Description PDF processed successfully!', 'OK', { duration: 4000 });
        this.loadDocumentStatus();
      },
      error: () => {
        this.isUploadingJd = false;
      },
    });
  }

  submitPlainTextJd(): void {
    if (!this.plainTextJd) return;

    this.isUploadingJd = true;
    this.documentService.uploadJobDescriptionText(this.plainTextJd).subscribe({
      next: () => {
        this.isUploadingJd = false;
        this.snackBar.open('Job Description text saved!', 'OK', { duration: 4000 });
        this.plainTextJd = '';
        this.loadDocumentStatus();
      },
      error: () => {
        this.isUploadingJd = false;
      },
    });
  }

  removeDocument(type: 'resume' | 'job_description'): void {
    this.documentService.deleteDocument(type).subscribe({
      next: () => {
        this.snackBar.open(`${type === 'resume' ? 'Resume' : 'Job Description'} removed.`, 'OK', { duration: 3000 });
        this.loadDocumentStatus();
      },
    });
  }
}
