import { Component, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ChatService, ChatSource } from '../../core/services/chat.service';

interface DisplayMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: ChatSource[];
  modelUsed?: string;
  streaming?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  userInput = '';
  isLoading = false;
  useStreaming = true;
  messages: DisplayMessage[] = [];
  private shouldScrollBottom = false;

  presetPrompts = [
    { icon: 'work_outline', text: 'Am I suitable for this job?' },
    { icon: 'checklist', text: 'What skills match the job description?' },
    { icon: 'warning_amber', text: 'What skills am I missing?' },
    { icon: 'lightbulb', text: 'What projects should I highlight?' },
    { icon: 'psychology', text: 'Generate interview questions for me' },
    { icon: 'trending_up', text: 'How can I improve my application?' },
  ];

  constructor(
    private chatService: ChatService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewChecked(): void {
    if (this.shouldScrollBottom) {
      this.scrollToBottom();
      this.shouldScrollBottom = false;
    }
  }

  ngOnDestroy(): void {}

  toggleStreaming(): void {
    this.useStreaming = !this.useStreaming;
    this.snackBar.open(
      `Switched to ${this.useStreaming ? 'SSE Streaming' : 'Standard'} mode`,
      '',
      { duration: 2000 }
    );
  }

  sendPresetPrompt(prompt: string): void {
    if (this.isLoading) return;
    this.userInput = prompt;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const query = this.userInput.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.messages.push({ sender: 'user', text: query, timestamp });
    this.userInput = '';
    this.isLoading = true;
    this.shouldScrollBottom = true;

    const history = this.messages
      .filter((m) => !m.streaming)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

    if (this.useStreaming) {
      this.sendStreamingMessage(query, history);
    } else {
      this.sendStandardMessage(query, history);
    }
  }

  private sendStandardMessage(query: string, history: { role: 'user' | 'assistant'; content: string }[]): void {
    this.chatService.sendMessage(query, history).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messages.push({
          sender: 'ai',
          text: res.data.answer,
          sources: res.data.sources,
          modelUsed: res.data.modelUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        this.shouldScrollBottom = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to get response. Check backend connection.', 'Dismiss', { duration: 4000 });
      },
    });
  }

  private async sendStreamingMessage(query: string, history: { role: 'user' | 'assistant'; content: string }[]): Promise<void> {
    const aiMsg: DisplayMessage = {
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      streaming: true,
    };
    this.messages.push(aiMsg);
    this.shouldScrollBottom = true;

    try {
      const response = await this.chatService.streamMessage(query, history);

      if (!response.ok || !response.body) {
        throw new Error('Stream connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: token')) continue;
          if (line.startsWith('event: done')) continue;
          if (line.startsWith('event: error')) continue;

          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const parsed = JSON.parse(jsonStr);

              if (parsed.token !== undefined) {
                aiMsg.text += parsed.token;
                this.shouldScrollBottom = true;
                this.cdr.detectChanges();
              } else if (parsed.sources !== undefined) {
                aiMsg.sources = parsed.sources;
                aiMsg.modelUsed = parsed.modelUsed;
                aiMsg.streaming = false;
                this.isLoading = false;
                this.cdr.detectChanges();
              } else if (parsed.message) {
                aiMsg.text = `❌ Error: ${parsed.message}`;
                aiMsg.streaming = false;
                this.isLoading = false;
                this.cdr.detectChanges();
              }
            } catch {}
          }
        }
      }

      aiMsg.streaming = false;
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch {
      const lastMsg = this.messages[this.messages.length - 1];
      if (lastMsg?.streaming) {
        lastMsg.text = '❌ Streaming connection failed. Please check the backend.';
        lastMsg.streaming = false;
      }
      this.isLoading = false;
      this.snackBar.open('Streaming failed. Check backend connection.', 'Dismiss', { duration: 4000 });
      this.cdr.detectChanges();
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  formatMarkdown(text: string): string {
    return text
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/#### (.*?)\n/g, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n{2,}/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  }

  copyText(text: string): void {
    navigator.clipboard.writeText(text);
    this.snackBar.open('Response copied to clipboard!', 'OK', { duration: 2500 });
  }

  clearChat(): void {
    this.messages = [];
  }
}
