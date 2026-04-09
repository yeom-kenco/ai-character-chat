import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import CharacterCard from '../CharacterCard';

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

const DEFAULT_PROPS = {
  name: 'Luna',
  description: 'A dreamy poet who speaks in metaphors.',
  tags: ['Creative', 'Poetic', 'Gentle'],
  profileImage: { src: '/img/luna.png', height: 512, width: 512 },
  onClick: vi.fn(),
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

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<CharacterCard {...DEFAULT_PROPS} onClick={handleClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders with an article semantic HTML element', () => {
    render(<CharacterCard {...DEFAULT_PROPS} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
