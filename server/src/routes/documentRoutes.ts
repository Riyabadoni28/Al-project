import { Router } from 'express';
import multer from 'multer';
import {
  uploadResume,
  uploadJobDescription,
  getDocumentStatus,
  deleteDocument,
} from '../controllers/documentController';

const router = Router();
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post('/upload-resume', upload.single('resume'), uploadResume);
router.post('/upload-jd', upload.single('jobDescription'), uploadJobDescription);
router.get('/status', getDocumentStatus);
router.delete('/:type', deleteDocument);

export default router;
