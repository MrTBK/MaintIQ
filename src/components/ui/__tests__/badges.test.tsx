import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KpiCard } from '../KpiCard';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('marks critical risk rose', () => {
    render(<StatusBadge status="Critical" type="risk" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(document.getElementById('status-badge-critical')?.className).toMatch(/rose/);
  });

  it('marks healthy green', () => {
    render(<StatusBadge status="Healthy" />);
    expect(document.getElementById('status-badge-healthy')?.className).toMatch(/emerald/);
  });
});

describe('KpiCard', () => {
  it('renders title, metric, and context', () => {
    render(<KpiCard id="kpi-test" title="At Risk" metric={28} context="Warning or critical" status="warning" />);
    expect(screen.getByText('At Risk')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('Warning or critical')).toBeInTheDocument();
  });
});
