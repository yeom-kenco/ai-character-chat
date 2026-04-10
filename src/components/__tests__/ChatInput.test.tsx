import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import ChatInput from '../ChatInput';

describe('ChatInput', () => {
  it('renders textarea and send button', () => {
    render(<ChatInput onSend={vi.fn()} disabled={false} />);

    expect(
      screen.getByPlaceholderText('메시지를 입력하세요...'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '메시지 전송' })).toBeInTheDocument();
  });

  it('calls onSend with trimmed content when button clicked', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...');
    await userEvent.type(textarea, '  Hello world  ');
    await userEvent.click(screen.getByRole('button', { name: '메시지 전송' }));

    expect(handleSend).toHaveBeenCalledWith('Hello world');
  });

  it('clears textarea after send', async () => {
    render(<ChatInput onSend={vi.fn()} disabled={false} />);

    const textarea = screen.getByPlaceholderText(
      '메시지를 입력하세요...',
    ) as HTMLTextAreaElement;
    await userEvent.type(textarea, 'Some message');
    await userEvent.click(screen.getByRole('button', { name: '메시지 전송' }));

    expect(textarea.value).toBe('');
  });

  it('does not call onSend when textarea is empty', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={false} />);

    await userEvent.click(screen.getByRole('button', { name: '메시지 전송' }));

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('sends message on Enter key', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...');
    await userEvent.type(textarea, 'Enter test{Enter}');

    expect(handleSend).toHaveBeenCalledWith('Enter test');
  });

  it('does not send on Shift+Enter', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={false} />);

    const textarea = screen.getByPlaceholderText('메시지를 입력하세요...');
    await userEvent.type(textarea, 'Line one{Shift>}{Enter}{/Shift}');

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('disables send button when disabled prop is true', () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);

    expect(screen.getByRole('button', { name: '메시지 전송' })).toBeDisabled();
  });
});
