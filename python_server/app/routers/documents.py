from fastapi import APIRouter, File, Form, HTTPException, UploadFile
import logging

from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["documents"])
logger = logging.getLogger(__name__)


@router.get("/status")
def get_document_status():
    return {"status": "success", "documents": document_service.get_status()}


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        logger.info(f"Upload resume request: filename={file.filename}, content_type={file.content_type}, size={file.size}")
        
        if not file:
            raise HTTPException(status_code=400, detail="No file provided in request.")
        
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"Only PDF documents are allowed for Resume. Received: {file.content_type}")

        buffer = await file.read()
        
        if not buffer:
            raise HTTPException(status_code=400, detail="Uploaded file is empty. Please select a valid PDF file.")
        
        logger.info(f"PDF buffer size: {len(buffer)} bytes")
        
        try:
            doc = document_service.parse_pdf_buffer(buffer, file.filename or "resume.pdf", "resume")
        except ValueError as e:
            logger.error(f"PDF parsing error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
        
        logger.info(f"Resume uploaded successfully: {doc.id}, extracted {doc.char_count} characters")
        
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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in upload_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/upload-jd")
async def upload_job_description_file(file: UploadFile = File(...)):
    """Upload Job Description as PDF file"""
    try:
        logger.info(f"Upload JD file request: filename={file.filename}, content_type={file.content_type}")
        
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail=f"Uploaded file must be a PDF. Received: {file.content_type}")
        
        buffer = await file.read()
        
        if not buffer:
            raise HTTPException(status_code=400, detail="Uploaded file is empty. Please select a valid PDF file.")
        
        logger.info(f"PDF buffer size: {len(buffer)} bytes")
        
        try:
            doc = document_service.parse_pdf_buffer(buffer, file.filename or "job_description.pdf", "job_description")
        except ValueError as e:
            logger.error(f"PDF parsing error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
        
        logger.info(f"Job Description uploaded successfully: {doc.id}, extracted {doc.char_count} characters")
        
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
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in upload_jd: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/upload-jd/text")
async def upload_job_description_text(text: str = Form(...), title: str = Form(default="Job_Description.txt")):
    """Upload Job Description as plain text"""
    try:
        logger.info(f"Upload JD text request: title={title}, text_length={len(text)}")
        
        if not text or len(text.strip()) < 20:
            raise HTTPException(status_code=400, detail="Text content must be at least 20 characters.")
        
        doc = document_service.set_plain_text_jd(text, title)
        logger.info(f"Job Description text saved successfully: {doc.id}, extracted {doc.char_count} characters")
        
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
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in upload_jd/text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{doc_type}")
def delete_document(doc_type: str):
    deleted = document_service.delete_document(doc_type)
    if deleted:
        return {"status": "success", "message": f"{doc_type} removed."}
    raise HTTPException(status_code=400, detail="Invalid document type.")
