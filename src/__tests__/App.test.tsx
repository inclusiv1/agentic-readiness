import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { describe, it, expect, vi } from 'vitest';

// Mock scrollTo since it's not implemented in JSDOM
window.scrollTo = vi.fn();

describe('App navigation flow', () => {
  it('should navigate through the questionnaire steps', async () => {
    render(<App />);
    
    // Step 1
    expect(screen.getByText(/Where is your business in the journey/i)).toBeInTheDocument();
    
    // Select an option to enable next button
    const option = screen.getByLabelText(/Looking for guidance/i);
    fireEvent.click(option);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    // Step 2
    expect(screen.getByText(/Which commerce platform\(s\) do you use/i)).toBeInTheDocument();
  });
});
