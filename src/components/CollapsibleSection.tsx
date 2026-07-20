import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-line rounded-lg overflow-hidden mb-4 bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-sand/10 hover:bg-sand/20 transition-colors text-left"
      >
        <span className="font-bold text-syf-navy uppercase tracking-wider text-sm">{title}</span>
        {isOpen ? <ChevronDown size={18} className="text-syf-secondary" /> : <ChevronRight size={18} className="text-muted" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-line bg-white animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
