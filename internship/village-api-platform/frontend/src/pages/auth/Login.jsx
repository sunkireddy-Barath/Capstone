import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(form);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#09090f' }}>

      {/* ── Left: Project details ── */}
      <div className="hidden lg:flex flex-col justify-between flex-1 px-16 py-14 relative overflow-hidden">

        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.07) 0%, transparent 65%)' }} />

        {/* Bottom-right glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(139,92,246,0.05) 0%, transparent 65%)' }} />

        <div className="relative z-10 flex flex-col h-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Village API Platform</span>
          </div>

          {/* Main content — vertical center */}
          <div className="flex-1 flex flex-col justify-center max-w-[520px]">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5 mb-10 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide">Live · 99.9% uptime</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-black tracking-tight text-white leading-[1.05] mb-5">
              India's geographic<br />
              <span style={{
                background: 'linear-gradient(90deg, #a5b4fc 0%, #c4b5fd 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                data API platform
              </span>
            </h1>

            <p className="text-[15px] text-zinc-500 leading-relaxed mb-10">
              Structured, hierarchical access to India's complete geographic dataset — states, districts, sub-districts, and villages. Built for developers.
            </p>

            {/* Feature list */}
            <ul className="space-y-3.5 mb-14">
              {[
                'Hierarchical data — states → districts → sub-districts → villages',
                'Sub-100ms cached responses via Redis',
                'API key + JWT dual authentication',
                'Usage analytics dashboard with daily charts',
                'Rate limiting — 1,000 free calls per day',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <svg className="h-2.5 w-2.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-zinc-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats row */}
          <div className="relative z-10">
            <div className="h-px bg-zinc-800/60 mb-8" />
            <div className="flex items-center gap-12">
              {[
                { n: '36',    l: 'States' },
                { n: '766',   l: 'Districts' },
                { n: '600K+', l: 'Villages' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-white">{n}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-zinc-800/60 shrink-0" />

      {/* ── Right: Auth form only ── */}
      <div className="w-full lg:w-[420px] shrink-0 flex flex-col" style={{ background: '#07070c' }}>

        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 px-8 py-7 lg:hidden">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Village API</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full">

            <div className="mb-9">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1.5">Sign in</h2>
              <p className="text-sm text-zinc-500">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-400">Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-zinc-400">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 pr-12 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
                    {showPass ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: loading ? '#4338ca' : 'linear-gradient(135deg, #4f46e5, #6d28d9)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing in…</>
                    : 'Sign in'}
                </span>
              </button>

            </form>

            <p className="mt-7 text-center text-sm text-zinc-600">
              No account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign up free
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
