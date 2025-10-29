import { describe, it, expect } from 'vitest';
import { render, screen } from '@test/utils/render';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Badge>Default Badge</Badge>);
    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass('from-primary');
  });

  it('applies variant prop correctly', () => {
    const { rerender } = render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('from-destructive');

    rerender(<Badge variant="secondary">Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('from-secondary');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border-border/60');
  });

  it('merges custom className with default styles', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-badge');
    expect(badge).toHaveClass('inline-flex');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Badge ref={ref}>Badge with ref</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('accepts custom HTML attributes', () => {
    render(
      <Badge data-testid="custom-badge" aria-label="Custom badge">
        Badge
      </Badge>
    );
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toHaveAttribute('aria-label', 'Custom badge');
  });

  describe('variants', () => {
    it('renders all variant styles correctly', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
        const badge = screen.getByText(variant);
        expect(badge).toBeInTheDocument();
        unmount();
      });
    });
  });

  it('renders with icons', () => {
    render(
      <Badge>
        <svg data-testid="icon" />
        With Icon
      </Badge>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });
});
