import React from 'react';
import { Definition } from '../components/Definition';
import { definitions } from '../constants/definitions';

/**
 * Utility to wrap technical terms in text with the Definition component.
 * This is a simple implementation that looks for exact matches.
 */
export const wrapDefinitions = (text: string) => {
  // Sort keys by length descending to match longer phrases first
  const keys = Object.keys(definitions).sort((a, b) => b.length - a.length);
  
  // This is a naive implementation. For a more robust one, we'd use a regex or a proper parser.
  // For the purpose of this task, we'll use a regex that matches terms as whole words.
  
  let parts: (string | React.ReactNode)[] = [text];
  
  keys.forEach(term => {
    const newParts: (string | React.ReactNode)[] = [];
    parts.forEach(part => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }
      
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use word boundaries if it's a simple term, otherwise just match the escaped term
      // Note: \b doesn't work well with terms ending in special characters like )
      const useBoundary = /^\w.*?\w$/.test(term);
      const regex = useBoundary 
        ? new RegExp(`\\b${escapedTerm}\\b`, 'gi')
        : new RegExp(`${escapedTerm}`, 'gi');
      
      let lastIndex = 0;
      let match;
      
      regex.lastIndex = 0;
      
      while ((match = regex.exec(part)) !== null) {
        const before = part.substring(lastIndex, match.index);
        if (before) newParts.push(before);
        
        newParts.push(<Definition key={`${term}-${match.index}`} term={term}>{match[0]}</Definition>);
        lastIndex = regex.lastIndex;
      }
      
      const remaining = part.substring(lastIndex);
      if (remaining) newParts.push(remaining);
    });
    parts = newParts;
  });
  
  return parts;
};
