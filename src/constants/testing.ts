import { TestCase, TestGroup } from '../types/testing';

export const defaultTestCases: TestCase[] = [
  {
    id: '1',
    websiteUrl: 'https://www.shopify.com',
    formData: {
      stage: 'Initial research',
      platforms: ['Shopify'],
      protocols: ['Other'],
      aiChannels: ['Generative Discovery (Perplexity, ChatGPT)'],
      goal: 'Future-proof against search changes'
    },
    expectedSuggestions: [
      'Implement UCP 1.0 at /.well-known/ucp',
      'Enable ACP 1.1 protocol.',
      'Create a /llms.txt file.',
      'Explicitly allow GPTBot and Claude-Bot.',
      'Protocol Adoption',
      'AI Crawler Access'
    ]
  },
  {
    id: '2',
    websiteUrl: 'https://www.nike.com',
    formData: {
      stage: 'Pilot/POC phase',
      platforms: ['Custom'],
      protocols: ['UCP', 'ACP'],
      aiChannels: ['Personal AI Shoppers'],
      goal: 'Increase conversion rates'
    },
    expectedSuggestions: [
      'Maintain version parity.',
      'Ready for agentic transactions.',
      'Upgrade to a vector-based search engine.',
      'Protocol Maintenance',
      'Semantic & Vector Search'
    ]
  },
  {
    id: '3',
    websiteUrl: 'https://www.openai.com',
    formData: {
      stage: 'Full tilt/Production',
      platforms: ['Custom'],
      protocols: ['MCP'],
      aiChannels: ['Personal AI Shoppers'],
      goal: 'Enable autonomous shopping'
    },
    expectedSuggestions: [
      'MCP Expansion',
      'Autonomous Transactions (AP2)',
      'Agentic Wallets'
    ]
  },
  {
    id: '4',
    websiteUrl: 'https://www.anthropic.com',
    formData: {
      stage: 'In development',
      platforms: ['Other'],
      protocols: [],
      aiChannels: [],
      goal: 'Brand innovation leadership'
    },
    expectedSuggestions: [
      'MCP Integration'
    ]
  }
];

export const defaultTestGroups: TestGroup[] = [
  {
    id: 'default-group',
    name: 'Default Reports',
    testCases: defaultTestCases
  }
];

export const allPossibleSuggestions = [
  'Implement UCP 1.0 at /.well-known/ucp',
  'Maintain version parity.',
  'Enable ACP 1.1 protocol.',
  'Ready for agentic transactions.',
  'Explicitly allow GPTBot and Claude-Bot.',
  'Create a /llms.txt file.',
  'Upgrade to a vector-based search engine.',
  'Protocol Adoption',
  'Protocol Maintenance',
  'AI Crawler Access',
  'Semantic & Vector Search',
  'MCP Integration',
  'MCP Expansion',
  'Autonomous Transactions (AP2)',
  'Agentic Wallets'
];

export const journeyStages = [
  'Looking for guidance',
  'Initial research',
  'Pilot/POC phase',
  'In development',
  'Full tilt/Production'
];

export const aiChannels = [
  'Generative Discovery (Perplexity, ChatGPT)',
  'Personal AI Shoppers',
  'Agent-to-Agent Negotiation',
  'Voice Assistants',
  'Smart Home Commerce'
];

export const goals = [
  'Lower customer acquisition cost',
  'Increase conversion rates',
  'Future-proof against search changes',
  'Enable autonomous shopping',
  'Brand innovation leadership'
];
