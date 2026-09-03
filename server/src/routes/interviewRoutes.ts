import { Router } from 'express';
import { getInterviewPrepQuestions } from '../controllers/interviewController';

const router = Router();

router.get('/questions', getInterviewPrepQuestions);

export default router;
