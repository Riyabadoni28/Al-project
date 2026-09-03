import { Request, Response } from 'express';
import { documentService } from '../services/documents/documentService';
import { llmService } from '../services/llm/llmService';

export const getDashboardStats = async (req: Request, res: Response) => {
  const docStatus = documentService.getStatus();
  const hasResume = !!docStatus.resume;
  const hasJd = !!docStatus.jobDescription;
  const atsScore = await llmService.generateAtsScore();

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        name: 'Alex Johnson',
        role: 'Senior Frontend Developer',
        avatarUrl: 'assets/avatar-placeholder.png',
      },
      stats: {
        resumesUploaded: hasResume ? 1 : 0,
        jobDescriptionsUploaded: hasJd ? 1 : 0,
        aiAnalysesRun: hasResume && hasJd ? 1 : 0,
        interviewSessions: hasResume ? 1 : 0,
        atsScore: atsScore.overallAtsScore || (hasResume ? 85 : 0),
      },
      atsScoreData: atsScore,
      documents: {
        resume: docStatus.resume,
        jobDescription: docStatus.jobDescription,
      },
      systemStatus: {
        apiStatus: 'Healthy',
        llmService: process.env.OPENAI_API_KEY ? 'OpenAI GPT-4o Mini Connected' : 'Fallback Engine Active',
        ragPipeline: 'Active — Chunking & Retrieval Enabled',
        streaming: 'SSE Streaming Enabled',
        agentService: 'Agentic Tool Calling — Phase 7',
      },
      phases: [
        { id: 1, name: 'Project Setup & Foundations', status: 'completed', description: 'Angular 17 Material frontend + Node.js Express REST API' },
        { id: 2, name: 'LLM Integration & Prompt Engineering', status: 'completed', description: 'GPT-4o Mini integration, system prompts, structured JSON outputs' },
        { id: '3-5', name: 'Document Upload & RAG Pipeline', status: 'completed', description: 'PDF parsing, text chunking, keyword retrieval & citation grounding' },
        { id: '6-7', name: 'SSE Streaming & Agentic Tool Calling', status: 'completed', description: 'Real-time token streaming & autonomous tools execution' },
      ],
      recentActivity: [
        ...(hasResume ? [{
          id: '1',
          type: 'DOCUMENT_UPLOAD',
          title: `Resume: ${docStatus.resume!.filename} (${docStatus.resume!.chunkCount} chunks)`,
          timestamp: docStatus.resume!.uploadedAt,
          status: 'Processed & Chunked',
        }] : []),
        ...(hasJd ? [{
          id: '2',
          type: 'JOB_DESCRIPTION',
          title: `JD: ${docStatus.jobDescription!.filename} (${docStatus.jobDescription!.chunkCount} chunks)`,
          timestamp: docStatus.jobDescription!.uploadedAt,
          status: 'Ready for Analysis',
        }] : []),
        ...(!hasResume && !hasJd ? [{
          id: '0',
          type: 'SYSTEM',
          title: 'System ready — Upload documents to begin AI analysis',
          timestamp: new Date().toISOString(),
          status: 'Waiting',
        }] : []),
      ],
    },
  });
};
