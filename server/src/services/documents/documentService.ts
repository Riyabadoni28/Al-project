const pdfParse = require('pdf-parse');

export interface DocumentChunk {
  chunkIndex: number;
  text: string;
  charStart: number;
  charEnd: number;
}

export interface DocumentMeta {
  id: string;
  type: 'resume' | 'job_description';
  filename: string;
  fileSize: number;
  uploadedAt: string;
  pageCount: number;
  extractedText: string;
  charCount: number;
  chunks: DocumentChunk[];
}

class DocumentService {
  private activeResume: DocumentMeta | null = null;
  private activeJobDescription: DocumentMeta | null = null;

  // ---------- RAG Chunking ----------
  private chunkText(text: string, chunkSize = 600, overlap = 100): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push({
        chunkIndex: index++,
        text: text.slice(start, end),
        charStart: start,
        charEnd: end,
      });
      if (end === text.length) break;
      start += chunkSize - overlap;
    }
    return chunks;
  }

  // ---------- TF-IDF Style Keyword Retrieval ----------
  retrieveRelevantChunks(
    doc: DocumentMeta,
    query: string,
    topK = 3
  ): DocumentChunk[] {
    if (!doc.chunks.length) return [];

    const queryTokens = query.toLowerCase().split(/\W+/).filter(Boolean);

    const scored = doc.chunks.map((chunk) => {
      const chunkLower = chunk.text.toLowerCase();
      const score = queryTokens.reduce((acc, token) => {
        const matches = (chunkLower.match(new RegExp(token, 'g')) || []).length;
        return acc + matches;
      }, 0);
      return { chunk, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.chunk);
  }

  // ---------- Build RAG Context String ----------
  buildRagContext(query: string): string {
    const resume = this.activeResume;
    const jd = this.activeJobDescription;
    let context = '';

    if (resume) {
      const chunks = this.retrieveRelevantChunks(resume, query);
      context += `\n--- RESUME CONTEXT (${resume.filename}) ---\n`;
      context += chunks.map((c) => c.text).join('\n...\n');
    }

    if (jd) {
      const chunks = this.retrieveRelevantChunks(jd, query);
      context += `\n--- JOB DESCRIPTION CONTEXT (${jd.filename}) ---\n`;
      context += chunks.map((c) => c.text).join('\n...\n');
    }

    return context;
  }

  // ---------- PDF Parsing ----------
  async parsePdfBuffer(buffer: Buffer, filename: string, type: 'resume' | 'job_description'): Promise<DocumentMeta> {
    try {
      const parsed = await pdfParse(buffer);
      const text = (parsed.text || '').trim();
      const chunks = this.chunkText(text);

      const doc: DocumentMeta = {
        id: `${type}_${Date.now()}`,
        type,
        filename,
        fileSize: buffer.length,
        uploadedAt: new Date().toISOString(),
        pageCount: parsed.numpages || 1,
        extractedText: text,
        charCount: text.length,
        chunks,
      };

      if (type === 'resume') {
        this.activeResume = doc;
      } else {
        this.activeJobDescription = doc;
      }

      return doc;
    } catch (err: any) {
      throw new Error(`Failed to parse PDF file "${filename}": ${err.message}`);
    }
  }

  setPlainTextJd(text: string, title = 'Job_Description.txt'): DocumentMeta {
    const trimmed = text.trim();
    const chunks = this.chunkText(trimmed);
    const doc: DocumentMeta = {
      id: `job_description_${Date.now()}`,
      type: 'job_description',
      filename: title,
      fileSize: Buffer.byteLength(trimmed, 'utf8'),
      uploadedAt: new Date().toISOString(),
      pageCount: 1,
      extractedText: trimmed,
      charCount: trimmed.length,
      chunks,
    };
    this.activeJobDescription = doc;
    return doc;
  }

  getResume(): DocumentMeta | null {
    return this.activeResume;
  }

  getJobDescription(): DocumentMeta | null {
    return this.activeJobDescription;
  }

  deleteDocument(type: 'resume' | 'job_description'): boolean {
    if (type === 'resume') {
      this.activeResume = null;
      return true;
    } else if (type === 'job_description') {
      this.activeJobDescription = null;
      return true;
    }
    return false;
  }

  getStatus() {
    return {
      resume: this.activeResume
        ? {
            id: this.activeResume.id,
            filename: this.activeResume.filename,
            fileSize: this.activeResume.fileSize,
            uploadedAt: this.activeResume.uploadedAt,
            pageCount: this.activeResume.pageCount,
            charCount: this.activeResume.charCount,
            chunkCount: this.activeResume.chunks.length,
            preview: this.activeResume.extractedText.slice(0, 400) + '...',
          }
        : null,
      jobDescription: this.activeJobDescription
        ? {
            id: this.activeJobDescription.id,
            filename: this.activeJobDescription.filename,
            fileSize: this.activeJobDescription.fileSize,
            uploadedAt: this.activeJobDescription.uploadedAt,
            pageCount: this.activeJobDescription.pageCount,
            charCount: this.activeJobDescription.charCount,
            chunkCount: this.activeJobDescription.chunks.length,
            preview: this.activeJobDescription.extractedText.slice(0, 400) + '...',
          }
        : null,
    };
  }
}

export const documentService = new DocumentService();
