import React from 'react';
import { Tooltip } from './Tooltip';
import { definitions } from '../constants/definitions';

interface DefinitionProps {
  term: string;
  children?: React.ReactNode;
}

export const Definition: React.FC<DefinitionProps> = ({ term, children }) => {
  const definition = definitions[term];
  
  if (!definition) {
    return <>{children || term}</>;
  }

  return (
    <Tooltip text={definition}>
      <span className="definition-term">
        {children || term}
      </span>
    </Tooltip>
  );
};
