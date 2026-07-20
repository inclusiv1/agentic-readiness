import { FormData } from '../pages/Questionnaire';
import { AuditResult } from './index';

export interface TestCase {
  id: string;
  websiteUrl: string;
  formData: FormData;
  expectedSuggestions: string[]; // List of suggestion labels or substrings that should appear
}

export interface TestResult {
  testCaseId: string;
  status: 'pass' | 'fail' | 'error';
  actualSuggestions: string[];
  missingSuggestions: string[];
  unexpectedSuggestions: string[];
  auditResults?: AuditResult;
  error?: string;
}
