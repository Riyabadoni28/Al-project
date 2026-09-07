import re
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

from pypdf import PdfReader


class DocumentChunk:
    def __init__(self, chunk_index: int, text: str, char_start: int, char_end: int):
        self.chunk_index = chunk_index
        self.text = text
        self.char_start = char_start
        self.char_end = char_end


class DocumentMeta:
    def __init__(
        self,
        doc_type: str,
        filename: str,
        file_size: int,
        extracted_text: str,
        page_count: int,
        uploaded_at: str,
    ):
        self.id = f"{doc_type}_{uuid4().hex[:8]}"
        self.type = doc_type
        self.filename = filename
        self.file_size = file_size
        self.extracted_text = extracted_text
        self.char_count = len(extracted_text)
        self.page_count = page_count
        self.uploaded_at = uploaded_at
        self.chunks = self._chunk_text(extracted_text)

    def _chunk_text(self, text: str, chunk_size: int = 600, overlap: int = 100) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []
        start = 0
        index = 0
        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end]
            chunks.append(DocumentChunk(index, chunk_text, start, end))
            index += 1
            if end == len(text):
                break
            start += chunk_size - overlap
        return chunks


class DocumentService:
    def __init__(self):
        self.active_resume: Optional[DocumentMeta] = None
        self.active_job_description: Optional[DocumentMeta] = None

    def retrieve_relevant_chunks(self, doc: DocumentMeta, query: str, top_k: int = 3) -> List[DocumentChunk]:
        if not doc.chunks:
            return []

        query_tokens = [token.lower() for token in re.split(r"\W+", query) if token.strip()]
        scored: List[Tuple[DocumentChunk, int]] = []
        for chunk in doc.chunks:
            chunk_lower = chunk.text.lower()
            score = 0
            for token in query_tokens:
                score += len(re.findall(re.escape(token), chunk_lower))
            scored.append((chunk, score))

        scored.sort(key=lambda item: item[1], reverse=True)
        return [chunk for chunk, _ in scored[:top_k]]

    def build_rag_context(self, query: str) -> str:
        context_parts: List[str] = []

        if self.active_resume:
            chunks = self.retrieve_relevant_chunks(self.active_resume, query)
            context_parts.append(f"\n--- RESUME CONTEXT ({self.active_resume.filename}) ---\n")
            context_parts.append("\n...\n".join(chunk.text for chunk in chunks))

        if self.active_job_description:
            chunks = self.retrieve_relevant_chunks(self.active_job_description, query)
            context_parts.append(f"\n--- JOB DESCRIPTION CONTEXT ({self.active_job_description.filename}) ---\n")
            context_parts.append("\n...\n".join(chunk.text for chunk in chunks))

        return "".join(context_parts)

    def parse_pdf_buffer(self, buffer: bytes, filename: str, doc_type: str) -> DocumentMeta:
        try:
            reader = PdfReader(buffer)
            text_parts: List[str] = []
            for page in reader.pages:
                text = page.extract_text() or ""
                text_parts.append(text)
            extracted = "\n".join(text_parts).strip()
            doc = DocumentMeta(doc_type, filename, len(buffer), extracted, len(reader.pages), __import__("datetime").datetime.utcnow().isoformat())
            if doc_type == "resume":
                self.active_resume = doc
            else:
                self.active_job_description = doc
            return doc
        except Exception as exc:  # pragma: no cover
            raise ValueError(f'Failed to parse PDF file "{filename}": {str(exc)}') from exc

    def set_plain_text_jd(self, text: str, title: str = "Job_Description.txt") -> DocumentMeta:
        cleaned = text.strip()
        doc = DocumentMeta("job_description", title, len(cleaned.encode("utf-8")), cleaned, 1, __import__("datetime").datetime.utcnow().isoformat())
        self.active_job_description = doc
        return doc

    def get_resume(self) -> Optional[DocumentMeta]:
        return self.active_resume

    def get_job_description(self) -> Optional[DocumentMeta]:
        return self.active_job_description

    def delete_document(self, doc_type: str) -> bool:
        if doc_type == "resume":
            self.active_resume = None
            return True
        if doc_type == "job_description":
            self.active_job_description = None
            return True
        return False

    def get_status(self) -> Dict[str, Any]:
        return {
            "resume": self._serialize_doc(self.active_resume),
            "jobDescription": self._serialize_doc(self.active_job_description),
        }

    def _serialize_doc(self, doc: Optional[DocumentMeta]) -> Optional[Dict[str, Any]]:
        if not doc:
            return None
        return {
            "id": doc.id,
            "filename": doc.filename,
            "fileSize": doc.file_size,
            "uploadedAt": doc.uploaded_at,
            "pageCount": doc.page_count,
            "charCount": doc.char_count,
            "chunkCount": len(doc.chunks),
            "preview": (doc.extracted_text[:400] + "...") if len(doc.extracted_text) > 400 else doc.extracted_text,
        }


document_service = DocumentService()
