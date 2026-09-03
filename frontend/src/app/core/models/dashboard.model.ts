export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface SystemStats {
  resumesUploaded: number;
  jobDescriptionsUploaded: number;
  aiAnalysesRun: number;
  interviewSessions: number;
  atsScore?: number;
}

export interface SystemStatus {
  apiStatus: string;
  llmService: string;
  ragPipeline: string;
  streaming: string;
  agentService: string;
}

export interface PhaseItem {
  id: number | string;
  name: string;
  status: 'completed' | 'in_progress' | 'planned';
  description: string;
}

export interface DocumentInfo {
  id: string;
  filename: string;
  fileSize: number;
  uploadedAt: string;
  pageCount: number;
  charCount: number;
  chunkCount: number;
  preview: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  status: string;
}

export interface AtsCheck {
  passed: boolean;
  title: string;
  details: string;
}

export interface AtsScoreData {
  isComplete: boolean;
  message?: string;
  overallAtsScore: number;
  keywordMatchScore: number;
  formattingScore: number;
  actionVerbsScore: number;
  readabilityScore: number;
  checks: AtsCheck[];
  improvementTips: string[];
}

export interface DashboardResponse {
  status: string;
  data: {
    user: UserProfile;
    stats: SystemStats;
    atsScoreData?: AtsScoreData;
    documents: { resume: DocumentInfo | null; jobDescription: DocumentInfo | null };
    systemStatus: SystemStatus;
    phases: PhaseItem[];
    recentActivity: ActivityItem[];
  };
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  phase: string;
  timestamp: string;
  system: {
    uptime: number;
    memoryUsage: any;
  };
}
