import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../../App';
import { AppProvider } from '../../context/AppContext';
import { MachinesPage } from '../MachinesPage';

const ok = (json: any = {}) => ({ status: 200, ok: true, json: async () => json });
const denied = () => ({ status: 401, ok: false });

afterEach(() => {
  vi.unstubAllGlobals();
  window.location.hash = '#/';
});

describe('routing', () => {
  it('shows overview content when signed in', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ username: 'admin', role: 'ADMIN' })));
    render(<App />);
    await waitFor(() => expect(screen.getAllByText('Assets').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
  });

  it('hides everything behind sign-in when signed out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(denied()));
    render(<App />);
    await waitFor(() => expect(screen.getAllByText('Sign in').length).toBeGreaterThan(0));
    expect(screen.queryByText('Assets')).not.toBeInTheDocument();
    expect(screen.queryByText('Machines requiring attention')).not.toBeInTheDocument();
  });

  it('exposes a sign-in route', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(denied()));
    window.location.hash = '#/login';
    render(<App />);
    expect(screen.getAllByText('Sign in').length).toBeGreaterThan(0);
    window.location.hash = '#/';
  });
});

describe('MachinesPage filters', () => {
  it('narrows rows by search query', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter>
          <MachinesPage />
        </MemoryRouter>
      </AppProvider>
    );
    const box = screen.getByPlaceholderText('Search machines...');
    await user.type(box, 'M-042');
    expect(screen.queryByText('M-017')).not.toBeInTheDocument();
  });
});
