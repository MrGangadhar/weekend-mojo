import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PublicPageShell } from '../../components/common/PublicPageShell';
import BrandLogo from '../../components/common/BrandLogo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    if (!username.trim() || !password) {
      toast.error('Please enter your username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(username.trim(), password);
      login(response.data.token, response.data.user);
      navigate(getDashboardPath(response.data.user?.role), { replace: true });
    } catch (error) {
      if (!error.response) {
        toast.error('Unable to reach server. Please start backend services and try again.');
      } else {
        toast.error(error.response?.data?.error || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PublicPageShell
      eyebrow="User Access"
      title="Sign in to Weekend Mojo"
      subtitle="Access bookings, tickets, and live trip updates from one account."
      className="pb-12"
    >
      <div className="mx-auto max-w-md">
        <div className="dashboard-panel">
          <div className="dashboard-panel-body space-y-6">
            <div className="text-center">
              <BrandLogo className="mx-auto mb-4" />
              <p className="text-sm text-slate-500">Sign in with your username and password</p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field mt-1"
              placeholder="user01"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-1"
              placeholder="demo1234"
              autoComplete="current-password"
            />
          </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900 mb-2">Demo user</p>
              <p>Username: user01</p>
              <p>Password: demo1234</p>
              <p className="mt-2 text-slate-600">You will be taken to your dashboard after sign in.</p>
            </div>

            <div className="text-center text-sm text-slate-500">
              Employee login?{' '}
              <button
                onClick={() => navigate('/internal-login')}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                Click here
              </button>
            </div>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}