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
    <div className="min-h-screen flex flex-col" style={{ background: '#060609' }}>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%)' }} />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">CapStone</span>
        </div>
        <div className="text-sm text-zinc-500">
          New here?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Create an account
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex items-center gap-20">

          <div className="hidden lg:flex flex-col flex-1">

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-1 mb-8 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400 tracking-wide">Live · Production</span>
            </div>

            <h1 className="text-[3.25rem] font-black leading-[1.08] tracking-tight text-white mb-5">
              India's geographic<br />
              data,{' '}
              <span className="relative inline-block">
                <span style={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  via API.
                </span>
              </span>
            </h1>

            <p className="text-[15px] leading-relaxed text-zinc-500 mb-10 max-w-[400px]">
              Hierarchical access to states, districts, sub-districts and villages across India — production-ready, cached, and fully documented.
            </p>

            <div className="space-y-3 mb-12">
              {[
                ['States → Districts → Sub-districts → Villages', 'Full geographic hierarchy'],
                ['Sub-100ms responses', 'Redis-cached for speed'],
                ['API key + JWT authentication', 'Dual-layer security'],
                ['Usage analytics dashboard', 'Monitor every request'],
              ].map(([title, sub]) => (
                <div key={title} className="flex items-center gap-3.5">
                  <div className="h-8 w-8 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.08] flex items-center justify-center shrink-0">
                    <svg className="h-3.5 w-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{title}</p>
                    <p className="text-xs text-zinc-600">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-8">
              {[['36', 'States'], ['766', 'Districts'], ['600K+', 'Villages']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-white">{n}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[380px] shrink-0">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 backdrop-blur-sm">

              <div className="mb-7">
                <h2 className="text-xl font-bold text-white tracking-tight mb-1">Welcome back</h2>
                <p className="text-sm text-zinc-500">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-900/40 bg-red-950/25 px-3.5 py-3 text-sm text-red-400">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-400">Email address</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all hover:border-zinc-700 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10"
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
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 pr-11 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all hover:border-zinc-700 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading
                      ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing in…</>
                      : 'Sign in'}
                  </span>
                </button>

              </form>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-xs text-zinc-700">or</span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <p className="mt-5 text-center text-sm text-zinc-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-zinc-300 hover:text-white transition-colors">
                  Sign up free
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
