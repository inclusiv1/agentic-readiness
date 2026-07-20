import React from 'react';

export type Step = 'form' | 'audit' | 'results';

export interface Tag {
  text: string;
  type: 'success' | 'info' | 'warning' | 'neutral';
  category?: 'journey' | 'platform' | 'protocol' | 'channel' | 'goal';
}

export interface AuditResult {
  overallScore: number;
  tier: string;
  agenticStatus: {
    isProvided: boolean;
    summary: string;
    details: string;
  };
  platform: {
    weight: number;
    detected: string[];
    strategy: string;
    intent: string;
  };
  protocols: {
    weight: number;
    ucp: boolean;
    acp: boolean;
    strategy: string;
    intent: string;
  };
  seo: {
    weight: number;
    strategy: string;
    intent: string;
  };
  mismatches?: Array<{
    type: string;
    message: string;
    suggestion: string;
  }>;
  readinessSignals: Array<{
    label: string;
    status: boolean;
    rating: string;
    evidence: string;
    insight: string;
    suggestion: string;
    tags?: Tag[];
    tag?: Tag; // Keep for backward compatibility if needed, but we'll prefer tags
  }>;
  technologies: Array<{
    name: string;
    confidenceLevel: string;
    confidence: string;
    evidence: string[];
    matchesSelection?: boolean;
    tags?: Tag[];
    tag?: Tag;
  }>;
  payments: Array<{
    name: string;
    evidence: string;
    tags?: Tag[];
    tag?: Tag;
  }>;
  aiVectors: Array<{
    label: string;
    rating: string;
    evidence: string;
    insight: string;
    suggestion: string;
    tags?: Tag[];
    tag?: Tag;
  }>;
  nextSteps?: Array<{
    title: string;
    items: Array<{
      label: string;
      description: string;
      tags?: Tag[];
      tag?: Tag;
      priority?: 'high' | 'medium' | 'low';
    }>;
  }>;
  bots: Array<{
    label: string;
    status: boolean;
  }>;
}
