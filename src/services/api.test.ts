import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from './api';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('api client', () => {
  it('throws invalid-credentials on 401', async () => {
    (fetch as any).mockResolvedValue({ status: 401, ok: false });
    await expect(api.machines()).rejects.toThrow('Invalid username or password.');
  });

  it('reports unreachable API distinctly', async () => {
    (fetch as any).mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api.machines()).rejects.toThrow('Cannot reach the API');
  });

  it('sends cookies and builds trend URL', async () => {
    (fetch as any).mockResolvedValue({ status: 200, ok: true, json: async () => ({}) });
    await api.trend('M-001', 'vibration', 'hour');
    const [url, opts] = (fetch as any).mock.calls[0];
    expect(url).toContain('/api/machines/M-001/trend?sensor=vibration&bucket=hour');
    expect(opts.credentials).toBe('include');
  });
});
