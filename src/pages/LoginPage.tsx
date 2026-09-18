import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(username, password);
      await refreshAuth();
      navigate('/overview');
    } catch (e: any) {
      setError(e?.status === 401 ? 'Invalid username or password.' : String(e?.message ?? 'Sign-in failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-slate-200 rounded-md p-6 space-y-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Sign in</h1>
          <p className="text-xs text-slate-500 mt-1">Use a seeded account, e.g. admin / manager / viewer.</p>
        </div>
        {error && (
          <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="login-username" className="block text-xs font-bold text-slate-700 mb-1">Username</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};
