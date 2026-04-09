import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CharacterCard from '../CharacterCard';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const DEFAULT_PROPS = {
  id: 'luna',
  name: 'Luna',
  description: 'A dreamy poet who speaks in metaphors.',
  tags: ['Creative', 'Poetic', 'Gentle'],
  profileEmoji: '\uD83C\uDF19',
};

describe('CharacterCard', () => {
  it('renders character name, description, and profileEmoji', () => {
    render(<CharacterCard {...DEFAULT_PROPS} />);

    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(
      screen.getByText('A dreamy poet who speaks in metaphors.'),
    ).toBeInTheDocument();
    expect(screen.getByText('\uD83C\uDF19')).toBeInTheDocument();
  });

  it('renders all tags as badges', () => {
    render(<CharacterCard {...DEFAULT_PROPS} />);

    for (const tag of DEFAULT_PROPS.tags) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });

  it('links to the correct /chat/{id} URL', () => {
    render(<CharacterCard {...DEFAULT_PROPS} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/chat/luna');
  });

  it('renders with an article semantic HTML element', () => {
    render(<CharacterCard {...DEFAULT_PROPS} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
