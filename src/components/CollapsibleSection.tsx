import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const CollapsibleSection = ({ 
  title, 
  children, 
  defaultOpen = false, 
  className = "", 
  headerClassName = "" 
}: { 
  title: string, 
  children: React.ReactNode, 
  defaultOpen?: boolean,
  className?: string,
  headerClassName?: string
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`border border-line rounded-lg overflow-hidden mb-4 bg-white ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center p-4 bg-sand/10 hover:bg-sand/20 transition-colors text-left ${headerClassName}`}
      >
        <span className="font-bold text-syf-navy uppercase tracking-wider text-sm">{title}</span>
        <div className="print:hidden">
          {isOpen ? <ChevronDown size={18} className="text-syf-secondary" /> : <ChevronRight size={18} className="text-muted" />}
        </div>
      </button>
      <div className={`${isOpen ? 'block' : 'hidden'} print:!block p-4 border-t border-line bg-white animate-in fade-in slide-in-from-top-1 duration-200 collapsible-content`}>
        {children}
      </div>
    </div>
  );
};
