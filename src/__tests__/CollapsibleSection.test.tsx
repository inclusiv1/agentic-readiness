import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { describe, it, expect } from 'vitest';

describe('CollapsibleSection', () => {
  it('should be collapsed by default', () => {
    const { container } = render(
      <CollapsibleSection title="Test Section">
        <div>Content</div>
      </CollapsibleSection>
    );

    const contentDiv = container.querySelector('.collapsible-content');
    expect(contentDiv).toHaveClass('hidden');
  });

  it('should be open when defaultOpen is true', () => {
    const { container } = render(
      <CollapsibleSection title="Test Section" defaultOpen={true}>
        <div>Content</div>
      </CollapsibleSection>
    );

    const contentDiv = container.querySelector('.collapsible-content');
    expect(contentDiv).toHaveClass('block');
  });

  it('should toggle visibility when clicked', () => {
    const { container } = render(
      <CollapsibleSection title="Test Section">
        <div>Content</div>
      </CollapsibleSection>
    );

    const button = screen.getByRole('button');
    const contentDiv = container.querySelector('.collapsible-content');
    
    // Expand
    fireEvent.click(button);
    expect(contentDiv).toHaveClass('block');

    // Collapse
    fireEvent.click(button);
    expect(contentDiv).toHaveClass('hidden');
  });
});
