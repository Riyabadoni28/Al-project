import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  getStats(): Observable<DashboardResponse> {
    return this.apiService.get<DashboardResponse>('/dashboard/stats');
  }
}
