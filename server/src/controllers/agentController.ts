import { Request, Response } from 'express';
import { agentService } from '../services/agent/agentService';

export const optimizeBullet = async (req: Request, res: Response) => {
  try {
    const { originalBullet, targetRole } = req.body;
    if (!originalBullet || !originalBullet.trim()) {
      return res.status(400).json({ status: 'error', message: 'originalBullet is required' });
    }

    const result = await agentService.optimizeResumeBullet({ originalBullet, targetRole });
    res.status(200).json({ status: 'success', data: result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to optimize bullet' });
  }
};

export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { companyName, jobTitle, tone } = req.body;
    const result = await agentService.generateCoverLetter({ companyName, jobTitle, tone });
    res.status(200).json({ status: 'success', data: result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to generate cover letter' });
  }
};

export const evaluateAnswer = async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, suggestedAnswer } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ status: 'error', message: 'question and userAnswer are required' });
    }

    const result = await agentService.evaluateInterviewAnswer({ question, userAnswer, suggestedAnswer });
    res.status(200).json({ status: 'success', data: result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message || 'Failed to evaluate answer' });
  }
};
