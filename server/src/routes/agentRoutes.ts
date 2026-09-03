import { Router } from 'express';
import { optimizeBullet, generateCoverLetter, evaluateAnswer } from '../controllers/agentController';

const router = Router();

router.post('/optimize-bullet', optimizeBullet);
router.post('/cover-letter', generateCoverLetter);
router.post('/evaluate-answer', evaluateAnswer);

export default router;
