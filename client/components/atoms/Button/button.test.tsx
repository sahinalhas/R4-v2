import { describe, it, expect } from 'vitest';
import { render } from '@test/utils/render';
import { Button } from './button';

describe('Button', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    const { getByRole } = render(<Button>Default</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('from-primary');
  });

  it('applies destructive variant classes', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('from-destructive');
  });

  it('handles disabled state', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies size variants', () => {
    const { getByRole } = render(<Button size="sm">Small</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('h-9');
  });
});
