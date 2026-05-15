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

const strengthMeta = [
  null,
  { label: 'Weak',   color: 'bg-red-500',   text: 'text-red-400' },
  { label: 'Fair',   color: 'bg-amber-400',  text: 'text-amber-400' },
  { label: 'Good',   color: 'bg-blue-400',   text: 'text-blue-400' },
  { label: 'Strong', color: 'bg-emerald-400', text: 'text-emerald-400' },
];

function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8)         s++;
  if (/[A-Z]/.test(pw))       s++;
  if (/[0-9]/.test(pw))       s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const perks = [
  { icon: '🚀', text: '1,000 free API calls / day' },
  { icon: '⚡', text: 'Instant key generation' },
  { icon: '📊', text: 'Usage analytics dashboard' },
  { icon: '🔑', text: 'No credit card required' },
];

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [strength, setStrength] = useState(0);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handlePasswordChange = (e) => {
    setForm({ ...form, password: e.target.value });
    setStrength(calcStrength(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.register(form);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err) {
      const details = err.response?.data?.error?.details;
      setErrorMsg(details?.[0]?.msg || err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 hover:border-white/[0.18] transition-all duration-200';

  return (
    <div className="min-h-screen bg-[#030308] flex overflow-hidden relative">

      {/* ── Aurora background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-violet-600/[0.14] blur-[140px] animate-orb-2" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.14] blur-[140px] animate-orb-1" />
        <div className="absolute top-1/3 right-1/3 w-[350px] h-[350px] rounded-full bg-purple-700/[0.08] blur-[100px] animate-orb-3" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      {/* ── Centered layout ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[880px]">

          {/* Top logo row */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <PinIcon />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent tracking-tight">
              Village API Platform
            </span>
          </div>

          {/* Two-column glass card */}
          <div className="grid lg:grid-cols-[1fr_1.15fr] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-black/60">

            {/* ── Left: value prop ── */}
            <div className="relative p-10 border-r border-white/[0.06] flex flex-col justify-between">
              {/* Subtle inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.07] via-transparent to-violet-600/[0.05] pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-medium text-indigo-400">Free forever plan available</span>
                </div>

                <h2 className="text-3xl font-bold leading-snug mb-3">
                  <span className="bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
                    Start building<br />in minutes
                  </span>
                </h2>
                <p className="text-white/35 text-sm leading-relaxed mb-8">
                  Get instant access to India's complete geographic database — no credit card, no setup friction.
                </p>

                {/* Perks */}
                <div className="space-y-3 mb-10">
                  {perks.map((p) => (
                    <div key={p.text} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-base shrink-0">
                        {p.icon}
                      </div>
                      <span className="text-sm text-white/60">{p.text}</span>
                    </div>
                  ))}
                </div>

                {/* Quote / social proof */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                  <p className="text-xs text-white/40 italic leading-relaxed">
                    "The cleanest Indian geography API I've used — coverage is incredible and latency is genuinely impressive."
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-[10px] font-bold text-white">R</div>
                    <span className="text-xs text-white/30">Ravi M. · Full-stack developer</span>
                  </div>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="relative z-10 grid grid-cols-3 gap-2 pt-6 border-t border-white/[0.06] mt-6">
                {[
                  { value: '36', label: 'States & UTs' },
                  { value: '766', label: 'Districts' },
                  { value: '600K+', label: 'Villages' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">{s.value}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="p-10">
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-white mb-1.5 tracking-tight">Create your account</h1>
                <p className="text-sm text-white/35">Free plan · 1,000 API calls/day · no card needed</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400 animate-fade-in">
                    <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                      Full name <span className="text-indigo-400">*</span>
                    </label>
                    <input placeholder="Ravi Kumar" value={form.name} onChange={set('name')} required className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Company</label>
                    <input placeholder="Acme Corp" value={form.company} onChange={set('company')} className={inputCls} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                    Work email <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="ravi@company.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                    Password <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 chars, uppercase + number"
                      value={form.password}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                      className={`${inputCls} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/55 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                          showPass
                            ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        } />
                      </svg>
                    </button>
                  </div>

                  {/* Password strength */}
                  {form.password && strength > 0 && (
                    <div className="space-y-1.5 animate-fade-in">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthMeta[strength].color : 'bg-white/[0.07]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-white/30">
                        Strength:{' '}
                        <span className={`font-semibold ${strengthMeta[strength].text}`}>
                          {strengthMeta[strength].label}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating account…
                    </span>
                  ) : 'Create free account →'}
                </button>

                <p className="text-[11px] text-white/20 text-center">
                  By creating an account you agree to our Terms of Service & Privacy Policy
                </p>
              </form>

              <p className="text-center text-sm text-white/30 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
