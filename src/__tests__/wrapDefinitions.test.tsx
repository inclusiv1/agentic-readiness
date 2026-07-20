import { describe, it, expect } from 'vitest';
import { wrapDefinitions } from '../utils/wrapDefinitions';
import React from 'react';

describe('wrapDefinitions', () => {
  it('should wrap a known term with a Definition component', () => {
    const text = 'We use MCP in our project.';
    const result = wrapDefinitions(text);
    
    // Result should be an array: ["We use ", DefinitionComponent, " in our project."]
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('We use ');
    expect(typeof result[1]).toBe('object'); // React component
    expect((result[1] as React.ReactElement).props.term).toBe('MCP');
    expect((result[1] as React.ReactElement).props.children).toBe('MCP');
    expect(result[2]).toBe(' in our project.');
  });

  it('should be case-insensitive when matching terms but preserve original case in display', () => {
    const text = 'we use mcp here.';
    const result = wrapDefinitions(text);
    
    expect(result).toHaveLength(3);
    expect((result[1] as React.ReactElement).props.term).toBe('MCP'); // The key in definitions
    expect((result[1] as React.ReactElement).props.children).toBe('mcp'); // The original text
  });

  it('should match longer phrases first', () => {
    // "MCP app" and "MCP" are both in definitions. "MCP app" is longer.
    const text = 'Check out this MCP app.';
    const result = wrapDefinitions(text);
    
    // Should match "MCP app" as one unit, not "MCP" followed by " app"
    const definitionPart = result.find(part => typeof part === 'object') as React.ReactElement;
    expect(definitionPart.props.term).toBe('MCP app');
    expect(definitionPart.props.children).toBe('MCP app');
  });

  it('should only match whole words', () => {
    // 'API' is in definitions.
    const textWithSubword = 'This is an API call.';
    const resultWithMatch = wrapDefinitions(textWithSubword);
    expect(resultWithMatch.some(part => typeof part === 'object')).toBe(true);
    
    // 'UCP' is in definitions.
    // 'BUCPS' contains 'UCP' but it's NOT a whole word.
    const textWithUCPInWord = 'The word BUCPS contains UCP.';
    const resultWithUCP = wrapDefinitions(textWithUCPInWord);
    
    // It should match the standalone 'UCP' at the end, but NOT the one in 'BUCPS'
    const definitionsFound = resultWithUCP.filter(part => typeof part === 'object');
    expect(definitionsFound.length).toBe(1);
    
    // Verify it didn't split 'BUCPS'
    expect(resultWithUCP).toContain('The word BUCPS contains ');
  });

  it('should handle multiple terms in the same string', () => {
    const text = 'MCP and UCP are protocols.';
    const result = wrapDefinitions(text);
    
    // ["", MCP_Def, " and ", UCP_Def, " are protocols."] or similar
    // Actually: ["", MCP_Def, " and ", UCP_Def, " are protocols."]
    // wrapDefinitions implementation: 
    // parts = ["MCP and UCP are protocols."]
    // term="MCP" -> parts = ["", <Def>MCP</Def>, " and UCP are protocols."]
    // term="UCP" -> parts = ["", <Def>MCP</Def>, " and ", <Def>UCP</Def>, " are protocols."]
    
    const definitionsCount = result.filter(part => typeof part === 'object').length;
    expect(definitionsCount).toBe(2);
  });

  it('should return the original string if no terms match', () => {
    const text = 'This string has no special terms.';
    const result = wrapDefinitions(text);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(text);
  });
});
