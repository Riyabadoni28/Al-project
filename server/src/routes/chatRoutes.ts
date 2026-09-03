import { Router } from 'express';
import { handleChatMessage, handleChatStream } from '../controllers/chatController';

const router = Router();

router.post('/message', handleChatMessage);
router.post('/stream', handleChatStream);

export default router;
