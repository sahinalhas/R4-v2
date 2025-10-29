import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@test/utils/render';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gradient-to-br');
  });

  it('applies variant prop correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-destructive');
  });

  it('applies size prop correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('merges custom className with default styles', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('inline-flex');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('inline-flex');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Button with ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('renders icon button variant', () => {
    render(
      <Button size="icon" aria-label="Icon button">
        <svg />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('from-primary');
    });

    it('renders destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      expect(screen.getByRole('button')).toHaveClass('from-destructive');
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      expect(screen.getByRole('button')).toHaveClass('from-secondary');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent/60');
    });

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>);
      expect(screen.getByRole('button')).toHaveClass('underline-offset-4');
    });
  });
});
