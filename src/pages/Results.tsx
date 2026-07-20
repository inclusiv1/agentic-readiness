import React from 'react';
import { Mail, Printer, Info, CheckCircle, Search, Rocket, Layout, RefreshCcw, ArrowLeft, RotateCcw } from 'lucide-react';

import { Tooltip } from '../components/Tooltip';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { Tag, AuditResult } from '../types';

interface ResultsProps {
  auditResults: AuditResult;
  auditUrl: string;
  onUpdateUrl: () => void;
  onRestartSurveyNew: () => void;
  onRestartSurveySeed: () => void;
}

const TagPill = ({ tag }: { tag?: Tag }) => {
  if (!tag) return null;
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    warning: 'bg-syf-gold/20 text-syf-navy border-syf-gold/30',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  const categoryLabels: Record<string, string> = {
    journey: 'Journey',
    platform: 'Platform',
    protocol: 'Protocol',
    channel: 'AI Channel',
    goal: 'Goal'
  };

  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider inline-flex items-center gap-1 ${colors[tag.type]}`}>
      {tag.category && (
        <span className="opacity-50 border-r border-current pr-1 mr-0.5">
          {categoryLabels[tag.category] || tag.category}
        </span>
      )}
      {tag.text}
    </span>
  );
};

const TagList = ({ tags, tag }: { tags?: Tag[], tag?: Tag }) => {
  const allTags = [...(tags || []), ...(tag ? [tag] : [])];
  if (allTags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {allTags.map((t, i) => (
        <TagPill key={i} tag={t} />
      ))}
    </div>
  );
};

export const Results: React.FC<ResultsProps> = ({ 
  auditResults, 
  auditUrl, 
  onUpdateUrl, 
  onRestartSurveyNew, 
  onRestartSurveySeed 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <div className="flex gap-4">
          <button 
            onClick={onUpdateUrl}
            className="flex items-center gap-2 text-syf-navy font-bold text-sm hover:underline"
          >
            <ArrowLeft size={16} />
            Update URL
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onRestartSurveyNew}
              className="flex items-center gap-2 text-syf-navy font-bold text-sm hover:underline"
            >
              <RotateCcw size={16} />
              New Survey
            </button>
            <button 
              onClick={onRestartSurveySeed}
              className="flex items-center gap-2 text-syf-navy font-bold text-sm hover:underline"
            >
              <RefreshCcw size={16} />
              Restart (Keep Answers)
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const subject = `Agentic Readiness Report: ${auditUrl.replace('https://', '').replace('www.', '').split('/')[0]}`;
              const techStack = auditResults.technologies.map(t => t.name).join(', ') || 'None detected';
              const payments = auditResults.payments.map(p => p.name).join(', ') || 'None detected';
              const aiVectors = auditResults.aiVectors.map(v => v.label).join(', ') || 'None detected';
              
              const body = `
Agentic Readiness Report for ${auditUrl}
Overall Score: ${auditResults.overallScore}/100
Tier: ${auditResults.tier}

Tech Stack: ${techStack}
Payment Systems: ${payments}
AI Vectors: ${aiVectors}

View the full report at: ${window.location.href}
              `.trim();
              
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }} 
            className="ghost flex items-center gap-2"
          >
            <Mail size={18} />
            Email Results
          </button>
          <button 
            onClick={() => window.print()} 
            className="gold flex items-center gap-2"
          >
            <Printer size={18} />
            Print to PDF
          </button>
        </div>
      </div>
      
      <div className="score-hero">
        <div className="no-print">
          <Tooltip text="Overall Readiness Score: A weighted average of technical signals (40%), protocol support (40%), and SEO visibility (20%). For 100%, implement all protocols, achieve high platform confidence, and enable AI crawlers.">
            <div className="gauge">
              <svg className="w-full h-full">
                <circle cx="100" cy="100" r="88" className="bg" />
                <circle cx="100" cy="100" r="88" className="fg" style={{ strokeDasharray: 552.92, strokeDashoffset: 552.92 - (552.92 * auditResults.overallScore) / 100 }} />
              </svg>
              <div className="gauge-text">
                <span className="gauge-num">{auditResults.overallScore}</span>
                <span className="gauge-sub">Score</span>
              </div>
            </div>
          </Tooltip>
        </div>

        <div className="print-only">
          <div className="border-4 border-syf-navy rounded-full w-32 h-32 flex flex-col items-center justify-center mb-4">
            <span className="text-4xl font-bold">{auditResults.overallScore}</span>
            <span className="text-xs uppercase tracking-wider">Score</span>
          </div>
          <div className="mb-4 p-3 bg-blue-50 text-blue-900 text-sm rounded-md border border-blue-100">
            <strong>Overall Readiness Score:</strong> A weighted average of technical signals (40%), protocol support (40%), and SEO visibility (20%). For 100%, implement all protocols, achieve high platform confidence, and enable AI crawlers.
          </div>
        </div>
        
        <div>
          <div className="tier-badge">
            {auditResults.tier}
          </div>
          <h2 className="text-[24px] text-white font-bold mb-2">Readiness Report</h2>
          <p>
            Analysis for <span className="font-bold underline">{auditUrl.replace('https://', '').replace('www.', '').split('/')[0]}</span> reveals a solid foundation with key opportunities for agentic growth.
          </p>

          {auditResults.agenticStatus.isProvided && (
            <div className="mt-4 p-4 bg-syf-secondary/10 border-l-4 border-syf-secondary rounded-r-lg">
              <div className="flex items-center gap-2 text-syf-secondary font-bold text-sm uppercase tracking-wider mb-1">
                <Rocket size={16} /> Agentic Commerce Detected
              </div>
              <div className="text-white font-medium">{auditResults.agenticStatus.summary}</div>
              <div className="text-white/70 text-sm mt-1">{auditResults.agenticStatus.details}</div>
            </div>
          )}
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3 flex-1 border border-white/5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-syf-gold mb-1">Overall Strategy</div>
              <div className="text-xs text-white/90 italic">{auditResults.platform.strategy}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 flex-1 border border-white/5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-syf-gold mb-1">Business Intent</div>
              <div className="text-xs text-white/90">{auditResults.platform.intent}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dimension-grid">
        {[
          { 
            label: 'Platform', 
            val: auditResults.platform.weight, 
            desc: auditResults.platform.detected[0],
            strategy: auditResults.platform.strategy,
            intent: auditResults.platform.intent,
            tooltip: "Platform Scoring: Based on detection of commerce-specific markers and API signatures. 100% requires high confidence markers for an enterprise commerce engine."
          },
          { 
            label: 'Protocols', 
            val: auditResults.protocols.weight, 
            desc: auditResults.protocols.ucp && auditResults.protocols.acp ? 'Full Protocol Support' : 'Partial Support',
            strategy: auditResults.protocols.strategy,
            intent: auditResults.protocols.intent,
            tooltip: "Protocol Scoring: 50 points for UCP (Universal Commerce Protocol) and 50 points for ACP (Agentic Commerce Protocol). 100% requires both protocols to be active."
          },
          { 
            label: 'GEO/SEO', 
            val: auditResults.seo.weight, 
            desc: 'Optimized for Search',
            strategy: auditResults.seo.strategy,
            intent: auditResults.seo.intent,
            tooltip: "GEO/SEO Scoring: Based on robots.txt crawler permissions, LLM context files, and schema.org metadata. 100% requires explicit agent permissions and structured context."
          }
        ].map((dim) => (
          <div key={dim.label} className="dim-card">
            <div className="flex justify-between items-start">
              <h3>{dim.label}</h3>
              <div className="no-print">
                <Tooltip text={dim.tooltip}>
                  <Info size={14} className="text-muted hover:text-syf-navy transition-colors" />
                </Tooltip>
              </div>
            </div>
            <div className="print-only text-[10px] text-blue-900 bg-blue-50 p-2 rounded mb-2 border border-blue-100">
              {dim.tooltip}
            </div>
            <div className="dim-score">
              <span className="n">{dim.val}</span>
              <span className="d">/ 100</span>
            </div>
            <div className="dim-bar">
              <div className="dim-bar-fill bg-syf-secondary" style={{ width: `${dim.val}%` }} />
            </div>
            <p className="dim-summary">{dim.desc}</p>
            
            <div className="strategy-box">
              <div className="strategy-label">Strategy</div>
              <div className="strategy-text">{dim.strategy}</div>
            </div>
            <div className="intent-box">
              <div className="intent-label">Intent</div>
              <div className="intent-text">{dim.intent}</div>
            </div>
          </div>
        ))}
      </div>

      {auditResults.mismatches && auditResults.mismatches.length > 0 && (
        <div className="detail-section border-syf-autumn/30 bg-syf-autumn/5">
          <h3 className="text-syf-autumn flex items-center gap-2">
            <Search size={18} /> Verification Notes
          </h3>
          <div className="space-y-4 mt-4">
            {auditResults.mismatches.map((m, i) => (
              <div key={i} className="p-4 rounded-lg bg-white border border-syf-autumn/20">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-syf-autumn text-sm uppercase tracking-wide">{m.type}</div>
                </div>
                <div className="text-ink font-semibold mb-2">{m.message}</div>
                <div className="text-sm text-ink/70 flex gap-2 italic">
                  <span className="text-syf-secondary font-bold">Suggestion:</span>
                  {m.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="flex flex-col mb-3.5">
          <div className="flex justify-between items-center w-full">
            <h3 className="m-0">Technical Signal Matrix</h3>
            <div className="no-print">
              <Tooltip text="Signal Matrix: Aggregates individual readiness indicators. Each signal contributes to the overall score based on its rating (Critical/Elite: 10pts, High: 7pts, Standard: 5pts). 100% requires all signals to be 'Pass'.">
                <Info size={16} className="text-muted hover:text-syf-navy transition-colors" />
              </Tooltip>
            </div>
          </div>
          <div className="print-only mt-2 text-[10px] text-blue-900 bg-blue-50 p-2 rounded border border-blue-100">
            <strong>Technical Signal Matrix:</strong> Aggregates individual readiness indicators. Each signal contributes to the overall score based on its rating (Critical/Elite: 10pts, High: 7pts, Standard: 5pts). 100% requires all signals to be 'Pass'.
          </div>
        </div>
        <ul className="check-list">
          {auditResults.readinessSignals.map((signal, i) => (
            <li key={i}>
              <div className={`check-icon ${signal.status ? 'pass' : 'fail'}`}>
                {signal.status ? '✓' : '×'}
              </div>
              <div className="check-body">
                <div className="flex justify-between items-start">
                  <div className="check-title">{signal.label}</div>
                  <div className="flex items-center gap-2">
                    <TagList tags={signal.tags} tag={signal.tag} />
                    <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      signal.rating === 'Critical' || signal.rating === 'Elite' ? 'bg-syf-gold text-syf-navy' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {signal.rating}
                    </div>
                  </div>
                </div>
                <div className="check-detail font-semibold text-syf-navy/80">{signal.evidence}</div>
                <div className="mt-2 text-xs text-ink/70">{signal.insight}</div>
                <div className="mt-1 text-xs text-syf-secondary font-medium">Suggestion: {signal.suggestion}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-section mt-4">
        <div className="flex justify-between items-center mb-3.5">
          <h3 className="m-0">Commerce & Platform Probe</h3>
          <div className="no-print">
            <Tooltip text="Platform Probe: Analyzes technical fingerprints to identify the underlying commerce engine. Scoring is based on the confidence level of detection. High confidence enterprise platforms score 100%.">
              <Info size={16} className="text-muted hover:text-syf-navy transition-colors" />
            </Tooltip>
          </div>
        </div>
        <div className="print-only mb-4 p-3 bg-blue-50 text-blue-900 text-sm rounded-md border border-blue-100">
          <strong>Platform Probe:</strong> Analyzes technical fingerprints to identify the underlying commerce engine. Scoring is based on the confidence level of detection. High confidence enterprise platforms score 100%.
        </div>
        {auditResults.technologies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {auditResults.technologies.map((tech) => (
              <div key={tech.name} className="p-4 rounded-lg bg-sand/30 border border-ink/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-ink">{tech.name}</div>
                  <div className="flex items-center gap-2">
                    <TagList tags={tech.tags} tag={tech.tag} />
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      tech.confidenceLevel === 'High' ? 'bg-green-100 text-green-700' : 
                      tech.confidenceLevel === 'Medium' ? 'bg-syf-gold/20 text-syf-navy' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {tech.confidenceLevel} Confidence
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink/60 mb-3 italic">
                  Indicators found: {tech.confidence}
                </div>
                <ul className="text-[10px] space-y-1 opacity-80">
                  {tech.evidence.map((ev: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-syf-secondary" />
                      {ev}
                    </li>
                  ))}
                </ul>
                {tech.matchesSelection && (
                  <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-syf-secondary bg-syf-secondary/10 px-2 py-1 rounded">
                    <CheckCircle size={10} /> MATCHES SELECTION
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-60 mt-4 italic">No specific commerce platforms identified.</p>
        )}
      </div>

      <div className="detail-grid mt-4">
        <div className="detail-section">
          <h3>Payment Systems</h3>
          {auditResults.payments.length > 0 ? (
            <ul className="space-y-2 mt-4">
              {auditResults.payments.map((p) => (
                <li key={p.name} className="flex items-center justify-between text-sm text-ink/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-syf-secondary" />
                    <span className="font-bold">{p.name}</span>
                    <span className="text-xs opacity-60">({p.evidence})</span>
                  </div>
                  <TagList tags={p.tags} tag={p.tag} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-60 mt-4 italic">No major payment systems detected.</p>
          )}
        </div>

        <div className="detail-section">
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="m-0">Agentic AI Vectors</h3>
            <div className="no-print">
              <Tooltip text="AI Vectors: Identifies advanced AI integrations like semantic search and chatbots. Each vector adds to the 'Innovation' component of the score. 100% requires presence of all 6 vectors.">
                <Info size={16} className="text-muted hover:text-syf-navy transition-colors" />
              </Tooltip>
            </div>
          </div>
          <div className="print-only mb-4 p-3 bg-blue-50 text-blue-900 text-sm rounded-md border border-blue-100">
            <strong>AI Vectors:</strong> Identifies advanced AI integrations like semantic search and chatbots. Each vector adds to the 'Innovation' component of the score. 100% requires presence of all 6 vectors.
          </div>
          {auditResults.aiVectors.length > 0 ? (
            <div className="space-y-4 mt-4">
              {auditResults.aiVectors.map((v) => (
                <div key={v.label} className="p-3 rounded-lg border border-line bg-white">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                       <Rocket size={14} className="text-syf-gold" />
                       <span className="font-bold text-sm">{v.label}</span>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                       <div className="text-[9px] font-bold px-1.5 py-0.5 bg-syf-secondary/10 text-syf-secondary rounded uppercase">
                         {v.rating}
                       </div>
                       <TagList tags={v.tags} tag={v.tag} />
                     </div>
                  </div>
                  <div className="text-xs text-ink/60 mb-2">{v.evidence}</div>
                  <div className="text-xs text-ink/80 mb-2 italic">"{v.insight}"</div>
                  <div className="text-xs text-syf-navy font-medium">Strategy: {v.suggestion}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60 mt-4 italic">No specific AI vectors discovered.</p>
          )}
        </div>
      </div>

      <div className="detail-section">
        <h3>LLM & Agent Visibility</h3>
        <p className="qhint">Detection of agent-specific crawlers and LLM access points.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {auditResults.bots?.map((bot) => (
            <div key={bot.label} className={`p-3 rounded-lg border flex flex-col items-center text-center ${bot.status ? 'border-syf-secondary bg-syf-secondary/5' : 'border-line opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${bot.status ? 'bg-syf-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                {bot.status ? '✓' : '×'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider">{bot.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-section mt-4">
        <h3 className="mb-6 flex items-center gap-2">
          <Rocket size={20} className="text-syf-secondary" />
          Next Steps & Agentic Evolution
        </h3>
        
        {auditResults.nextSteps ? (
          auditResults.nextSteps.map((section: any, idx: number) => (
            <CollapsibleSection key={section.title} title={section.title} defaultOpen={idx === 0}>
              <div className="space-y-4">
                {section.items.map((item: any, i: number) => (
                  <div key={i} className={`p-3 rounded-r-lg border-l-4 ${
                    item.priority === 'high' ? 'bg-syf-gold/10 border-syf-gold' : 
                    item.priority === 'medium' ? 'bg-syf-secondary/10 border-syf-secondary' : 
                    'bg-ink/5 border-ink/20'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-syf-navy text-sm uppercase">{item.label}</div>
                      <TagList tags={item.tags} tag={item.tag} />
                    </div>
                    <p className="text-xs text-ink/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ))
        ) : (
          <>
            <CollapsibleSection title="1. Short-Term Implementation (0-3 Months)" defaultOpen={true}>
              <div className="space-y-4">
                <div className="p-3 bg-syf-gold/10 border-l-4 border-syf-gold rounded-r-lg">
                  <div className="font-bold text-syf-navy text-sm uppercase mb-1">Priority: Protocol Adoption</div>
                  <p className="text-xs text-ink/80">Implement <strong>UCP (Universal Commerce Protocol)</strong> and <strong>ACP (Agentic Commerce Protocol)</strong>. These machine-readable layers allow AI agents to navigate your product catalog without relying on fragile web scraping.</p>
                </div>
                <div className="p-3 bg-syf-secondary/10 border-l-4 border-syf-secondary rounded-r-lg">
                  <div className="font-bold text-syf-navy text-sm uppercase mb-1">AI Visibility Optimization</div>
                  <p className="text-xs text-ink/80">Update <code>robots.txt</code> to explicitly grant access to agentic crawlers (GPTBot, Claude-Bot, OAI-SearchBot) and host a <code>/ai-config.json</code> file at your root directory.</p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="2. Mid-Term Strategy: Agentic Vectors (3-9 Months)">
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded bg-ink/5 flex items-center justify-center shrink-0">
                    <Search size={16} className="text-syf-navy" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Semantic & Vector Search</div>
                    <p className="text-xs text-ink/70">Move beyond keyword matching. Implement vector databases (like Pinecone or Weaviate) to enable conceptual product discovery that aligns with how LLMs process intent.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded bg-ink/5 flex items-center justify-center shrink-0">
                    <Layout size={16} className="text-syf-navy" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Dynamic Contextual UI</div>
                    <p className="text-xs text-ink/70">Develop "Headless+" capabilities where your UI can be dynamically reconfigured by an agent to suit the specific user journey discovered during the conversation.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="3. Long-Term: Full Agentic Autonomy (9+ Months)">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-line p-3 rounded-lg">
                  <div className="text-syf-secondary font-bold text-xs uppercase mb-2">Autonomous Transactions</div>
                  <p className="text-[11px] text-ink/70">Implement "Agentic Wallets" and pre-authorized payment tokens (AP2) allowing agents to complete purchases on behalf of users within defined constraints.</p>
                </div>
                <div className="border border-line p-3 rounded-lg">
                  <div className="text-syf-secondary font-bold text-xs uppercase mb-2">Proactive Re-engagement</div>
                  <p className="text-[11px] text-ink/70">Deploy persistent agents that monitor user preferences and inventory signals to autonomously suggest and execute replenishment or upgrades.</p>
                </div>
              </div>
            </CollapsibleSection>
          </>
        )}

        <CollapsibleSection title="4. Agentic Commerce Landscape (Exhaustive List)">
          <div className="space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase text-muted mb-3 tracking-widest border-b pb-1">Foundational Protocols</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-xs"><span className="font-bold">UCP:</span> Standardization for product attribute discovery.</div>
                <div className="text-xs"><span className="font-bold">ACP:</span> Handshake protocol for agent-to-store negotiation.</div>
                <div className="text-xs"><span className="font-bold">MCP:</span> Model Context Protocol for LLM tool integration.</div>
                <div className="text-xs"><span className="font-bold">AP2:</span> Secure payment authorization for non-human entities.</div>
              </div>
            </div>
            
            <div>
              <h5 className="text-xs font-bold uppercase text-muted mb-3 tracking-widest border-b pb-1">Key Market Directions</h5>
              <ul className="list-disc pl-4 space-y-2 text-xs text-ink/80">
                <li><strong>Personal AI Shoppers:</strong> Consumer-side agents (e.g., Sierra, Daydream) that act as the primary interface, bypassing traditional search engines.</li>
                <li><strong>Agent-to-Agent Negotiation:</strong> Brand agents negotiating price, shipping, and bundles with consumer agents in real-time.</li>
                <li><strong>Zero-UI Commerce:</strong> Transactions occurring entirely within voice, chat, or ambient interfaces without a visual storefront.</li>
                <li><strong>Verifiable Identity:</strong> Using decentralized identifiers (DIDs) to verify that an agent has the legal and financial authority to act for a human.</li>
              </ul>
            </div>

            <div className="p-3 bg-sand/20 rounded-lg italic text-[11px] text-syf-navy">
              Note: The agentic landscape is shifting rapidly. We recommend a "Protocol-First" approach to ensure maximum compatibility with the widest range of emerging AI agents.
            </div>
          </div>
        </CollapsibleSection>

        <div className="gap-card mt-8">
          <div className="gap-priority">Strategic Summary</div>
          <h4>Evolution Roadmap</h4>
          <p className="qhint mb-0">
            Based on your current readiness, we suggest focusing on <strong>Protocol Alignment</strong> as your immediate next step. This provides the highest ROI by making your existing infrastructure "agent-readable" without a full platform re-architecture.
          </p>
        </div>
      </div>
    </div>
  );
};
