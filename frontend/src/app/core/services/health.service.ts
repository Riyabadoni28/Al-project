import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HealthResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private apiService: ApiService) {}

  checkHealth(): Observable<HealthResponse> {
    return this.apiService.get<HealthResponse>('/health');
  }
}
