import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  Mail,
  Building,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserItem } from '../types';
import { Modal } from '../components/ui/StateModals';

export const UsersPage: React.FC = () => {
  const { users, addUser, deactivateUser } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserItem['role']>('Reliability Engineer');

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setRole('Reliability Engineer');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name,
      email,
      username: username || undefined,
      password: password || undefined,
      role,
      status: 'Active',
      lastActive: 'Just now'
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users</h1>
            <p className="text-xs text-slate-600 mt-1">
              Accounts, roles, and status.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1.5 self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add User
          </button>
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Authorized Personnel
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
            <span className="text-xs text-slate-500">active accounts</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Reliability Engineers
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-600">
              {users.filter(u => u.role === 'Reliability Engineer').length}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Maintenance Managers
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {users.filter(u => u.role === 'Maintenance Manager').length}
            </span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Security Standard
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold text-emerald-700">RBAC Enforced</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">Last Active</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{user.name}</span>
                        <span className="text-slate-500 text-[11px] block">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{user.created}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500 text-[11px]">{user.lastActive}</td>
                  <td className="py-3 px-3 text-right">
                    {user.status === 'Active' ? (
                      <button
                        type="button"
                        onClick={() => deactivateUser(user.id)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Plant User"
        subtitle="Roles and status for each account"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Create Account
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Yassine Riahi"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Username (login)</label>
            <input
              type="text"
              placeholder="Defaults to email prefix"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Temporary Password (min 8 chars)</label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Set an initial password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as any)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
            >
              <option value="Reliability Engineer">Reliability Engineer</option>
              <option value="Maintenance Manager">Maintenance Manager</option>
              <option value="Analyst">Analyst</option>
              <option value="Viewer">Viewer</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
