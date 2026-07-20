import React from 'react';

export const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="tooltip">
    {children}
    <div className="tooltip-text">{text}</div>
  </div>
);
