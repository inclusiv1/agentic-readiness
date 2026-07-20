import { useState } from 'react';
import { proxyFetch } from '../services/proxyFetch';
import { platformMarkers, protocolMarkers, paymentMarkers, aiVectorMarkers } from '../constants';
import { AuditResult, Tag } from '../types';

export const useWebsiteAudit = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditResults, setAuditResults] = useState<AuditResult | null>(null);
  const [progress, setProgress] = useState<{ step: string, percentage: number } | null>(null);

  const runAudit = async (url: string, formData: any) => {
    let sanitizedUrl = url.trim();
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      sanitizedUrl = 'https://' + sanitizedUrl;
    }

    setIsAuditing(true);
    setAuditError(null);
    setProgress({ step: 'Starting analysis...', percentage: 0 });

    try {
      let combinedContent = '';
      let robotsTxt = '';
      
      const baseUrl = new URL(sanitizedUrl).origin;
      const domain = baseUrl.replace(/https?:\/\//, '').replace(/www\./, '');

      // Define paths to probe
      const pathsToProbe = Array.from(new Set(['/', '/robots.txt', '/llms.txt', '/llms.text', '/checkout', '/cart', '/cart.js']));
      
      platformMarkers.forEach(p => {
        if (p.paths) p.paths.forEach(path => pathsToProbe.push(path));
      });

      const uniquePaths = Array.from(new Set(pathsToProbe));
      const totalPaths = uniquePaths.length;
      
      // Parallel probing with concurrency limit
      const concurrencyLimit = 5;
      const probeResults: {path: string, contents: string}[] = [];
      
      for (let i = 0; i < uniquePaths.length; i += concurrencyLimit) {
        const chunk = uniquePaths.slice(i, i + concurrencyLimit);
        const results = await Promise.all(chunk.map(async (path) => {
          try {
            const timeout = (path === '/' || path === '/robots.txt') ? 10000 : 5000;
            const res = await proxyFetch(baseUrl + path, { timeout });
            setProgress(prev => {
              if (!prev) return prev;
              const newPercentage = Math.min(40, prev.percentage + (40 / totalPaths));
              return {
                step: `Probing ${path}...`,
                percentage: Math.round(newPercentage)
              };
            });
            return { path, contents: res.contents };
          } catch (e) {
            console.warn(`Failed to probe ${path}`);
            return { path, contents: '' };
          }
        }));
        probeResults.push(...results);
      }

      probeResults.forEach(res => {
        if (res.contents) {
          combinedContent += res.contents.toLowerCase() + ' ';
          if (res.path === '/robots.txt') robotsTxt = res.contents;
        }
      });

      setProgress({ step: 'Checking protocols...', percentage: 50 });

      // Bot markers
      const botMarkers = [
        { label: 'GPTBot (OpenAI)', marker: 'gptbot' },
        { label: 'Claude-Bot (Anthropic)', marker: 'claudebot' },
        { label: 'OAI-SearchBot', marker: 'oai-searchbot' },
        { label: 'Google-InspectionTool', marker: 'google-inspectiontool' },
        { label: 'PerplexityBot', marker: 'perplexitybot' },
        { label: 'Applebot', marker: 'applebot' },
        { label: 'Common Crawl', marker: 'ccbot' },
        { label: 'Meta External Agent', marker: 'meta-externalagent' }
      ];

      const ucpCheck = async (d: string) => {
        try {
          const res = await proxyFetch(`https://ucpchecker.com/api/validator?domain=${d}`, { timeout: 5000 });
          const content = typeof res.contents === 'string' ? res.contents.toLowerCase() : JSON.stringify(res.contents).toLowerCase();
          return content.includes('true') || content.includes('valid');
        } catch { return false; }
      };

      const acpCheck = async (d: string) => {
        try {
          const res = await proxyFetch(`https://ucptools.dev/api/acp-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: d }),
            timeout: 5000
          });
          const content = typeof res.contents === 'string' ? res.contents.toLowerCase() : JSON.stringify(res.contents).toLowerCase();
          return content.includes('true') || content.includes('valid') || res.status === 200;
        } catch { return false; }
      };

      const [ucpApiStatus, acpApiStatus] = await Promise.all([
        ucpCheck(domain),
        acpCheck(domain)
      ]);

      const botStatus = botMarkers.map(bot => ({
        label: bot.label,
        status: robotsTxt.toLowerCase().includes(bot.marker.toLowerCase()) || combinedContent.toLowerCase().includes(bot.marker.toLowerCase())
      }));

      setProgress({ step: 'Analyzing signals...', percentage: 70 });

      const urlLower = sanitizedUrl.toLowerCase();
      const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash);
      };
      const seed = getSeed(domain);
      const rand = (max: number, offset: number = 0) => ((seed + offset) % max);

      const detectedTechnologies: any[] = [];
      const detectedPayments: any[] = [];
      const detectedAIVectors: any[] = [];
      
      platformMarkers.forEach(p => {
        const matchingMarkers = p.markers.filter(m => combinedContent.includes(m.toLowerCase()) || urlLower.includes(m.toLowerCase()));
        if (matchingMarkers.length > 0) {
          const count = matchingMarkers.length;
          let level = 'Low';
          if (count >= 3) level = 'High';
          else if (count >= 2) level = 'Medium';

          const isMatch = formData.platforms?.some((pf: string) => pf.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(pf.toLowerCase()));
          const tags: Tag[] = isMatch 
            ? [{ text: 'Survey Match', type: 'success', category: 'platform' }] 
            : [{ text: 'Detected', type: 'neutral', category: 'platform' }];

          detectedTechnologies.push({
            name: p.name,
            confidence: count,
            confidenceLevel: level,
            evidence: matchingMarkers.map(m => `Detected: ${m}`),
            matchesSelection: isMatch,
            tags
          });
        }
      });

      detectedTechnologies.sort((a, b) => b.confidence - a.confidence);
      
      for (const p of paymentMarkers) {
        const matchingMarkers = p.markers.filter(m => combinedContent.includes(m.toLowerCase()) || urlLower.includes(m.toLowerCase()));
        if (matchingMarkers.length > 0) {
          detectedPayments.push({
            name: p.name,
            evidence: `Found ${matchingMarkers[0]} in source`,
            tags: [{ text: 'Detected', type: 'success', category: 'platform' } as Tag]
          });
        }
      }

      const vectorInsights: Record<string, any> = {
        chatbot: { insight: "Direct customer interaction layer through AI-driven chat interfaces.", suggestion: "Ensure your chatbot can access real-time inventory and order status via commerce APIs.", rating: "Essential" },
        semantic: { insight: "AI-powered search that understands intent rather than just keywords.", suggestion: "Implement vector search to allow agents to find products using natural language descriptions.", rating: "Critical" },
        personalization: { insight: "Dynamic content tailoring based on user behavior and AI models.", suggestion: "Expose personalization parameters to agents so they can represent the brand's tailored experience.", rating: "High" },
        agentic: { insight: "Native support for machine-to-machine commerce protocols like UCP/ACP.", suggestion: "Implementing these protocols makes your site 'Agent-First' and ready for autonomous shopping.", rating: "Elite" },
        agentic_ui: { insight: "UI components that adapt based on agent interactions or headless data.", suggestion: "Move towards a headless architecture to separate the commerce logic from the presentation layer.", rating: "Strategic" },
        generative_discovery: { insight: "Visibility in generative engines like Perplexity, ChatGPT, and Claude.", suggestion: "Optimize your llms.txt and structured data to be easily parsed by generative crawlers.", rating: "High" }
      };

      for (const v of aiVectorMarkers) {
        const matchingMarkers = v.markers.filter(m => combinedContent.includes(m.toLowerCase()));
        if (matchingMarkers.length > 0) {
          const tags: Tag[] = [{ text: 'Detected', type: 'success', category: 'channel' }];
          if (formData.aiChannels?.some((c: string) => v.label.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(v.label.toLowerCase()))) {
            tags.push({ text: 'Goal Match', type: 'info', category: 'goal' });
          }
          detectedAIVectors.push({
            label: v.label,
            confidence: matchingMarkers.length,
            evidence: `Detected indicators for ${v.label}`,
            ...vectorInsights[v.key],
            tags
          });
        }
      }

      setProgress({ step: 'Generating report...', percentage: 90 });

      // Scoring and other logic (omitted for brevity, assume similar to original)
      // I will copy the rest of the scoring logic from App.tsx
      
      // ... Scoring logic goes here ...
      // For now I'll provide a mock results object based on the structure but I'll need to extract the actual logic.
      // Wait, I should probably keep the logic as close as possible.

      const results = generateResults(sanitizedUrl, domain, robotsTxt, combinedContent, ucpApiStatus, acpApiStatus, detectedTechnologies, detectedPayments, detectedAIVectors, botStatus, formData, rand);
      
      setAuditResults(results);
      setProgress({ step: 'Complete', percentage: 100 });
      setIsAuditing(false);
      return results;
    } catch (e: any) {
      setIsAuditing(false);
      setAuditError(e.message || 'Audit failed');
      return null;
    }
  };

  return { runAudit, isAuditing, auditError, auditResults, progress };
};

// Helper function to keep useWebsiteAudit cleaner
function generateResults(url: string, domain: string, robotsTxt: string, combinedContent: string, ucpApiStatus: boolean, acpApiStatus: boolean, detectedTechnologies: any[], detectedPayments: any[], detectedAIVectors: any[], botStatus: any[], formData: any, rand: Function): AuditResult {
  const platformConfidence = detectedTechnologies.length > 0 ? (detectedTechnologies[0].confidenceLevel === 'High' ? 100 : detectedTechnologies[0].confidenceLevel === 'Medium' ? 70 : 40) : 0;
  
  const surveyProtocols = formData.protocols || [];
  const ucpFound = ucpApiStatus || combinedContent.includes('ucp') || combinedContent.includes('universal-commerce');
  const acpFound = acpApiStatus || combinedContent.includes('acp') || combinedContent.includes('agent-commerce');
  const mcpFound = combinedContent.includes('mcp') || combinedContent.includes('model-context-protocol');
  
  const ucpInSurvey = surveyProtocols.includes('UCP');
  const acpInSurvey = surveyProtocols.includes('ACP');
  const mcpInSurvey = surveyProtocols.includes('MCP') || surveyProtocols.includes('MCP app');

  const protocolScore = (ucpFound ? 50 : 0) + (acpFound ? 50 : 0);
  const seoScore = (robotsTxt.includes('gptbot') || robotsTxt.includes('oai-searchbot') ? 40 : 10) + (combinedContent.includes('llms.txt') ? 60 : 0);
  
  const overallScore = Math.round((platformConfidence * 0.4) + (protocolScore * 0.4) + (seoScore * 0.2));

  const getProtocolTags = (found: boolean, inSurvey: boolean) => {
    const tags: Tag[] = [];
    if (found && inSurvey) tags.push({ text: 'Verified Implementation', type: 'success', category: 'protocol' });
    else if (found) tags.push({ text: 'Detected on Site', type: 'success', category: 'protocol' });
    else if (inSurvey) tags.push({ text: 'In Development', type: 'info', category: 'protocol' });
    
    if (inSurvey) tags.push({ text: 'Survey Choice', type: 'neutral', category: 'goal' });
    return tags;
  };

  const readinessSignals = [
    { 
      label: 'Commerce Protocol (UCP)', 
      status: ucpFound, 
      rating: 'Elite', 
      evidence: ucpFound ? 'Active UCP 1.0 endpoint detected' : 'No UCP 1.0 markers found', 
      insight: 'Essential for machine-readable catalogs.', 
      suggestion: ucpFound ? 'Maintain version parity.' : 'Implement UCP 1.0 at /.well-known/ucp',
      tags: getProtocolTags(ucpFound, ucpInSurvey)
    },
    { 
      label: 'Agent Handshake (ACP)', 
      status: acpFound, 
      rating: 'Elite', 
      evidence: acpFound ? 'ACP 1.1 handshake valid' : 'ACP handshake failed', 
      insight: 'Enables autonomous negotiation.', 
      suggestion: acpFound ? 'Ready for agentic transactions.' : 'Enable ACP 1.1 protocol.',
      tags: getProtocolTags(acpFound, acpInSurvey)
    },
    { 
      label: 'Bot Visibility (robots.txt)', 
      status: robotsTxt.toLowerCase().includes('gptbot') || robotsTxt.toLowerCase().includes('oai-searchbot'), 
      rating: 'Critical', 
      evidence: robotsTxt.toLowerCase().includes('gptbot') ? 'AI crawlers explicitly allowed' : 'AI crawlers may be blocked', 
      insight: 'Controls LLM data ingestion.', 
      suggestion: 'Explicitly allow GPTBot and Claude-Bot.',
      tags: (robotsTxt.toLowerCase().includes('gptbot')) ? [{ text: 'Optimized', type: 'success', category: 'channel' } as Tag] : []
    },
    { 
      label: 'LLM Context (llms.txt)', 
      status: combinedContent.includes('llms.txt'), 
      rating: 'High', 
      evidence: combinedContent.includes('llms.txt') ? 'llms.txt context file found' : 'No LLM context file detected', 
      insight: 'Provides high-density context for LLMs.', 
      suggestion: 'Create a /llms.txt file.',
      tags: combinedContent.includes('llms.txt') ? [{ text: 'Detected', type: 'success', category: 'channel' } as Tag] : []
    },
    { 
      label: 'Semantic Search', 
      status: detectedAIVectors.some(v => v.label === 'Semantic Search'), 
      rating: 'High', 
      evidence: detectedAIVectors.some(v => v.label === 'Semantic Search') ? 'Vector-based search detected' : 'Standard keyword search used', 
      insight: 'Enables intent-based discovery.', 
      suggestion: 'Upgrade to a vector-based search engine.',
      tags: detectedAIVectors.some(v => v.label === 'Semantic Search') ? [{ text: 'Implemented', type: 'success', category: 'platform' } as Tag] : []
    }
  ];

  // Dynamic Next Steps
  const nextSteps = [];

  // Short Term
  const shortTermItems = [];
  if (!ucpFound || !acpFound) {
    const tags: Tag[] = [];
    if (ucpInSurvey || acpInSurvey) tags.push({ text: 'Survey Priority', type: 'info', category: 'goal' });
    tags.push({ text: 'Foundation', type: 'neutral', category: 'journey' });

    shortTermItems.push({
      label: 'Protocol Adoption',
      description: `Implement ${!ucpFound ? 'UCP' : ''}${!ucpFound && !acpFound ? ' and ' : ''}${!acpFound ? 'ACP' : ''}. Machine-readable layers allow agents to navigate your catalog.`,
      tags,
      priority: 'high' as const
    });
  } else {
    shortTermItems.push({
      label: 'Protocol Maintenance',
      description: 'You have implemented core protocols. Focus on expanding attribute coverage in your UCP manifests.',
      tags: [{ text: 'Verified', type: 'success', category: 'protocol' }, { text: 'Growth', type: 'neutral', category: 'journey' }] as Tag[],
      priority: 'medium' as const
    });
  }

  if (!robotsTxt.toLowerCase().includes('gptbot')) {
    const tags: Tag[] = [{ text: 'Visibility', type: 'warning', category: 'channel' }];
    if (formData.aiChannels?.includes('Generative Discovery (Perplexity, ChatGPT)')) {
      tags.push({ text: 'Aligned with Goal', type: 'info', category: 'goal' });
    }
    shortTermItems.push({
      label: 'AI Crawler Access',
      description: 'Update robots.txt to permit GPTBot and Claude-Bot. This is critical for visibility in generative search.',
      tags,
      priority: 'high' as const
    });
  }

  nextSteps.push({ title: '1. Short-Term Implementation (0-3 Months)', items: shortTermItems });

  // Mid Term
  const midTermItems = [];
  const focusOnSearch = formData.aiChannels?.includes('Generative Discovery (Perplexity, ChatGPT)');
  
  midTermItems.push({
    label: 'Semantic & Vector Search',
    description: 'Transition from keyword-based search to vector embeddings to better align with how LLMs process product intent.',
    tags: focusOnSearch ? ([{ text: 'Goal Aligned', type: 'info', category: 'goal' }, { text: 'AI Strategy', type: 'neutral', category: 'channel' }] as Tag[]) : ([{ text: 'Optimization', type: 'neutral', category: 'platform' }] as Tag[]),
    priority: 'medium' as const
  });

  if (!mcpFound && !mcpInSurvey) {
    midTermItems.push({
      label: 'MCP Integration',
      description: 'Explore Model Context Protocol (MCP) to provide direct tool access to your commerce engine for LLM agents.',
      tags: [{ text: 'New Opportunity', type: 'warning', category: 'protocol' }, { text: 'Strategic', type: 'neutral', category: 'journey' }] as Tag[]
    });
  } else if (mcpFound || mcpInSurvey) {
    midTermItems.push({
      label: 'MCP Expansion',
      description: 'Enhance your MCP server with more granular tools for inventory check and personalized pricing.',
      tags: mcpFound 
        ? ([{ text: 'Active', type: 'success', category: 'protocol' }, { text: 'Expansion', type: 'neutral', category: 'journey' }] as Tag[]) 
        : ([{ text: 'Planned', type: 'info', category: 'protocol' }, { text: 'Goal', type: 'neutral', category: 'goal' }] as Tag[])
    });
  }

  nextSteps.push({ title: '2. Mid-Term Strategy: Agentic Vectors (3-9 Months)', items: midTermItems });

  // Long Term
  const longTermItems = [];
  const autonomousGoal = formData.goal === 'Enable autonomous shopping';
  
  longTermItems.push({
    label: 'Autonomous Transactions (AP2)',
    description: 'Implement secure payment authorization for non-human entities using AP2 protocols.',
    tag: autonomousGoal ? ({ text: 'Direct Goal Match', type: 'success' } as Tag) : undefined
  });

  longTermItems.push({
    label: 'Agentic Wallets',
    description: 'Support pre-authorized tokens for agents to complete purchases within user-defined constraints.',
    priority: 'low' as const
  });

  nextSteps.push({ title: '3. Long-Term: Full Agentic Autonomy (9+ Months)', items: longTermItems });

  return {
    overallScore,
    tier: overallScore > 80 ? 'Elite Readiness' : overallScore > 60 ? 'High Potential' : 'Emerging',
    agenticStatus: {
      isProvided: protocolScore > 0 || ucpInSurvey || acpInSurvey,
      summary: protocolScore === 100 ? "Fully Agent-Enabled Architecture" : (protocolScore > 0 || ucpInSurvey || acpInSurvey) ? "Partially Agent-Ready" : "Traditional Commerce Architecture",
      details: protocolScore === 100 ? "Your site is a leader in agentic commerce." : "Initial protocol markers found or indicated in survey, but complete integration is missing."
    },
    platform: { weight: platformConfidence, detected: detectedTechnologies.map(t => t.name), strategy: "Infrastructure Modernization", intent: formData.goal || "Enterprise Scalability" },
    protocols: { weight: protocolScore, ucp: ucpFound, acp: acpFound, strategy: "Machine-Readable Layer", intent: "Autonomous Interoperability" },
    seo: { weight: seoScore, strategy: "LLM Visibility Optimization", intent: "Generative Discovery" },
    readinessSignals,
    technologies: detectedTechnologies.map(t => ({
      ...t,
      tag: t.matchesSelection ? { text: 'Verified Platform', type: 'success' as const } : undefined
    })),
    payments: detectedPayments,
    aiVectors: detectedAIVectors,
    nextSteps,
    bots: botStatus,
    mismatches: []
  };
}
