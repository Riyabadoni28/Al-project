import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ChatSource {
  document: string;
  page?: number;
  snippet: string;
}

export interface ChatResponseMessage {
  answer: string;
  sources: ChatSource[];
  modelUsed: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private streamUrl = 'http://localhost:8500/api/chat/stream';

  constructor(private apiService: ApiService) {}

  sendMessage(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Observable<{ status: string; data: ChatResponseMessage }> {
    return this.apiService.post('/chat/message', { message, history });
  }

  /**
   * SSE Streaming: Returns a ReadableStream that the component can iterate over.
   */
  streamMessage(
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<Response> {
    return fetch(this.streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
  }
}
