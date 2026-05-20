import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const strengthLevels = [
  null,
  { label: 'Weak',   bar: 'bg-red-500',     text: 'text-red-400' },
  { label: 'Fair',   bar: 'bg-amber-400',   text: 'text-amber-400' },
  { label: 'Good',   bar: 'bg-blue-400',    text: 'text-blue-400' },
  { label: 'Strong', bar: 'bg-emerald-400', text: 'text-emerald-400' },
];

function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const perks = [
  { icon: '⚡', text: '1,000 free API calls/day' },
  { icon: '🔑', text: 'Instant API key generation' },
  { icon: '📊', text: 'Usage analytics included' },
  { icon: '🚀', text: 'No credit card required' },
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

  const handlePassword = (e) => {
    setForm({ ...form, password: e.target.value });
    setStrength(calcStrength(e.target.value));
  };

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

  const input = 'w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors hover:border-zinc-700 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 relative overflow-hidden px-12 py-12"
        style={{ background: 'linear-gradient(160deg, #0f0f1a 0%, #0a0a0f 60%)' }}
      >
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-white tracking-tight">Village API Platform</span>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-medium text-indigo-400">Free forever · No card needed</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-snug tracking-tight mb-3">
              Start building<br />
              <span className="text-indigo-400">in minutes.</span>
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Get instant access to India's geographic data — states, districts, sub-districts and villages.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm shrink-0">
                  {p.icon}
                </div>
                <span className="text-sm text-zinc-400">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-xs text-zinc-500 italic leading-relaxed mb-3">
            "Cleanest Indian geography API I've used — coverage is incredible and latency is genuinely fast."
          </p>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">R</div>
            <span className="text-xs text-zinc-600">Ravi M. · Full-stack Developer</span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-zinc-100">Village API</span>
          </div>
          <div className="lg:ml-auto flex items-center gap-1.5 text-sm text-zinc-600">
            <span>Have an account?</span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[380px]">

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-zinc-100 mb-1.5 tracking-tight">Create your account</h2>
              <p className="text-sm text-zinc-500">Free plan · 1,000 API calls/day</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-900/60 bg-red-950/30 px-3.5 py-3 text-sm text-red-400">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                    Full name <span className="text-indigo-500">*</span>
                  </label>
                  <input placeholder="Ravi Kumar" value={form.name} onChange={set('name')} required className={input} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Company</label>
                  <input placeholder="Acme Corp" value={form.company} onChange={set('company')} className={input} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Email <span className="text-indigo-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="ravi@company.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  autoComplete="email"
                  className={input}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Password <span className="text-indigo-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 chars · uppercase · number"
                    value={form.password}
                    onChange={handlePassword}
                    required
                    autoComplete="new-password"
                    className={`${input} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={
                        showPass
                          ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      } />
                    </svg>
                  </button>
                </div>
                {form.password && strength > 0 && (
                  <div className="mt-2 space-y-1.5 animate-fade-in">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthLevels[strength].bar : 'bg-zinc-800'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600">
                      Strength: <span className={`font-medium ${strengthLevels[strength].text}`}>{strengthLevels[strength].label}</span>
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account</>
                  : 'Create free account'}
              </button>

              <p className="text-center text-xs text-zinc-700">
                By signing up you agree to our Terms of Service
              </p>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-600 lg:hidden">
              Have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
