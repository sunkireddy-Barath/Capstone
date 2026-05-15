import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const PinIcon = () => (
  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {off ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
);

const features = [
  { icon: '⚡', label: 'Sub-100ms responses', sub: 'Redis-cached endpoints' },
  { icon: '🗺️', label: '600K+ villages', sub: 'Complete 2011 census data' },
  { icon: '🔐', label: 'API key + JWT auth', sub: 'Secure & rate-limited' },
  { icon: '🇮🇳', label: 'All 36 states & UTs', sub: 'National coverage' },
];

const stats = [
  { value: '36', label: 'States & UTs' },
  { value: '766', label: 'Districts' },
  { value: '600K+', label: 'Villages' },
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
    <div className="min-h-screen bg-[#030308] flex overflow-hidden relative">

      {/* ── Aurora background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-indigo-600/[0.15] blur-[140px] animate-orb-1" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-violet-600/[0.15] blur-[140px] animate-orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-700/[0.08] blur-[100px] animate-orb-3" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 relative p-12 border-r border-white/[0.05]">
        <div className="absolute inset-0 bg-white/[0.015] backdrop-blur-sm" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-14">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <PinIcon />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent tracking-tight">
              Village API
            </span>
          </div>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Live — 99.9% uptime</span>
          </div>

          <h2 className="text-[2.1rem] font-bold leading-tight mb-4">
            <span className="bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
              India's most complete<br />geographic data API
            </span>
          </h2>
          <p className="text-white/35 text-sm leading-relaxed mb-10">
            Access 600,000+ villages across all states, districts, and sub-districts of India.
            Production-ready with sub-100ms responses.
          </p>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-4 bg-white/[0.035] border border-white/[0.07] rounded-2xl p-4 backdrop-blur-sm hover:bg-white/[0.055] hover:border-white/[0.12] transition-all duration-200 group"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shrink-0 group-hover:bg-indigo-500/15 transition-colors">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/85">{f.label}</p>
                  <p className="text-xs text-white/35">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-2 pt-8 border-t border-white/[0.06]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-xs text-white/35 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <PinIcon />
            </div>
            <span className="text-base font-bold text-white">Village API Platform</span>
          </div>

          {/* Glass card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/60">

            {/* Header */}
            <div className="mb-8">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mb-5">
                <PinIcon />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Welcome back</h1>
              <p className="text-sm text-white/35">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="flex items-start gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400 animate-fade-in">
                  <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Email address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 hover:border-white/[0.18] transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 hover:border-white/[0.18] transition-all duration-200 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                  >
                    <EyeIcon off={showPass} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-white/30 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <p className="text-center text-[11px] text-white/15 mt-5">
            Demo&nbsp;&nbsp;
            <span className="font-mono text-white/25">admin@villageapi.in</span>
            <span className="text-white/10"> / </span>
            <span className="font-mono text-white/25">Admin@123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
