import React from 'react';

import { Bot } from 'lucide-react';

export const Header = () => (
  <header className="syf-header no-print">
    <div className="max-w-[1140px] mx-auto w-full flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Bot className="text-syf-navy h-8 w-8" />
        <div className="text-syf-navy font-bold tracking-tight uppercase text-lg">Agentic Assessments</div>
      </div>
      <div className="flex items-center gap-6">
        <a href="#testing-matrix" className="text-xs font-bold uppercase tracking-wider text-syf-navy hover:underline">Testing Matrix</a>
        <button className="bg-syf-navy text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-syf-navy/90 transition-colors">Log In</button>
      </div>
    </div>
  </header>
);

export const Footer = () => null;
