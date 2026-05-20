import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // still used for analytics/api-keys links below
import { b2bApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { RequestsAreaChart } from '../../components/charts/UsageChart';
import { PlanBadge, HttpStatusBadge } from '../../components/ui/Badge';
import { SkeletonStatGrid } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { formatNumber, formatDateTime } from '../../utils/helpers';

const PLANS = [
  { key: 'FREE',      label: 'Free',      limit: '1,000',   subtext: 'req / day', price: null,     color: 'border-gray-700 hover:border-gray-600',     badge: 'text-gray-400',   highlight: false },
  { key: 'PREMIUM',   label: 'Premium',   limit: '10,000',  subtext: 'req / day', price: '₹999',   color: 'border-blue-500/40 hover:border-blue-500',   badge: 'text-blue-400',   highlight: false },
  { key: 'PRO',       label: 'Pro',       limit: '100,000', subtext: 'req / day', price: '₹2,499', color: 'border-brand-500/40 hover:border-brand-500',  badge: 'text-brand-400',  highlight: true  },
  { key: 'UNLIMITED', label: 'Unlimited', limit: '∞',       subtext: 'no limits', price: '₹4,999', color: 'border-amber-500/40 hover:border-amber-500',  badge: 'text-amber-400',  highlight: false },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function UpgradeModal({ open, onClose, currentPlan, onUpgradeFree, onUpgradePaid, upgrading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Choose your plan</h2>
            <p className="text-xs text-gray-500 mt-0.5">Paid plans use Razorpay secure checkout</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 my-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const isPaid = !!plan.price;
            const handleClick = () => isPaid ? onUpgradePaid(plan.key) : onUpgradeFree(plan.key);
            return (
              <button
                key={plan.key}
                disabled={isCurrent || upgrading}
                onClick={handleClick}
                className={`relative text-left rounded-xl border p-4 transition-all duration-150 ${plan.color} ${
                  isCurrent
                    ? 'opacity-50 cursor-not-allowed bg-gray-800/40'
                    : 'cursor-pointer bg-gray-800/20 hover:bg-gray-800/50 active:scale-[0.98]'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
                {plan.highlight && !isCurrent && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/30 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <p className={`text-sm font-bold mb-1 ${plan.badge}`}>{plan.label}</p>
                <p className="text-xl font-black text-gray-100">{plan.limit}</p>
                <p className="text-xs text-gray-500 mb-2">{plan.subtext}</p>
                {plan.price ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-gray-200">{plan.price}</span>
                    <span className="text-xs text-gray-600">/mo</span>
                    <svg className="h-3.5 w-3.5 text-blue-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">No payment needed</span>
                )}
              </button>
            );
          })}
        </div>

        {upgrading && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-brand-400" />
            Processing…
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-1">
          Paid plans open Razorpay secure checkout · All prices in INR
        </p>
      </div>
    </div>
  );
}

const planLimits = { FREE: '1,000', PREMIUM: '10,000', PRO: '100,000', UNLIMITED: '∞' };
const planColors = { FREE: 'text-gray-400', PREMIUM: 'text-blue-400', PRO: 'text-purple-400', UNLIMITED: 'text-amber-400' };

function StatCard({ label, value, sub, accent, icon, trend }) {
  const accents = {
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  };
  const a = accents[accent] || accents.brand;

  return (
    <div className={`card border ${a.border} animate-slide-up`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg ${a.bg}`}>
          <span className={a.text}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-500">{sub}</p>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function UsageBar({ used, limit }) {
  if (!limit || limit > 999999998) return null;
  const pct = Math.min((used / limit) * 100, 100);
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-brand-500';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Today's usage</span>
        <span>{used.toLocaleString()} / {limit.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function B2BDashboard() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const toast = useToast();

  const loadDashboard = () => {
    setLoading(true);
    b2bApi.getDashboard()
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  // FREE plan — direct API call, no payment
  const handleUpgradeFree = async (planType) => {
    if (planType === user?.planType) return;
    setUpgrading(true);
    try {
      const res = await b2bApi.upgradePlan(planType);
      setUser(res.data.data);
      setUpgradeOpen(false);
      toast.success('Switched to Free plan.');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Plan change failed.');
    } finally {
      setUpgrading(false);
    }
  };

  // PREMIUM / PRO / UNLIMITED — Razorpay checkout
  const handleUpgradePaid = async (planType) => {
    if (planType === user?.planType) return;
    setUpgrading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Could not load payment gateway. Try again.'); return; }

      const orderRes = await b2bApi.createPaymentOrder(planType);
      const { orderId, amount, currency, keyId, planLabel } = orderRes.data.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Village API Platform',
        description: planLabel,
        order_id: orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          try {
            const verifyRes = await b2bApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType,
            });
            setUser(verifyRes.data.data.user);
            setUpgradeOpen(false);
            toast.success(`Upgraded to ${planType} plan!`);
            loadDashboard();
          } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Payment verification failed.');
          }
        },
        modal: { ondismiss: () => setUpgrading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setUpgrading(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not initiate payment.');
      setUpgrading(false);
    } finally {
      // upgrading stays true until modal closes or payment completes
    }
  };

  const dailyLimit = { FREE: 1000, PREMIUM: 10000, PRO: 100000, UNLIMITED: 999999999 }[user?.planType] || 1000;
  const todayUsage = data?.dailyUsage?.[data.dailyUsage.length - 1]?.requests || 0;

  return (
    <Layout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}`}
        subtitle="Your API platform overview"
        actions={
          <div className="flex items-center gap-3">
            <PlanBadge plan={user?.planType || 'FREE'} />
            <button
              onClick={() => setUpgradeOpen(true)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              {user?.planType === 'FREE' ? 'Upgrade Plan' : 'Change Plan'}
            </button>
          </div>
        }
      />

      {loading ? (
        <SkeletonStatGrid count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Requests"
              value={formatNumber(data?.totalRequests || 0)}
              sub="All time"
              accent="brand"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              label="Active Keys"
              value={data?.activeApiKeys || 0}
              sub={`of ${data?.totalApiKeys || 0} keys`}
              accent="green"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            />
            <StatCard
              label="Daily Limit"
              value={planLimits[user?.planType] || '1,000'}
              sub="requests / day"
              accent="amber"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }
            />
            <div className="card border border-blue-500/20 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</p>
                <PlanBadge plan={user?.planType || 'FREE'} />
              </div>
              <p className={`text-2xl font-bold ${planColors[user?.planType] || 'text-gray-400'}`}>
                {user?.planType || 'FREE'}
              </p>
              <UsageBar used={todayUsage} limit={dailyLimit} />
            </div>
          </div>

          {/* Quick actions */}
          {(!data?.activeApiKeys || data.activeApiKeys === 0) && (
            <div className="card border-dashed border-2 border-gray-700 text-center py-8 mb-8 animate-fade-in">
              <div className="h-12 w-12 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-200 mb-1">No API keys yet</h3>
              <p className="text-xs text-gray-500 mb-4">Generate your first API key to start making requests</p>
              <Link to="/dashboard/api-keys" className="btn-primary text-sm">
                Create API Key
              </Link>
            </div>
          )}

          {/* Usage Chart */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300">Request History (30 days)</h3>
              <Link to="/dashboard/analytics" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                View full analytics →
              </Link>
            </div>
            {data?.dailyUsage?.length > 0 ? (
              <RequestsAreaChart data={data.dailyUsage} />
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-gray-600">No data yet — start making API requests</p>
              </div>
            )}
          </div>

          {/* Recent Logs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300">Recent Requests</h3>
              <span className="text-xs text-gray-600">Last 8 requests</span>
            </div>
            {(data?.recentLogs || []).length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">No requests yet</p>
            ) : (
              <div className="space-y-0">
                {(data.recentLogs).slice(0, 8).map((log, i) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between py-2.5 px-1 ${i < 7 ? 'border-b border-gray-800/50' : ''} hover:bg-gray-800/20 rounded-lg transition-colors`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <HttpStatusBadge code={log.statusCode} />
                      <span className="font-mono text-xs text-gray-400 truncate">{log.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <span className={`text-xs font-mono ${log.responseTime > 500 ? 'text-amber-400' : 'text-green-400'}`}>
                        {log.responseTime}ms
                      </span>
                      {log.cacheHit && (
                        <span className="text-xs text-brand-400 font-medium">CACHE</span>
                      )}
                      <span className="text-xs text-gray-600 hidden sm:block">{formatDateTime(log.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => { setUpgradeOpen(false); setUpgrading(false); }}
        currentPlan={user?.planType || 'FREE'}
        onUpgradeFree={handleUpgradeFree}
        onUpgradePaid={handleUpgradePaid}
        upgrading={upgrading}
      />
    </Layout>
  );
}
