import React from 'react';

interface WebsiteAuditProps {
  auditUrl: string;
  setAuditUrl: (url: string) => void;
  isAuditing: boolean;
  auditError: string | null;
  onRunAudit: (e: React.FormEvent) => void;
  progress: { step: string, percentage: number } | null;
}

export const WebsiteAudit: React.FC<WebsiteAuditProps> = ({
  auditUrl,
  setAuditUrl,
  isAuditing,
  auditError,
  onRunAudit,
  progress
}) => {
  return (
    <div className="card">
      <div className="space-y-4">
        <div>
          <div className="step-label">Website Assessment</div>
          <h2>Analyze your website for agentic readiness</h2>
          <div className="qhint">Enter your store's URL to scan for technical markers, protocols, and AI visibility.</div>
        </div>
        
        <form onSubmit={onRunAudit} className="space-y-4">
          <div className="url-row">
            <input 
              type="text" 
              required 
              placeholder="www.example.com" 
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
            />
            <button 
              disabled={isAuditing}
              className="primary min-w-[160px]"
            >
              {isAuditing ? 'Analyzing...' : 'Run Audit'}
            </button>
          </div>
          {auditError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {auditError}
            </div>
          )}
          <div className="privacy-note">
            Your URL will be scanned for publicly available technical markers. No private data is accessed.
          </div>
        </form>

        {isAuditing && (
          <div className="loading-state mt-8">
            <div className="spinner"></div>
            
            {/* Progress indicators for each step */}
            <div className="mt-4 space-y-4">
               <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-syf-navy mb-1">
                 <span>{progress?.step || 'Analyzing...'}</span>
                 <span>{progress?.percentage || 0}%</span>
               </div>
               <div className="w-full bg-line rounded-full h-2 overflow-hidden">
                 <div 
                   className="bg-syf-secondary h-full transition-all duration-500 ease-out"
                   style={{ width: `${progress?.percentage || 0}%` }}
                 />
               </div>
               
               <div className="loading-checks mt-6 grid grid-cols-1 gap-2">
                 <div className={`flex items-center gap-2 text-sm ${progress && progress.percentage >= 10 ? 'text-syf-navy font-bold' : 'text-muted'}`}>
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${progress && progress.percentage >= 10 ? 'bg-syf-secondary text-white border-syf-secondary' : 'border-line'}`}>
                     {progress && progress.percentage >= 10 ? '✓' : '1'}
                   </span>
                   Crawling deep links...
                 </div>
                 <div className={`flex items-center gap-2 text-sm ${progress && progress.percentage >= 30 ? 'text-syf-navy font-bold' : 'text-muted'}`}>
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${progress && progress.percentage >= 30 ? 'bg-syf-secondary text-white border-syf-secondary' : 'border-line'}`}>
                     {progress && progress.percentage >= 30 ? '✓' : '2'}
                   </span>
                   Analyzing payment gateways...
                 </div>
                 <div className={`flex items-center gap-2 text-sm ${progress && progress.percentage >= 50 ? 'text-syf-navy font-bold' : 'text-muted'}`}>
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${progress && progress.percentage >= 50 ? 'bg-syf-secondary text-white border-syf-secondary' : 'border-line'}`}>
                     {progress && progress.percentage >= 50 ? '✓' : '3'}
                   </span>
                   Verifying commerce platform...
                 </div>
                 <div className={`flex items-center gap-2 text-sm ${progress && progress.percentage >= 70 ? 'text-syf-navy font-bold' : 'text-muted'}`}>
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${progress && progress.percentage >= 70 ? 'bg-syf-secondary text-white border-syf-secondary' : 'border-line'}`}>
                     {progress && progress.percentage >= 70 ? '✓' : '4'}
                   </span>
                   Checking robots.txt & protocols...
                 </div>
                 <div className={`flex items-center gap-2 text-sm ${progress && progress.percentage >= 90 ? 'text-syf-navy font-bold' : 'text-muted'}`}>
                   <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${progress && progress.percentage >= 90 ? 'bg-syf-secondary text-white border-syf-secondary' : 'border-line'}`}>
                     {progress && progress.percentage >= 90 ? '✓' : '5'}
                   </span>
                   Mapping AI agent vectors...
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
