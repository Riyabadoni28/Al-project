import { Request, Response } from 'express';
import { llmService } from '../services/llm/llmService';
import { documentService } from '../services/documents/documentService';

export const getInterviewPrepQuestions = async (req: Request, res: Response) => {
  try {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    const questions = await llmService.generateInterviewQuestions();

    res.status(200).json({
      status: 'success',
      data: {
        resumeFilename: resume ? resume.filename : 'Not uploaded',
        jobDescriptionFilename: jd ? jd.filename : 'Not uploaded',
        generatedBy: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4o Mini' : 'AI Career Assistant Engine',
        questions,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate interview questions.',
    });
  }
};
