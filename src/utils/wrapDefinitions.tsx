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
      
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      const split = part.split(regex);
      
      if (split.length === 1) {
        newParts.push(part);
      } else {
        for (let i = 0; i < split.length; i++) {
          if (i % 2 === 1) {
            // Find the actual key in definitions to preserve case if needed or use the matched text
            // Here we use the matched text split[i] but look up by term (case-insensitive)
            newParts.push(<Definition key={`${term}-${i}`} term={term}>{split[i]}</Definition>);
          } else if (split[i] !== '') {
            newParts.push(split[i]);
          }
        }
      }
    });
    parts = newParts;
  });
  
  return parts;
};
