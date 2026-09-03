import { Request, Response } from 'express';
import { llmService } from '../services/llm/llmService';

export const getJobFitAnalysis = async (req: Request, res: Response) => {
  try {
    const analysis = await llmService.generateJobFitAnalysis();

    res.status(200).json({
      status: 'success',
      data: analysis,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate job-fit analysis.',
    });
  }
};

export const getAtsScore = async (req: Request, res: Response) => {
  try {
    const atsData = await llmService.generateAtsScore();
    res.status(200).json({
      status: 'success',
      data: atsData,
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate ATS score.',
    });
  }
};
