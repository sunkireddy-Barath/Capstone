import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const MapPinIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    {off ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg className="h-3.5 w-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const features = [
  '600,000+ villages across all states',
  'Sub-100ms cached responses',
  'API key + JWT authentication',
  'Usage analytics dashboard',
];

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.login(form);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 border-r border-zinc-800 p-12 bg-[#0c0c0f]">
        <div className="flex items-center gap-2.5 mb-16">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <MapPinIcon />
          </div>
          <span className="text-[15px] font-semibold text-zinc-100 tracking-tight">Village API</span>
        </div>

        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 bg-zinc-800/60 border border-zinc-700/60 rounded-full px-3 py-1 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-zinc-400">Live · 99.9% uptime</span>
          </div>

          <h2 className="text-2xl font-bold text-zinc-100 leading-snug mb-3">
            India's geographic<br />data API platform
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-10">
            Structured, hierarchical access to India's complete geographic dataset. Built for developers.
          </p>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckIcon />
                <span className="text-sm text-zinc-400">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800">
          {[['36', 'States'], ['766', 'Districts'], ['600K+', 'Villages']].map(([v, l]) => (
            <div key={l}>
              <p className="text-xl font-bold text-zinc-100">{v}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[340px]">

          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <MapPinIcon />
            </div>
            <span className="text-sm font-semibold text-zinc-100">Village API</span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-zinc-100 mb-1">Sign in</h1>
            <p className="text-sm text-zinc-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-900/50 rounded-lg px-3.5 py-3 text-sm text-red-400">
                <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 hover:border-zinc-700 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 hover:border-zinc-700 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  <EyeIcon off={showPass} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6">
            No account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign up free
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-zinc-800/70">
            <p className="text-xs text-zinc-700 mb-2">Demo credentials</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-3.5 py-3 space-y-1">
              <p className="text-xs text-zinc-500">
                <span className="text-zinc-600 w-16 inline-block">Email</span>
                <span className="font-mono text-zinc-400">admin@villageapi.in</span>
              </p>
              <p className="text-xs text-zinc-500">
                <span className="text-zinc-600 w-16 inline-block">Password</span>
                <span className="font-mono text-zinc-400">Admin@123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
