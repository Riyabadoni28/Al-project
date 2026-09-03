import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/documents/documentService';

export const uploadResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No resume PDF file uploaded.' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ status: 'error', message: 'Only PDF documents are allowed for Resume.' });
    }

    const doc = await documentService.parsePdfBuffer(
      req.file.buffer,
      req.file.originalname,
      'resume'
    );

    res.status(200).json({
      status: 'success',
      message: 'Resume PDF successfully parsed and indexed.',
      document: {
        id: doc.id,
        filename: doc.filename,
        fileSize: doc.fileSize,
        pageCount: doc.pageCount,
        charCount: doc.charCount,
        uploadedAt: doc.uploadedAt,
        preview: doc.extractedText.slice(0, 300) + '...',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadJobDescription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ status: 'error', message: 'Uploaded file must be a PDF.' });
      }

      const doc = await documentService.parsePdfBuffer(
        req.file.buffer,
        req.file.originalname,
        'job_description'
      );

      return res.status(200).json({
        status: 'success',
        message: 'Job Description PDF successfully parsed.',
        document: {
          id: doc.id,
          filename: doc.filename,
          fileSize: doc.fileSize,
          pageCount: doc.pageCount,
          charCount: doc.charCount,
          uploadedAt: doc.uploadedAt,
          preview: doc.extractedText.slice(0, 300) + '...',
        },
      });
    } else if (req.body && req.body.text) {
      const text = req.body.text;
      if (typeof text !== 'string' || text.trim().length < 20) {
        return res.status(400).json({ status: 'error', message: 'Plain text job description must be at least 20 characters.' });
      }

      const doc = documentService.setPlainTextJd(text, req.body.title || 'Job_Description.txt');

      return res.status(200).json({
        status: 'success',
        message: 'Plain text Job Description successfully saved.',
        document: {
          id: doc.id,
          filename: doc.filename,
          fileSize: doc.fileSize,
          pageCount: doc.pageCount,
          charCount: doc.charCount,
          uploadedAt: doc.uploadedAt,
          preview: doc.extractedText.slice(0, 300) + '...',
        },
      });
    } else {
      return res.status(400).json({ status: 'error', message: 'Please provide either a PDF file or text content.' });
    }
  } catch (err) {
    next(err);
  }
};

export const getDocumentStatus = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    documents: documentService.getStatus(),
  });
};

export const deleteDocument = (req: Request, res: Response) => {
  const type = req.params.type as 'resume' | 'job_description';
  const deleted = documentService.deleteDocument(type);
  if (deleted) {
    res.status(200).json({ status: 'success', message: `${type} removed.` });
  } else {
    res.status(400).json({ status: 'error', message: 'Invalid document type.' });
  }
};
