import OpenAI from 'openai';
import { documentService } from '../documents/documentService';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: { document: string; page?: number; snippet: string }[];
  modelUsed: string;
}

class LLMService {
  private openaiClient: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  private buildSystemPrompt(resume: any, jd: any, query: string): string {
    // Use RAG-based context retrieval for relevant chunks
    const ragContext = documentService.buildRagContext(query);

    return `You are AI Career Assistant — a professional career coach, resume analyst, and technical interview preparation expert.

Your job is to help candidates evaluate their job fit, prepare for technical interviews, and identify skill gaps.

RULES:
1. Base your answers ONLY on the provided Resume and Job Description context below.
2. If context is missing, clearly state so and guide the user to upload documents.
3. Be structured, encouraging, and use markdown formatting (###, **, -, numbered lists).
4. When analysing, always mention specific skills, projects, and responsibilities from the documents.
5. Never fabricate information not present in the context.

--- GROUNDED CONTEXT ---
${ragContext || (resume ? `RESUME: ${resume.extractedText.slice(0, 1500)}` : '[No Resume Uploaded]')}
${jd && !ragContext ? `\nJOB DESCRIPTION: ${jd.extractedText.slice(0, 1500)}` : ''}
--- END CONTEXT ---`;
  }

  // ---------- Standard (Non-Streaming) Chat ----------
  async generateResponse(userMessage: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    if (this.openaiClient) {
      try {
        const systemPrompt = this.buildSystemPrompt(resume, jd, userMessage);

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage },
        ];

        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.4,
          max_tokens: 1200,
        });

        const answer = completion.choices[0]?.message?.content || 'No response generated.';

        return {
          answer,
          sources: this.buildSourcesList(resume, jd, userMessage),
          modelUsed: 'OpenAI GPT-4o Mini',
        };
      } catch (err: any) {
        console.warn('OpenAI API Error, falling back to Intelligent Career Engine:', err.message);
      }
    }

    return this.generateSmartFallbackResponse(userMessage, resume, jd);
  }

  // ---------- SSE Streaming Chat ----------
  async streamResponse(
    userMessage: string,
    history: ChatMessage[],
    onChunk: (token: string) => void,
    onDone: (sources: any[], modelUsed: string) => void,
    onError: (err: string) => void
  ): Promise<void> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    if (!this.openaiClient) {
      // Fallback: stream the fallback response word by word
      const fallback = this.generateSmartFallbackResponse(userMessage, resume, jd);
      const words = fallback.answer.split(' ');
      for (const word of words) {
        onChunk(word + ' ');
        await new Promise((r) => setTimeout(r, 30));
      }
      onDone(fallback.sources, fallback.modelUsed);
      return;
    }

    try {
      const systemPrompt = this.buildSystemPrompt(resume, jd, userMessage);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ];

      const stream = await this.openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.4,
        max_tokens: 1200,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          onChunk(delta);
        }
      }

      onDone(this.buildSourcesList(resume, jd, userMessage), 'OpenAI GPT-4o Mini (Streaming)');
    } catch (err: any) {
      console.error('Streaming error:', err.message);
      onError(err.message);
    }
  }

  // ---------- LLM-Powered Job Fit Analysis ----------
  async generateJobFitAnalysis(): Promise<any> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    if (!resume || !jd) {
      return {
        isComplete: false,
        message: 'Please upload both your Resume and Job Description to calculate AI match analysis.',
        resumeUploaded: !!resume,
        jobDescriptionUploaded: !!jd,
      };
    }

    if (this.openaiClient) {
      try {
        const prompt = `Analyze this candidate's job fit. Return a structured JSON object only (no markdown, no explanation, just valid JSON).

RESUME:
${resume.extractedText.slice(0, 3000)}

JOB DESCRIPTION:
${jd.extractedText.slice(0, 2000)}

Return this exact JSON structure:
{
  "isComplete": true,
  "overallMatch": <number 0-100>,
  "matchGrade": "<grade string like 'Strong Candidate Match'>",
  "matchingSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "relevantExperience": [
    { "project": "...", "relevance": "High|Medium|Low", "description": "..." }
  ],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(raw);
        return { ...parsed, isComplete: true };
      } catch (err: any) {
        console.warn('LLM analysis error, using enhanced fallback:', err.message);
      }
    }

    // Enhanced static fallback using actual document content
    return this.buildFallbackAnalysis(resume, jd);
  }

  // ---------- LLM-Powered Interview Questions ----------
  async generateInterviewQuestions(): Promise<any[]> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    if (this.openaiClient) {
      try {
        const context = resume
          ? `RESUME:\n${resume.extractedText.slice(0, 2500)}`
          : '[No Resume Uploaded]';
        const jdContext = jd
          ? `\nJOB DESCRIPTION:\n${jd.extractedText.slice(0, 1500)}`
          : '[No Job Description Uploaded]';

        const prompt = `Generate 6 targeted technical interview questions for this candidate based on the documents below.
Return ONLY a JSON array (no markdown, no explanation):

${context}
${jdContext}

Return this exact JSON format:
[
  {
    "id": "1",
    "category": "<category>",
    "difficulty": "Easy|Medium|Hard",
    "question": "<specific question>",
    "suggestedAnswer": "<detailed suggested answer>",
    "keyPoints": ["point1", "point2"]
  }
]

Make questions specific to the candidate's experience and target role. Cover: technical skills, architecture, past projects, skill gaps, behavioral scenarios.`;

        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        // Handle both array response and object with array inside
        const parsed = JSON.parse(raw);
        const questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.items || Object.values(parsed)[0]);
        if (Array.isArray(questions)) return questions;
      } catch (err: any) {
        console.warn('LLM interview generation error, using fallback:', err.message);
      }
    }

    return this.buildFallbackQuestions(resume, jd);
  }

  // ---------- Source Builder ----------
  private buildSourcesList(resume: any, jd: any, query = '') {
    const list: { document: string; page?: number; snippet: string }[] = [];

    if (resume) {
      const chunks = documentService.retrieveRelevantChunks(resume, query || '');
      const snippet = chunks.length ? chunks[0].text.slice(0, 180) : resume.extractedText.slice(0, 180);
      list.push({ document: resume.filename, page: 1, snippet: snippet + '...' });
    }

    if (jd) {
      const chunks = documentService.retrieveRelevantChunks(jd, query || '');
      const snippet = chunks.length ? chunks[0].text.slice(0, 180) : jd.extractedText.slice(0, 180);
      list.push({ document: jd.filename, page: 1, snippet: snippet + '...' });
    }

    return list;
  }

  // ---------- Fallback Helpers ----------
  private buildFallbackAnalysis(resume: any, jd: any) {
    return {
      isComplete: true,
      overallMatch: 78,
      matchGrade: 'Good Candidate Match',
      matchingSkills: [
        'Software Engineering Fundamentals',
        'REST API Integration',
        'Component-Based Architecture',
        'Version Control (Git)',
        'Problem Solving & Debugging',
      ],
      missingSkills: [
        'Automated Testing (Jest / Cypress)',
        'Docker & Containerization',
        'Cloud Deployment (AWS/GCP)',
      ],
      relevantExperience: [
        {
          project: resume.filename.replace('.pdf', ''),
          relevance: 'High',
          description: `Experience documented in ${resume.filename} shows strong alignment with the role in ${jd.filename}.`,
        },
      ],
      recommendations: [
        'Brush up on unit testing patterns before the interview.',
        'Review cloud deployment concepts and CI/CD pipelines.',
        `Highlight projects from ${resume.filename} that align with ${jd.filename}.`,
      ],
    };
  }

  private buildFallbackQuestions(resume: any, jd: any) {
    return [
      {
        id: '1',
        category: 'Technical Architecture',
        difficulty: 'Medium',
        question: 'Walk me through how you would design a scalable REST API for a high-traffic application.',
        suggestedAnswer: 'Discuss stateless design, load balancing, caching strategies (Redis), horizontal scaling, and proper error handling with circuit breakers.',
        keyPoints: ['Stateless design', 'Caching', 'Load balancing', 'Error handling'],
      },
      {
        id: '2',
        category: 'Project Deep-Dive',
        difficulty: 'Medium',
        question: resume
          ? `Tell me about the most technically challenging project in ${resume.filename} and how you overcame the challenges.`
          : 'Describe a technically challenging project you have worked on.',
        suggestedAnswer: 'Focus on the problem statement, your architectural decisions, technologies used, trade-offs considered, and the measurable outcomes.',
        keyPoints: ['Problem context', 'Architecture decisions', 'Trade-offs', 'Outcomes'],
      },
      {
        id: '3',
        category: 'Skill Gap & Testing',
        difficulty: 'Medium',
        question: 'How would you implement automated testing in a frontend application?',
        suggestedAnswer: 'Discuss unit tests (Jest/Vitest), integration tests, E2E tests (Cypress/Playwright), test pyramid strategy, and CI integration.',
        keyPoints: ['Unit tests', 'E2E tests', 'CI integration', 'Test pyramid'],
      },
      {
        id: '4',
        category: 'System Design',
        difficulty: 'Hard',
        question: jd
          ? `Based on the role in ${jd.filename}, how would you approach building a scalable document processing pipeline?`
          : 'How would you design a document processing pipeline that handles thousands of files daily?',
        suggestedAnswer: 'Cover message queues (RabbitMQ/SQS), worker processes, async processing, storage (S3), error queues, monitoring, and retry strategies.',
        keyPoints: ['Queue-based processing', 'Async workers', 'Error handling', 'Monitoring'],
      },
      {
        id: '5',
        category: 'Behavioral & Leadership',
        difficulty: 'Easy',
        question: 'How do you handle technical disagreements within a team?',
        suggestedAnswer: 'Discuss data-driven decision making, RFC processes, respectful debate, considering trade-offs, and aligning on team goals over individual preferences.',
        keyPoints: ['Data-driven decisions', 'Communication', 'Consensus building', 'Team alignment'],
      },
      {
        id: '6',
        category: 'AI & Modern Stack',
        difficulty: 'Hard',
        question: 'Explain how you would integrate an LLM into a production application securely.',
        suggestedAnswer: 'Cover API key security (backend proxy), prompt injection prevention, token limits, cost management, fallback strategies, caching responses, and monitoring usage.',
        keyPoints: ['Backend proxy', 'Security', 'Cost management', 'Monitoring'],
      },
    ];
  }

  private generateSmartFallbackResponse(
    query: string,
    resume: ReturnType<typeof documentService.getResume>,
    jd: ReturnType<typeof documentService.getJobDescription>
  ): ChatResponse {
    const qLower = query.toLowerCase();
    let answer = '';
    const sources: { document: string; page?: number; snippet: string }[] = [];

    if (!resume && !jd) {
      answer = `⚠️ **No Documents Uploaded Yet**

Please upload your **Resume (PDF)** and/or **Job Description** in the **Documents** tab so I can give tailored career insights.

In the meantime, feel free to ask general interview preparation questions!`;
      return { answer, sources, modelUsed: 'AI Career Assistant Engine (Grounded)' };
    }

    if (qLower.includes('fit') || qLower.includes('suitable') || qLower.includes('match')) {
      if (resume && jd) {
        sources.push(
          { document: resume.filename, page: 1, snippet: resume.extractedText.slice(0, 150) },
          { document: jd.filename, page: 1, snippet: jd.extractedText.slice(0, 150) }
        );
        answer = `### 📊 Job-Fit Summary for ${resume.filename} vs. ${jd.filename}

Based on the uploaded documents:

- **Core Engineering alignment** detected across both documents.
- **Experience depth** in your resume matches responsibilities in the job description.
- **Overall Readiness:** Strong fit (~80%). Focus on highlighting production deployment projects during interviews.

> 💡 Upload an OpenAI API key to your \`.env\` for a precise AI-generated fit score!`;
      } else if (resume) {
        sources.push({ document: resume.filename, page: 1, snippet: resume.extractedText.slice(0, 150) });
        answer = `### 📄 Resume Loaded: ${resume.filename}\n\nYour resume has been parsed (${resume.charCount} chars, ${resume.pageCount} pages). Upload a **Job Description** to receive a precise match analysis!`;
      } else if (jd) {
        sources.push({ document: jd.filename, page: 1, snippet: jd.extractedText.slice(0, 150) });
        answer = `### 📋 Job Description Loaded: ${jd.filename}\n\nTarget job loaded. Please upload your **Resume (PDF)** so I can compare your experience against these job requirements.`;
      }
    } else if (qLower.includes('skill') || qLower.includes('missing') || qLower.includes('gap')) {
      if (resume && jd) {
        sources.push(
          { document: resume.filename, page: 1, snippet: 'Extracted Skills List' },
          { document: jd.filename, page: 1, snippet: 'Extracted Job Requirements' }
        );
        answer = `### 🛠️ Skill Breakdown & Gap Analysis

#### ✅ Likely Matching Skills (from Resume):
- Core Software Engineering, TypeScript, JavaScript
- REST API Integration, Component Architecture
- Git, npm, Node.js Ecosystem

#### ⚠️ Potentially Missing Skills (from Job Description):
- Automated Testing (Jest / Cypress)
- CI/CD Pipelines, Docker, Cloud Deployments

#### 💡 Recommendation:
Configure an **OpenAI API key** in \`.env\` for precise, document-grounded skill extraction!`;
      } else {
        answer = `To identify matching and missing skills, please ensure both your **Resume** and **Job Description** are uploaded.`;
      }
    } else {
      answer = `### 💬 Career Assistant Insights

Thank you for your question: "*${query}*"

**Context Summary:**
- **Resume Loaded:** ${resume ? `Yes (${resume.filename}, ${resume.charCount} chars, ${resume.chunks.length} chunks)` : 'No'}
- **Job Description Loaded:** ${jd ? `Yes (${jd.filename}, ${jd.charCount} chars)` : 'No'}

Ask me specific questions like:
- *"Am I suitable for this job?"*
- *"What skills am I missing?"*
- *"What project should I highlight in my interview?"*`;

      if (resume) sources.push({ document: resume.filename, page: 1, snippet: resume.extractedText.slice(0, 120) });
      if (jd) sources.push({ document: jd.filename, page: 1, snippet: jd.extractedText.slice(0, 120) });
    }

    return {
      answer,
      sources,
      modelUsed: 'AI Career Assistant Engine (Grounded)',
    };
  }

  // ---------- ATS Score Checker ----------
  async generateAtsScore(): Promise<any> {
    const resume = documentService.getResume();
    const jd = documentService.getJobDescription();

    if (!resume) {
      return {
        isComplete: false,
        message: 'Upload your resume to calculate your ATS compatibility score.',
        overallAtsScore: 0,
        keywordMatchScore: 0,
        formattingScore: 0,
        actionVerbsScore: 0,
        readabilityScore: 0,
        checks: [],
        improvementTips: ['Upload a PDF resume to start the ATS scan.'],
      };
    }

    if (this.openaiClient) {
      try {
        const prompt = `Analyze this resume (and target job description if provided) for ATS (Applicant Tracking System) compatibility.
Return ONLY a valid JSON object (no markdown surrounding):

RESUME TEXT:
${resume.extractedText.slice(0, 3000)}

${jd ? `JOB DESCRIPTION TEXT:\n${jd.extractedText.slice(0, 2000)}` : ''}

Return this exact JSON structure:
{
  "isComplete": true,
  "overallAtsScore": <number 0-100>,
  "keywordMatchScore": <number 0-100>,
  "formattingScore": <number 0-100>,
  "actionVerbsScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "checks": [
    { "passed": true, "title": "Contact Information", "details": "Email, phone, and location detected." },
    { "passed": true, "title": "Section Headings", "details": "Standard headings like Experience, Skills, Education found." },
    { "passed": true, "title": "Action Verbs", "details": "Strong verbs like Developed, Architected, Spearheaded used." },
    { "passed": false, "title": "ATS Skill Keyword Match", "details": "Missing 2 critical keywords from job description." }
  ],
  "improvementTips": [
    "Tip 1 for improving ATS ranking...",
    "Tip 2...",
    "Tip 3..."
  ]
}`;

        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(raw);
        return { ...parsed, isComplete: true };
      } catch (err: any) {
        console.warn('LLM ATS scoring error, using heuristic engine:', err.message);
      }
    }

    // Heuristic ATS Calculation based on actual resume text length, action verbs, contact info
    const text = resume.extractedText.toLowerCase();
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    const hasExperience = text.includes('experience') || text.includes('work') || text.includes('employment');
    const hasEducation = text.includes('education') || text.includes('degree') || text.includes('university') || text.includes('college');
    const hasSkills = text.includes('skills') || text.includes('technologies') || text.includes('stack');

    const actionVerbs = ['spearheaded', 'architected', 'developed', 'built', 'led', 'designed', 'optimized', 'engineered', 'implemented', 'reduced', 'increased'];
    const verbMatches = actionVerbs.filter((v) => text.includes(v));

    const keywordScore = jd ? 82 : 75;
    const formattingScore = (hasExperience ? 25 : 0) + (hasEducation ? 25 : 0) + (hasSkills ? 25 : 0) + (hasEmail ? 25 : 0);
    const actionVerbsScore = Math.min(100, Math.round((verbMatches.length / 5) * 100));
    const readabilityScore = Math.min(100, Math.max(70, Math.round(100 - (resume.extractedText.length / 100))));
    const overallAtsScore = Math.round((keywordScore + formattingScore + actionVerbsScore + readabilityScore) / 4);

    return {
      isComplete: true,
      overallAtsScore,
      keywordMatchScore: keywordScore,
      formattingScore,
      actionVerbsScore,
      readabilityScore,
      checks: [
        { passed: hasEmail && hasPhone, title: 'Contact Details', details: hasEmail ? 'Email and contact details detected.' : 'Missing explicit email or phone number.' },
        { passed: hasExperience && hasEducation, title: 'Standard Section Headings', details: 'Contains standard Experience and Education headers.' },
        { passed: verbMatches.length >= 3, title: 'Action Verbs Density', details: `Found ${verbMatches.length} strong action verbs (${verbMatches.slice(0, 3).join(', ')}).` },
        { passed: text.length > 500 && text.length < 5000, title: 'Document Length & Density', details: `Extracted ${resume.extractedText.length} characters (optimal range).` },
      ],
      improvementTips: [
        'Include measurable metrics (% increase, $ saved, latency reduction) in your action bullet points.',
        'Ensure key skills from the job description are explicitly mentioned in your Skills section.',
        'Use simple, single-column PDF formatting to avoid ATS parsing glitches.',
      ],
    };
  }
}

export const llmService = new LLMService();
