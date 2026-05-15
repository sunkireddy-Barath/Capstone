import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const plans = [
  { id: 'FREE', label: 'Free', limit: '1K req/day', color: 'text-gray-400', ring: 'ring-gray-700', selected: 'ring-brand-500 bg-brand-500/10' },
  { id: 'PREMIUM', label: 'Premium', limit: '10K req/day', color: 'text-blue-400', ring: 'ring-blue-700', selected: 'ring-blue-500 bg-blue-500/10' },
];

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState(0);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const handlePasswordChange = (e) => {
    setForm({ ...form, password: e.target.value });
    setStrength(calcStrength(e.target.value));
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(form);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      const details = err.response?.data?.error?.details;
      setError(details?.[0]?.msg || err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-9 w-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-100">Village API Platform</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-100 mb-1">Create your account</h1>
        <p className="text-gray-400 text-sm mb-8">
          Start free with 1,000 API calls/day. No credit card required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 animate-fade-in">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Full name <span className="text-red-400">*</span></label>
              <input
                placeholder="Ravi Kumar"
                value={form.name}
                onChange={set('name')}
                required
                className="input-base"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Company</label>
              <input
                placeholder="Acme Corp"
                value={form.company}
                onChange={set('company')}
                className="input-base"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Work email <span className="text-red-400">*</span></label>
            <input
              type="email"
              placeholder="ravi@company.com"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="email"
              className="input-base"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Password <span className="text-red-400">*</span></label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase + number"
                value={form.password}
                onChange={handlePasswordChange}
                required
                autoComplete="new-password"
                className="input-base pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPass
                    ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  } />
                </svg>
              </button>
            </div>
            {form.password && (
              <div className="space-y-1 animate-fade-in">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-gray-800'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Strength: <span className={`font-medium ${strength >= 3 ? 'text-green-400' : strength >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                    {strengthLabel[strength]}
                  </span>
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base font-semibold mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating account…
              </span>
            ) : 'Create free account'}
          </button>

          <p className="text-xs text-gray-600 text-center">
            By registering you agree to our Terms of Service and Privacy Policy
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
