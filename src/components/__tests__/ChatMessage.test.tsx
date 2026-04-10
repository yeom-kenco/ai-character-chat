import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import ChatMessage from '../ChatMessage';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('ChatMessage', () => {
  it('renders user message content right-aligned without character name', () => {
    render(<ChatMessage role="user" content="Hello there!" />);

    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.queryByText('Luna')).not.toBeInTheDocument();

    const wrapper = screen.getByText('Hello there!').closest('div[class*="items-end"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders assistant message with content and character name', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Nice to meet you!"
        characterName="Luna"
        characterImage={{ src: '/img/luna.png', height: 512, width: 512 }}
      />,
    );

    expect(screen.getByText('Nice to meet you!')).toBeInTheDocument();
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('shows typing indicator when isStreaming is true and content is empty', () => {
    render(
      <ChatMessage
        role="assistant"
        content=""
        characterName="Luna"
        isStreaming={true}
      />,
    );

    expect(screen.getByLabelText('응답 작성 중')).toBeInTheDocument();
  });

  it('does not show typing indicator when content has text even if isStreaming', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Some response"
        characterName="Luna"
        isStreaming={true}
      />,
    );

    expect(screen.getByText('Some response')).toBeInTheDocument();
    expect(screen.queryByLabelText('응답 작성 중')).not.toBeInTheDocument();
  });
});
