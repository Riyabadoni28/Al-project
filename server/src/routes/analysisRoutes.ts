import { Router } from 'express';
import { getJobFitAnalysis, getAtsScore } from '../controllers/analysisController';

const router = Router();

router.get('/fit', getJobFitAnalysis);
router.get('/ats', getAtsScore);

export default router;
