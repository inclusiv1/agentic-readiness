import React from 'react';
import { commercePlatforms, protocols } from '../constants';

export interface FormData {
  stage?: string;
  platforms?: string[];
  protocols?: string[];
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
                  const newPlatforms = platforms.includes(platform)
                    ? platforms.filter((p: string) => p !== platform)
                    : [...platforms, platform];
                  setFormData({...formData, platforms: newPlatforms});
                }}
                className={`partner ${formData.platforms?.includes(platform) ? 'selected' : ''}`}
              >
                {platform}
              </div>
            ))}
          </div>
        </div>
      )}

      {formStep === 3 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 3 of 5</div>
            <h2>Which protocols are you currently using?</h2>
            <div className="qhint">Select all that apply.</div>
          </div>
          <div className="partner-grid">
            {protocols.map((protocol) => (
              <div 
                key={protocol}
                onClick={() => {
                  const currentProtocols = formData.protocols || [];
                  const newProtocols = currentProtocols.includes(protocol)
                    ? currentProtocols.filter((p: string) => p !== protocol)
                    : [...currentProtocols, protocol];
                  setFormData({...formData, protocols: newProtocols});
                }}
                className={`partner ${formData.protocols?.includes(protocol) ? 'selected' : ''}`}
              >
                {protocol}
              </div>
            ))}
          </div>
        </div>
      )}

      {formStep === 4 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 4 of 5</div>
            <h2>Which AI channels are you most focused on?</h2>
            <div className="qhint">Select all that apply.</div>
          </div>
          <div className="options">
            {['Generative Discovery (Perplexity, ChatGPT)', 'Personal AI Shoppers', 'Agent-to-Agent Negotiation', 'Voice Assistants', 'Smart Home Commerce'].map((opt) => (
              <label 
                key={opt} 
                className={`opt ${formData.aiChannels?.includes(opt) ? 'selected' : ''}`}
              >
                <input 
                  type="checkbox" 
                  checked={formData.aiChannels?.includes(opt)}
                  onChange={() => {
                    const channels = formData.aiChannels || [];
                    const newChannels = channels.includes(opt)
                      ? channels.filter((c: string) => c !== opt)
                      : [...channels, opt];
                    setFormData({...formData, aiChannels: newChannels});
                  }}
                />
                <span className="opt-label">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {formStep === 5 && (
        <div className="space-y-4">
          <div>
            <div className="step-label">Step 5 of 5</div>
            <h2>What is your primary goal for agentic commerce?</h2>
            <div className="qhint">Select your main objective.</div>
          </div>
          <div className="options">
            {['Lower customer acquisition cost', 'Increase conversion rates', 'Future-proof against search changes', 'Enable autonomous shopping', 'Brand innovation leadership'].map((opt) => (
              <label 
                key={opt} 
                className={`opt ${formData.goal === opt ? 'selected' : ''}`}
              >
                <input 
                  type="radio" 
                  name="goal" 
                  checked={formData.goal === opt}
                  onChange={() => { setFormData({...formData, goal: opt}); }}
                />
                <span className="opt-label">{opt}</span>
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
          <button className="primary" onClick={nextFormStep}>Next</button>
        ) : (
          <button className="primary" onClick={goToAudit}>Final Step: Audit Site</button>
        )}
      </div>
    </div>
  );
};
