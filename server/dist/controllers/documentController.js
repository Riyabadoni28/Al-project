"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocumentStatus = exports.uploadJobDescription = exports.uploadResume = void 0;
const documentService_1 = require("../services/documents/documentService");
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No resume PDF file uploaded.' });
        }
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ status: 'error', message: 'Only PDF documents are allowed for Resume.' });
        }
        const doc = await documentService_1.documentService.parsePdfBuffer(req.file.buffer, req.file.originalname, 'resume');
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
    }
    catch (err) {
        next(err);
    }
};
exports.uploadResume = uploadResume;
const uploadJobDescription = async (req, res, next) => {
    try {
        if (req.file) {
            if (req.file.mimetype !== 'application/pdf') {
                return res.status(400).json({ status: 'error', message: 'Uploaded file must be a PDF.' });
            }
            const doc = await documentService_1.documentService.parsePdfBuffer(req.file.buffer, req.file.originalname, 'job_description');
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
        }
        else if (req.body && req.body.text) {
            const text = req.body.text;
            if (typeof text !== 'string' || text.trim().length < 20) {
                return res.status(400).json({ status: 'error', message: 'Plain text job description must be at least 20 characters.' });
            }
            const doc = documentService_1.documentService.setPlainTextJd(text, req.body.title || 'Job_Description.txt');
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
        }
        else {
            return res.status(400).json({ status: 'error', message: 'Please provide either a PDF file or text content.' });
        }
    }
    catch (err) {
        next(err);
    }
};
exports.uploadJobDescription = uploadJobDescription;
const getDocumentStatus = (req, res) => {
    res.status(200).json({
        status: 'success',
        documents: documentService_1.documentService.getStatus(),
    });
};
exports.getDocumentStatus = getDocumentStatus;
const deleteDocument = (req, res) => {
    const type = req.params.type;
    const deleted = documentService_1.documentService.deleteDocument(type);
    if (deleted) {
        res.status(200).json({ status: 'success', message: `${type} removed.` });
    }
    else {
        res.status(400).json({ status: 'error', message: 'Invalid document type.' });
    }
};
exports.deleteDocument = deleteDocument;
