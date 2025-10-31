import { describe, it, expect } from 'vitest';
import { render, screen } from '@test/utils/render';

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="stat-card" data-testid="stat-card">
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && (
          <span className={`stat-trend trend-${trend}`} data-testid="trend">
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
    </div>
  );
}

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Students" value={150} />);
    
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders with string value', () => {
    render(<StatCard title="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <StatCard
        title="Users"
        value={42}
        icon={<svg data-testid="icon" />}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('displays upward trend indicator', () => {
    render(<StatCard title="Growth" value={25} trend="up" />);
    const trend = screen.getByTestId('trend');
    expect(trend).toHaveTextContent('↑');
    expect(trend).toHaveClass('trend-up');
  });

  it('displays downward trend indicator', () => {
    render(<StatCard title="Decline" value={-5} trend="down" />);
    const trend = screen.getByTestId('trend');
    expect(trend).toHaveTextContent('↓');
    expect(trend).toHaveClass('trend-down');
  });

  it('displays neutral trend indicator', () => {
    render(<StatCard title="Stable" value={100} trend="neutral" />);
    const trend = screen.getByTestId('trend');
    expect(trend).toHaveTextContent('→');
    expect(trend).toHaveClass('trend-neutral');
  });

  it('renders without trend when not provided', () => {
    render(<StatCard title="Simple" value={10} />);
    expect(screen.queryByTestId('trend')).not.toBeInTheDocument();
  });
});
