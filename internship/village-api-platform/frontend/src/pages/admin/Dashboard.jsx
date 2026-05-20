import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { RequestsAreaChart, ResponseTimeChart } from '../../components/charts/UsageChart';
import { formatNumber, formatDateTime } from '../../utils/helpers';
import { HttpStatusBadge } from '../../components/ui/Badge';
import { SkeletonStatGrid } from '../../components/ui/Skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

function StatCard({ label, value, sub, accent, icon }) {
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
        <div className={`p-2 rounded-lg ${a.bg} ${a.text}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-1 truncate max-w-[200px]">{label}</p>
      <p className="text-brand-400 font-semibold">{payload[0].value} requests</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [logs, setLogs] = useState([]);
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, dailyRes, logsRes, epRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getDailyUsage(30),
          adminApi.getLogs({ limit: 10, page: 1 }),
          adminApi.getTopEndpoints(),
        ]);
        setStats(statsRes.data.data);
        setDaily(dailyRes.data.data || []);
        setLogs(logsRes.data.data || []);
        setEndpoints(
          (epRes.data.data || []).map((e) => ({
            endpoint: e.endpoint.replace('/api/v1', '').replace('/api/', '/'),
            count: e._count?.endpoint || 0,
          })).slice(0, 8)
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const errorRate = daily.length
    ? Math.round((daily.reduce((s, d) => s + d.errors, 0) / Math.max(daily.reduce((s, d) => s + d.requests, 0), 1)) * 100)
    : 0;

  const cacheRate = daily.length
    ? Math.round((daily.reduce((s, d) => s + d.cacheHits, 0) / Math.max(daily.reduce((s, d) => s + d.requests, 0), 1)) * 100)
    : 0;

  return (
    <Layout>
      <PageHeader title="System Overview" subtitle="Real-time platform metrics and analytics" />

      {loading ? (
        <SkeletonStatGrid count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Users"
              value={formatNumber(stats?.totalUsers || 0)}
              sub={`+${stats?.newUsersToday || 0} new today`}
              accent="brand"
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            />
            <StatCard
              label="Active API Keys"
              value={formatNumber(stats?.activeApiKeys || 0)}
              sub={`of ${stats?.totalApiKeys || 0} total`}
              accent="green"
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
            />
            <StatCard
              label="Requests Today"
              value={formatNumber(stats?.requestsToday || 0)}
              sub={`${formatNumber(stats?.totalRequests || 0)} all time`}
              accent="amber"
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            />
            <StatCard
              label="Avg Response"
              value={`${stats?.avgResponseTime || 0}ms`}
              sub={`Cache hit rate: ${cacheRate}%`}
              accent="blue"
              icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Error Rate', value: `${errorRate}%`, status: errorRate < 5 ? 'good' : errorRate < 15 ? 'warn' : 'bad' },
              { label: 'Cache Hit Rate', value: `${cacheRate}%`, status: cacheRate > 50 ? 'good' : cacheRate > 20 ? 'warn' : 'bad' },
              { label: 'Avg Response (30d)', value: `${stats?.avgResponseTime || 0}ms`, status: (stats?.avgResponseTime || 0) < 200 ? 'good' : (stats?.avgResponseTime || 0) < 600 ? 'warn' : 'bad' },
            ].map((h) => (
              <div key={h.label} className="card-sm flex items-center gap-4">
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${h.status === 'good' ? 'bg-green-500' : h.status === 'warn' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-xs text-gray-500">{h.label}</p>
                  <p className={`text-base font-bold mt-0.5 ${h.status === 'good' ? 'text-green-400' : h.status === 'warn' ? 'text-amber-400' : 'text-red-400'}`}>{h.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Daily Requests (30 days)</h3>
              {daily.length > 0 ? (
                <RequestsAreaChart data={daily} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-gray-600 text-sm">No data yet</div>
              )}
            </div>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Avg Response Time</h3>
              {daily.length > 0 ? (
                <ResponseTimeChart data={daily.slice(-14)} />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">No data</div>
              )}
            </div>
          </div>

          {endpoints.length > 0 && (
            <div className="card mb-8">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Endpoints</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={endpoints} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="endpoint"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={160}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Requests">
                    {endpoints.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i === 0 ? '#6366f1' : i === 1 ? '#818cf8' : '#4338ca'}
                        opacity={1 - i * 0.08}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent API Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 px-2 text-left">Endpoint</th>
                    <th className="pb-2 px-2 text-left">Method</th>
                    <th className="pb-2 px-2 text-left">Status</th>
                    <th className="pb-2 px-2 text-left">Time</th>
                    <th className="pb-2 px-2 text-left">Cache</th>
                    <th className="pb-2 px-2 text-left">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-600 text-sm">No logs yet</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="py-2.5 px-2 font-mono text-xs text-gray-300 truncate max-w-[200px]">{log.endpoint}</td>
                        <td className="py-2.5 px-2 text-xs text-gray-400">{log.method}</td>
                        <td className="py-2.5 px-2"><HttpStatusBadge code={log.statusCode} /></td>
                        <td className={`py-2.5 px-2 text-xs font-mono ${log.responseTime > 500 ? 'text-amber-400' : 'text-green-400'}`}>{log.responseTime}ms</td>
                        <td className="py-2.5 px-2">
                          {log.cacheHit ? (
                            <span className="text-xs text-brand-400 font-medium">HIT</span>
                          ) : (
                            <span className="text-xs text-gray-700">MISS</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-gray-500 text-xs">{formatDateTime(log.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
