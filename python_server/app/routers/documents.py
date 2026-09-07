from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("/status")
def get_document_status():
    return {"status": "success", "documents": document_service.get_status()}


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF documents are allowed for Resume.")

    buffer = await file.read()
    doc = document_service.parse_pdf_buffer(buffer, file.filename or "resume.pdf", "resume")
    return {
        "status": "success",
        "message": "Resume PDF successfully parsed and indexed.",
        "document": {
            "id": doc.id,
            "filename": doc.filename,
            "fileSize": doc.file_size,
            "pageCount": doc.page_count,
            "charCount": doc.char_count,
            "uploadedAt": doc.uploaded_at,
            "preview": (doc.extracted_text[:300] + "...") if len(doc.extracted_text) > 300 else doc.extracted_text,
        },
    }


@router.post("/upload-jd")
async def upload_job_description(file: UploadFile | None = File(default=None), text: str | None = Form(default=None), title: str | None = Form(default=None)):
    if file is not None:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Uploaded file must be a PDF.")
        buffer = await file.read()
        doc = document_service.parse_pdf_buffer(buffer, file.filename or "job_description.pdf", "job_description")
        return {
            "status": "success",
            "message": "Job Description PDF successfully parsed.",
            "document": {
                "id": doc.id,
                "filename": doc.filename,
                "fileSize": doc.file_size,
                "pageCount": doc.page_count,
                "charCount": doc.char_count,
                "uploadedAt": doc.uploaded_at,
                "preview": (doc.extracted_text[:300] + "...") if len(doc.extracted_text) > 300 else doc.extracted_text,
            },
        }

    if text and len(text.strip()) >= 20:
        doc = document_service.set_plain_text_jd(text, title or "Job_Description.txt")
        return {
            "status": "success",
            "message": "Plain text Job Description successfully saved.",
            "document": {
                "id": doc.id,
                "filename": doc.filename,
                "fileSize": doc.file_size,
                "pageCount": doc.page_count,
                "charCount": doc.char_count,
                "uploadedAt": doc.uploaded_at,
                "preview": (doc.extracted_text[:300] + "...") if len(doc.extracted_text) > 300 else doc.extracted_text,
            },
        }

    raise HTTPException(status_code=400, detail="Please provide either a PDF file or text content.")


@router.delete("/{doc_type}")
def delete_document(doc_type: str):
    deleted = document_service.delete_document(doc_type)
    if deleted:
        return {"status": "success", "message": f"{doc_type} removed."}
    raise HTTPException(status_code=400, detail="Invalid document type.")
