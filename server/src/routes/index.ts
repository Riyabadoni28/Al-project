import { Router } from 'express';
import healthRoutes from './healthRoutes';
import dashboardRoutes from './dashboardRoutes';
import documentRoutes from './documentRoutes';
import chatRoutes from './chatRoutes';
import analysisRoutes from './analysisRoutes';
import interviewRoutes from './interviewRoutes';
import agentRoutes from './agentRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
router.use('/analysis', analysisRoutes);
router.use('/interview', interviewRoutes);
router.use('/agent', agentRoutes);

export default router;
