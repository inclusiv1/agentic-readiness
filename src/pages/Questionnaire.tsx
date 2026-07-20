import React, { useState } from 'react';
import { commercePlatforms, protocols } from '../constants';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { wrapDefinitions } from '../components/Definition';

export interface FormData {
  stage?: string;
  platforms?: string[];
  otherPlatform?: string;
  protocols?: string[];
  otherProtocol?: string;
  aiChannels?: string[];
  goal?: string;
}

interface QuestionnaireProps {
  formStep: number;
  formData: FormData;
  setFormData: (data: FormData) => void;
  nextFormStep: () => void;
  prevFormStep: () => void;
  goToAudit: () => void;
}

export const ProgressBar = ({ current, total }: { current: number, total: number }) => (
  <div className="progress-wrap">
    {Array.from({ length: total }).map((_, i) => (
      <div 
        key={i}
        className={`progress-step ${i + 1 < current ? 'done' : i + 1 === current ? 'active' : ''}`}
      />
    ))}
  </div>
);

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  formStep,
  formData,
  setFormData,
  nextFormStep,
  prevFormStep,
  goToAudit
}) => {
  const [showTechInfo, setShowTechInfo] = useState<Record<number, boolean>>({});

  const toggleTechInfo = (step: number) => {
    setShowTechInfo(prev => ({ ...prev, [step]: !prev[step] }));
  };

  const canProceed = () => {
    if (formStep === 1) {
      return !!formData.stage;
    }
    if (formStep === 2) {
      if (!formData.platforms || formData.platforms.length === 0) return false;
      if (formData.platforms.includes('Other') && !formData.otherPlatform?.trim()) return false;
      return true;
    }
    if (formStep === 3) {
      if (!formData.protocols || formData.protocols.length === 0) return false;
      if (formData.protocols.includes('Other') && !formData.otherProtocol?.trim()) return false;
      return true;
    }
    if (formStep === 4) {
      return formData.aiChannels && formData.aiChannels.length > 0;
    }
    if (formStep === 5) {
      return !!formData.goal;
    }
    return true;
  };

  return (
    <div className="card">
      {formStep === 1 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 1 of 5</div>
            <h2>Where is your business in the journey?</h2>
            <div className="qhint">Select the option that best describes your current progress.</div>
          </div>
          <div className="options">
            {['Looking for guidance', 'Initial research', 'Pilot/POC phase', 'In development', 'Full tilt/Production'].map((opt) => (
              <label 
                key={opt} 
                className={`opt ${formData.stage === opt ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  name="stage" 
                  checked={formData.stage === opt}
                  onChange={() => { setFormData({...formData, stage: opt}); }}
                />
                <span className="opt-label">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {formStep === 2 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 2 of 5</div>
            <h2>Which commerce platform(s) do you use?</h2>
            <div className="qhint">Select all that apply.</div>
          </div>
          <div className="partner-grid">
            {commercePlatforms.map((platform) => (
              <div 
                key={platform}
                onClick={() => {
                  const platforms = formData.platforms || [];
                  let newPlatforms;
                  if (platforms.includes(platform)) {
                    newPlatforms = platforms.filter((p: string) => p !== platform);
                  } else {
                    newPlatforms = [...platforms, platform];
                  }
                  
                  const newFormData: FormData = {...formData, platforms: newPlatforms};
                  if (!newPlatforms.includes('Other')) {
                    delete newFormData.otherPlatform;
                  }
                  setFormData(newFormData);
                }}
                className={`partner ${formData.platforms?.includes(platform) ? 'selected' : ''}`}
              >
                {platform}
              </div>
            ))}
          </div>
          {formData.platforms?.includes('Other') && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Please specify other platform(s)..."
                className="w-full p-3 border rounded-lg"
                value={formData.otherPlatform || ''}
                onChange={(e) => setFormData({...formData, otherPlatform: e.target.value})}
              />
            </div>
          )}
        </div>
      )}

      {formStep === 3 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 3 of 5</div>
            <h2>Which communication standards are you currently using?</h2>
            <div className="qhint">Select all that apply. These help AI systems talk to your store.</div>
            <button 
              onClick={() => toggleTechInfo(3)}
              className="text-xs text-syf-navy flex items-center gap-1 hover:underline mb-2"
            >
              {showTechInfo[3] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showTechInfo[3] ? 'Hide technical details' : 'Show technical details'}
            </button>
            {showTechInfo[3] && (
              <div className="technical-info">
                <div className="font-semibold mb-2">Communication Standards:</div>
                <div className="space-y-1 text-xs">
                  <div>{wrapDefinitions('UCP: Universal commerce standard for product discovery.')}</div>
                  <div>{wrapDefinitions('ACP: Rules for AI agents to browse and buy products.')}</div>
                  <div>{wrapDefinitions('MCP: Helps AI models access your data safely.')}</div>
                  <div>{wrapDefinitions('AP2: Advanced protocol for autonomous shopping assistants.')}</div>
                  <div>{wrapDefinitions('MCP app: Tools that connect your data directly to AI.')}</div>
                </div>
              </div>
            )}
          </div>
          <div className="partner-grid">
            {protocols.map((protocol) => (
              <div 
                key={protocol}
                onClick={() => {
                  const currentProtocols = formData.protocols || [];
                  let newProtocols;
                  if (currentProtocols.includes(protocol)) {
                    newProtocols = currentProtocols.filter((p: string) => p !== protocol);
                  } else {
                    newProtocols = [...currentProtocols, protocol];
                  }
                  
                  const newFormData: FormData = {...formData, protocols: newProtocols};
                  if (!newProtocols.includes('Other')) {
                    delete newFormData.otherProtocol;
                  }
                  setFormData(newFormData);
                }}
                className={`partner ${formData.protocols?.includes(protocol) ? 'selected' : ''}`}
              >
                {protocol}
              </div>
            ))}
          </div>
          {formData.protocols?.includes('Other') && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Please specify other standard(s)..."
                className="w-full p-3 border rounded-lg"
                value={formData.otherProtocol || ''}
                onChange={(e) => setFormData({...formData, otherProtocol: e.target.value})}
              />
            </div>
          )}
        </div>
      )}

      {formStep === 4 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 4 of 5</div>
            <h2>How do you want customers to find you using AI?</h2>
            <div className="qhint">Select the ways you want to be discovered.</div>
          </div>
          <div className="options">
            {[
              { label: 'AI Search (like ChatGPT or Perplexity)', value: 'Generative Discovery (Perplexity, ChatGPT)' },
              { label: 'Automated Shopping Assistants', value: 'Personal AI Shoppers' },
              { label: 'Automatic Price & Deal Matching', value: 'Agent-to-Agent Negotiation' },
              { label: 'Voice Commands', value: 'Voice Assistants' },
              { label: 'Smart Home Integration', value: 'Smart Home Commerce' }
            ].map((opt) => (
              <label 
                key={opt.value} 
                className={`opt ${formData.aiChannels?.includes(opt.value) ? 'selected' : ''}`}
              >
                <input 
                  type="checkbox" 
                  checked={formData.aiChannels?.includes(opt.value)}
                  onChange={() => {
                    const channels = formData.aiChannels || [];
                    const newChannels = channels.includes(opt.value)
                      ? channels.filter((c: string) => c !== opt.value)
                      : [...channels, opt.value];
                    setFormData({...formData, aiChannels: newChannels});
                  }}
                />
                <span className="opt-label">{wrapDefinitions(opt.label)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {formStep === 5 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 5 of 5</div>
            <h2>What is your main goal for AI-driven shopping?</h2>
            <div className="qhint">Select your primary objective.</div>
          </div>
          <div className="options">
            {[
              { label: 'Reduce cost of finding new customers', value: 'Lower customer acquisition cost' },
              { label: 'Help more visitors complete a purchase', value: 'Increase conversion rates' },
              { label: 'Prepare for changes in search technology', value: 'Future-proof against search changes' },
              { label: 'Allow AI to shop on behalf of customers', value: 'Enable autonomous shopping' },
              { label: 'Lead the industry in new technology', value: 'Brand innovation leadership' }
            ].map((opt) => (
              <label 
                key={opt.value} 
                className={`opt ${formData.goal === opt.value ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  name="goal" 
                  checked={formData.goal === opt.value}
                  onChange={() => { setFormData({...formData, goal: opt.value}); }}
                />
                <span className="opt-label">{wrapDefinitions(opt.label)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="actions">
        {formStep > 1 ? (
          <button className="ghost" onClick={prevFormStep}>Back</button>
        ) : (
          <div />
        )}
        {formStep < 5 ? (
          <button 
            className={`primary ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={canProceed() ? nextFormStep : undefined}
            disabled={!canProceed()}
          >
            Next
          </button>
        ) : (
          <button 
            className={`primary ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={canProceed() ? goToAudit : undefined}
            disabled={!canProceed()}
          >
            Final Step: Audit Site
          </button>
        )}
      </div>
    </div>
  );
};
