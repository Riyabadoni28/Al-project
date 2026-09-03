"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const pdfParse = require('pdf-parse');
class DocumentService {
    activeResume = null;
    activeJobDescription = null;
    async parsePdfBuffer(buffer, filename, type) {
        try {
            const parsed = await pdfParse(buffer);
            const text = (parsed.text || '').trim();
            const doc = {
                id: `${type}_${Date.now()}`,
                type,
                filename,
                fileSize: buffer.length,
                uploadedAt: new Date().toISOString(),
                pageCount: parsed.numpages || 1,
                extractedText: text,
                charCount: text.length,
            };
            if (type === 'resume') {
                this.activeResume = doc;
            }
            else {
                this.activeJobDescription = doc;
            }
            return doc;
        }
        catch (err) {
            throw new Error(`Failed to parse PDF file "${filename}": ${err.message}`);
        }
    }
    setPlainTextJd(text, title = 'Job_Description.txt') {
        const doc = {
            id: `job_description_${Date.now()}`,
            type: 'job_description',
            filename: title,
            fileSize: Buffer.byteLength(text, 'utf8'),
            uploadedAt: new Date().toISOString(),
            pageCount: 1,
            extractedText: text.trim(),
            charCount: text.trim().length,
        };
        this.activeJobDescription = doc;
        return doc;
    }
    getResume() {
        return this.activeResume;
    }
    getJobDescription() {
        return this.activeJobDescription;
    }
    deleteDocument(type) {
        if (type === 'resume') {
            this.activeResume = null;
            return true;
        }
        else if (type === 'job_description') {
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
                    preview: this.activeResume.extractedText.slice(0, 300) + '...',
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
                    preview: this.activeJobDescription.extractedText.slice(0, 300) + '...',
                }
                : null,
        };
    }
}
exports.documentService = new DocumentService();
