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

const strengthLevels = [
  null,
  { label: 'Weak',   bar: 'bg-red-500',    text: 'text-red-400' },
  { label: 'Fair',   bar: 'bg-amber-400',  text: 'text-amber-400' },
  { label: 'Good',   bar: 'bg-blue-400',   text: 'text-blue-400' },
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

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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

  const inputCls = 'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/60 hover:border-zinc-700 transition-colors';

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <MapPinIcon />
          </div>
          <span className="text-[15px] font-semibold text-zinc-100 tracking-tight">Village API</span>
        </div>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-zinc-100 mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500">Free plan · 1,000 API calls/day · no card needed</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">Full name <span className="text-indigo-500">*</span></label>
              <input placeholder="Ravi Kumar" value={form.name} onChange={set('name')} required className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400">Company</label>
              <input placeholder="Acme Corp" value={form.company} onChange={set('company')} className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Email <span className="text-indigo-500">*</span></label>
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
            <label className="block text-xs font-medium text-zinc-400">Password <span className="text-indigo-500">*</span></label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 chars with uppercase & number"
                value={form.password}
                onChange={handlePassword}
                required
                autoComplete="new-password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
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
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
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
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating account
              </>
            ) : 'Create free account'}
          </button>

          <p className="text-xs text-zinc-700 text-center">
            By signing up you agree to our Terms of Service
          </p>
        </form>

        <p className="text-center text-sm text-zinc-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
