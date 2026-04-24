import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { authAPI } from '../../services/api';
import { PublicPageShell } from '../../components/common/PublicPageShell';

export default function InternalLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('management');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'management':
        return '/admin';
      case 'conductor':
        return '/conductor';
      case 'editor':
        return '/editor';
      default:
        return '/dashboard';
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.internalLogin(username, password, role);
      login(res.data.token, res.data.user);
      navigate(getDashboardPath(res.data.user?.role), { replace: true });
    } catch (err) {
      if (!err?.response) {
        toast.error('Unable to reach server. Please start backend services and try again.');
      } else {
        toast.error(err?.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoRole) => {
    setRole(demoRole);
    setUsername(`${demoRole}01`);
    setPassword('demo1234');
  };

  return (
      <PublicPageShell
        eyebrow="Employee Access"
        title="Internal Login"
        subtitle="Use your employee credentials to access management, conductor, or editor tools."
        className="pb-12"
      >
        <div className="mx-auto max-w-md">
          <div className="dashboard-panel">
            <div className="dashboard-panel-body space-y-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">Username</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={username}
                    placeholder="management01"
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    className="input-field w-full"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">Role</label>
                  <select
                    className="input-field w-full"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="management">Management</option>
                    <option value="conductor">Conductor</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900 mb-2">Demo credentials</p>
                  <div className="space-y-2 mb-3">
                    <p>Management: management01 / demo1234</p>
                    <p>Conductor: conductor01 / demo1234</p>
                    <p>Editor: editor01 / demo1234</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button type="button" className="btn-secondary text-xs py-2" onClick={() => fillDemoCredentials('management')}>
                      Management
                    </button>
                    <button type="button" className="btn-secondary text-xs py-2" onClick={() => fillDemoCredentials('conductor')}>
                      Conductor
                    </button>
                    <button type="button" className="btn-secondary text-xs py-2" onClick={() => fillDemoCredentials('editor')}>
                      Editor
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  className="w-full text-sm font-semibold text-orange-600 hover:text-orange-700"
                  onClick={() => navigate('/login')}
                >
                  ← Back to User Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </PublicPageShell>
  );
}
