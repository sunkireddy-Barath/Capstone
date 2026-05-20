import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const strengthLevels = [
  null,
  { label: 'Weak',   bar: 'bg-red-500',     text: 'text-red-400' },
  { label: 'Fair',   bar: 'bg-amber-400',   text: 'text-amber-400' },
  { label: 'Good',   bar: 'bg-blue-400',    text: 'text-blue-400' },
  { label: 'Strong', bar: 'bg-emerald-400', text: 'text-emerald-400' },
];

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <span className="text-sm font-semibold text-white tracking-tight">CapStone</span>
  </div>
);

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

  return (
    <div className="min-h-screen flex" style={{ background: '#07070c' }}>

      {/* ─── Left panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] shrink-0 relative overflow-hidden p-14"
        style={{ background: 'linear-gradient(135deg,#0d0d18 0%,#0a0a14 50%,#07070c 100%)' }}>

        {/* Grain texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-r">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-r)" opacity="0.4"/>
        </svg>

        {/* Glow accents */}
        <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">

          {/* Logo */}
          <Logo />

          {/* Main headline */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/8 px-3 py-1 mb-8 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span className="text-xs font-medium text-violet-400 tracking-wide">Free forever · No card needed</span>
            </div>

            <h1 className="text-[3.6rem] font-black leading-[1.0] tracking-tighter text-white mb-6">
              Build with<br />
              India's<br />
              <span style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                geo data.
              </span>
            </h1>

            <p className="text-[15px] text-zinc-500 leading-relaxed max-w-[340px]">
              Instant access to states, districts, sub-districts and villages — 1,000 free API calls per day, no credit card required.
            </p>
          </div>

          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: '1,000', l: 'Free calls/day' },
              { n: '71+',   l: 'Villages loaded' },
              { n: 'Instant', l: 'Key generation' },
            ].map(({ n, l }) => (
              <div key={l} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white mb-1">{n}</p>
                <p className="text-xs text-zinc-600 leading-snug">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top nav */}
        <nav className="flex items-center justify-between px-10 py-6">
          <div className="lg:hidden"><Logo /></div>
          <div className="lg:ml-auto flex items-center gap-2 text-sm">
            <span className="text-zinc-600">Already have an account?</span>
            <Link to="/login"
              className="font-medium text-indigo-400 hover:text-white transition-colors duration-150">
              Sign in →
            </Link>
          </div>
        </nav>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-[400px]">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-[1.75rem] font-bold tracking-tight text-white mb-2">
                Create your account
              </h2>
              <p className="text-[15px] text-zinc-500">Free plan · 1,000 API calls per day</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Name + Company */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    Full name <span className="text-indigo-500 normal-case tracking-normal">*</span>
                  </label>
                  <input
                    placeholder="Ravi Kumar"
                    value={form.name}
                    onChange={set('name')}
                    required
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-150 hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">Company</label>
                  <input
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={set('company')}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-150 hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Email <span className="text-indigo-500 normal-case tracking-normal">*</span>
                </label>
                <input
                  type="email"
                  placeholder="ravi@company.com"
                  value={form.email}
                  onChange={set('email')}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-150 hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                  Password <span className="text-indigo-500 normal-case tracking-normal">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 chars · uppercase · number"
                    value={form.password}
                    onChange={handlePassword}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-12 text-[15px] text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-150 hover:border-zinc-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
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

                {/* Strength meter */}
                {form.password && strength > 0 && (
                  <div className="space-y-1.5">
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl py-3 text-[15px] font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: loading ? '#4338ca' : 'linear-gradient(135deg,#4f46e5,#6d28d9)' }}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account…</>
                    : 'Create free account'}
                </span>
              </button>

              <p className="text-center text-xs text-zinc-700">
                By signing up you agree to our Terms of Service
              </p>
            </form>

            {/* Footer */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs text-zinc-700">or</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <p className="mt-5 text-center text-sm text-zinc-600">
              Already have an account?{' '}
              <Link to="/login"
                className="font-semibold text-zinc-300 hover:text-white transition-colors duration-150 underline underline-offset-4 decoration-zinc-700 hover:decoration-zinc-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
