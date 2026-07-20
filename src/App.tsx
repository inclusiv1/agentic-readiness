import { useState, useEffect } from 'react';
import { Header } from './components/Layout';
import { Questionnaire, ProgressBar, FormData } from './pages/Questionnaire';
import { WebsiteAudit } from './pages/WebsiteAudit';
import { Results } from './pages/Results';
import { useWebsiteAudit } from './hooks/useWebsiteAudit';
import { wrapDefinitions } from './utils/wrapDefinitions';
import { Step } from './types';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('form');
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [auditUrl, setAuditUrl] = useState('');
  
  const { runAudit, isAuditing, auditError, auditResults, progress } = useWebsiteAudit();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [formStep, currentStep]);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const results = await runAudit(auditUrl, formData);
    if (results) {
      setCurrentStep('results');
    }
  };

  const restartSurvey = (seed: boolean) => {
    if (!seed) {
      setFormData({});
      setAuditUrl('');
    }
    setFormStep(1);
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-white text-ink font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="wrap">
          {currentStep === 'form' && (
            <div className="hero">
              <h1>{wrapDefinitions('Agentic Commerce Readiness')}</h1>
              <p className="text-ink-2">
                Determine how ready your business is for the future of AI-driven shopping and search.
              </p>
              <ProgressBar current={formStep} total={5} />
            </div>
          )}

          {currentStep === 'form' && (
            <Questionnaire 
              formStep={formStep}
              formData={formData}
              setFormData={setFormData}
              nextFormStep={() => setFormStep(prev => prev + 1)}
              prevFormStep={() => setFormStep(prev => prev - 1)}
              goToAudit={() => setCurrentStep('audit')}
            />
          )}

          {currentStep === 'audit' && (
            <WebsiteAudit 
              auditUrl={auditUrl}
              setAuditUrl={setAuditUrl}
              isAuditing={isAuditing}
              auditError={auditError}
              onRunAudit={handleRunAudit}
              onBypass={() => {
                runAudit('', formData).then((results) => {
                  if (results) setCurrentStep('results');
                });
              }}
              progress={progress}
            />
          )}

          {currentStep === 'results' && auditResults && (
            <Results 
              auditResults={auditResults} 
              auditUrl={auditUrl} 
              onUpdateUrl={() => setCurrentStep('audit')}
              onRestartSurveyNew={() => restartSurvey(false)}
              onRestartSurveySeed={() => restartSurvey(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
