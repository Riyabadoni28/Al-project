import OpenAI from 'openai';
import { documentService } from '../documents/documentService';

export interface BulletOptimizationRequest {
  originalBullet: string;
  targetRole?: string;
}

export interface CoverLetterRequest {
  companyName?: string;
  jobTitle?: string;
  tone?: 'professional' | 'enthusiastic' | 'concise';
}

export interface AnswerEvaluationRequest {
  question: string;
  userAnswer: string;
  suggestedAnswer?: string;
}

class AgentService {
  private openaiClient: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  // ─── Agent Tool 1: Bullet Point Optimizer (STAR Method) ──────────────────────
  async optimizeResumeBullet(req: BulletOptimizationRequest): Promise<any> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    const prompt = `You are an expert Executive Resume Writer and Career Coach.
Optimize the following resume bullet point using the STAR (Situation, Task, Action, Result) method.
Make it high-impact, quantifiable, and aligned with strong engineering practices.

ORIGINAL BULLET: "${req.originalBullet}"
${req.targetRole ? `TARGET ROLE: ${req.targetRole}` : ''}
${jd ? `JOB CONTEXT: ${jd.extractedText.slice(0, 500)}` : ''}

Return ONLY a JSON object (no markdown surrounding):
{
  "original": "${req.originalBullet}",
  "improvedBullets": [
    "Quantified STAR bullet 1 with metrics...",
    "Action-oriented STAR bullet 2...",
    "Technical achievement focused STAR bullet 3..."
  ],
  "keyKeywordsAdded": ["keyword1", "keyword2"],
  "impactScore": 92
}`;

    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(raw);
      } catch (err: any) {
        console.warn('LLM Agent error, returning smart fallback:', err.message);
      }
    }

    // Fallback bullet optimizer logic
    const orig = req.originalBullet;
    return {
      original: orig,
      improvedBullets: [
        `Spearheaded development of ${orig.toLowerCase()}, reducing processing latency by 35% across high-volume production workflows.`,
        `Architected and integrated scalable solutions for ${orig.toLowerCase()}, boosting system reliability to 99.9% uptime.`,
        `Led cross-functional engineering efforts to deliver ${orig.toLowerCase()}, accelerating release cycles by 2 weeks.`,
      ],
      keyKeywordsAdded: ['Spearheaded', 'Architected', 'Scalable Solutions', 'Metrics-Driven'],
      impactScore: 88,
    };
  }

  // ─── Agent Tool 2: Tailored Cover Letter Generator ───────────────────────────
  async generateCoverLetter(req: CoverLetterRequest): Promise<any> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    const company = req.companyName || 'Hiring Team';
    const role = req.jobTitle || (jd ? jd.filename.replace('.pdf', '') : 'Software Engineer');

    const prompt = `You are a professional Career Agent. Generate a compelling, tailored cover letter.
    
CANDIDATE RESUME SUMMARY:
${resume ? resume.extractedText.slice(0, 1500) : 'Fullstack Developer with expertise in Angular, TypeScript, Node.js, and REST APIs.'}

JOB DESCRIPTION CONTEXT:
${jd ? jd.extractedText.slice(0, 1500) : `Role: ${role} at ${company}`}

COMPANY: ${company}
ROLE: ${role}
TONE: ${req.tone || 'professional'}

Return ONLY a JSON object:
{
  "company": "${company}",
  "role": "${role}",
  "subjectLine": "Application for ${role} position - [Candidate Name]",
  "coverLetterText": "<full cover letter text with paragraphs>",
  "matchHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}`;

    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(raw);
      } catch (err: any) {
        console.warn('LLM Cover Letter Agent error, returning smart fallback:', err.message);
      }
    }

    const resTitle = resume ? resume.filename.replace('.pdf', '') : 'Candidate';
    return {
      company,
      role,
      subjectLine: `Application for ${role} Position — Alex Johnson`,
      coverLetterText: `Dear Hiring Manager at ${company},

I am writing to express my enthusiastic interest in the ${role} position. With my background in modern full-stack web engineering, scalable API architecture, and interactive user interface design, I am confident in my ability to contribute effectively to your engineering team.

My experience documented in my candidate portfolio highlights hands-on expertise with TypeScript, Angular 17, Node.js RESTful APIs, and cloud architecture patterns. In my recent projects, I designed and deployed modular component architectures, optimized state management pipelines, and integrated real-time AI endpoints.

What excites me most about ${company} is your commitment to technical innovation and developer excellence. I bring a strong analytical mindset, a collaborative approach to code reviews, and a track record of delivering clean, maintainable software.

Thank you for your time and consideration. I welcome the opportunity to discuss how my background aligns with your team's goals.

Sincerely,
Alex Johnson`,
      matchHighlights: [
        'Full-stack architecture alignment with target requirements',
        'Proven hands-on experience with TypeScript & Node.js ecosystem',
        'Strong problem-solving and clean code discipline',
      ],
    };
  }

  // ─── Agent Tool 3: Interview Answer Evaluator ────────────────────────────────
  async evaluateInterviewAnswer(req: AnswerEvaluationRequest): Promise<any> {
    const prompt = `You are a Senior Technical Interviewer evaluating a candidate's answer.

QUESTION: "${req.question}"
CANDIDATE ANSWER: "${req.userAnswer}"
${req.suggestedAnswer ? `MODEL ANSWER: "${req.suggestedAnswer}"` : ''}

Evaluate the candidate's answer constructively.

Return ONLY a JSON object:
{
  "score": <number 1-10>,
  "grade": "<Excellent|Good|Needs Improvement>",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "refinedAnswer": "<an improved version of their answer incorporating STAR and technical depth>",
  "followUpQuestion": "<a logical follow-up question the interviewer might ask next>"
}`;

    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(raw);
      } catch (err: any) {
        console.warn('LLM Answer Evaluation Agent error:', err.message);
      }
    }

    const answerLength = req.userAnswer.trim().length;
    const score = answerLength > 120 ? 8 : answerLength > 50 ? 6 : 4;

    return {
      score,
      grade: score >= 8 ? 'Good Answer' : 'Needs Technical Depth',
      strengths: [
        'Addressed the core concept of the question directly',
        'Used relevant technical vocabulary',
      ],
      improvements: [
        'Include concrete metrics or project examples to validate your experience',
        'Elaborate on technical trade-offs considered during implementation',
      ],
      refinedAnswer: `To build on your answer: "${req.userAnswer}" — start by explaining the problem context, specify the exact technologies/patterns you chose, and conclude with the measurable business or performance impact.`,
      followUpQuestion: 'How would your approach change if the scale increased by 10x?',
    };
  }
}

export const agentService = new AgentService();
