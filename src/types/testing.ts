import { FormData } from '../pages/Questionnaire';
import { AuditResult } from './index';

export interface TestCase {
  id: string;
  name?: string;
  websiteUrl: string;
  formData: FormData;
  expectedSuggestions: string[]; // List of suggestion labels or substrings that should appear
}

export interface TestGroup {
  id: string;
  name: string;
  testCases: TestCase[];
  results?: Record<string, TestResult>;
}

export interface TestResult {
  testCaseId: string;
  websiteUrl: string;
  formData: FormData;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number; // 0 to 100
  actualSuggestions: string[];
  missingSuggestions: string[];
  unexpectedSuggestions: string[];
  auditResults?: AuditResult;
  assessmentResults?: {
    overallScore: number;
    tier: string;
    agenticStatus: string;
  };
  confidenceScores?: Record<string, string>;
  error?: string;
}

export interface BulkTestResults {
  timestamp: string;
  summary: {
    total: number;
    completed: number;
    errors: number;
  };
  results: TestResult[];
}
