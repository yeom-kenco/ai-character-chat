import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CharacterCard from '../CharacterCard';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const DEFAULT_PROPS = {
  id: 'luna',
  name: 'Luna',
  description: 'A dreamy poet who speaks in metaphors.',
  tags: ['Creative', 'Poetic', 'Gentle'],
  profileImage: { src: '/img/luna.png', height: 512, width: 512 },
};

describe('CharacterCard', () => {
  it('renders character name, description, and profile image', () => {
    render(<CharacterCard {...DEFAULT_PROPS} />);

    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(
      screen.getByText('A dreamy poet who speaks in metaphors.'),
    ).toBeInTheDocument();
    expect(screen.getByAltText('Luna 프로필 이미지')).toBeInTheDocument();
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
