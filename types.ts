export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum Recommendation {
  INTERVIEW = 'INTERVIEW',
  DISCARD = 'DISCARD'
}

export interface AnalysisResult {
  recommendation: Recommendation;
  matchScore: number;
  summary: string;
  pros: string[];
  cons: string[];
}

export interface CandidateFile {
  id: string;
  file: File;
  previewUrl: string | null;
  base64: string;
  mimeType: string;
  status: AnalysisStatus;
  result?: AnalysisResult;
  errorMessage?: string;
}

export interface JobConfig {
  title: string;
  requirements: string;
}

export interface User {
  uid?: string;
  username: string;
  name: string;
  isAdmin?: boolean;    // New: Admin flag
  maxCredits?: number;  // New: Custom credit limit per user
  usageCount?: number;  // New: Current usage for display
}