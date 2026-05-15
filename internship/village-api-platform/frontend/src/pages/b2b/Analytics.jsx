import { useEffect, useState } from 'react';
import { b2bApi } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { RequestsAreaChart, ResponseTimeChart } from '../../components/charts/UsageChart';
import { PageLoader } from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

export default function B2BAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = async (d = days) => {
    setLoading(true);
    try {
      const res = await b2bApi.getAnalytics(d);
      setData(res.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(days); }, [days]);

  if (loading) return <Layout><PageLoader /></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Analytics"
        subtitle="Your API usage breakdown"
        actions={
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={days === d ? 'primary' : 'secondary'}
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Daily Requests & Errors</h3>
          <RequestsAreaChart data={data?.dailyUsage || []} />
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Avg Response Time (ms)</h3>
          <ResponseTimeChart data={data?.dailyUsage || []} />
        </div>
      </div>

      {/* Summary table */}
      <div className="card mt-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Daily Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-2 px-2 text-left">Date</th>
                <th className="pb-2 px-2 text-right">Requests</th>
                <th className="pb-2 px-2 text-right">Errors</th>
                <th className="pb-2 px-2 text-right">Cache Hits</th>
                <th className="pb-2 px-2 text-right">Avg Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {(data?.dailyUsage || []).slice().reverse().map((d) => (
                <tr key={d.date} className="hover:bg-gray-800/20">
                  <td className="py-2 px-2 text-gray-300">{d.date}</td>
                  <td className="py-2 px-2 text-right text-gray-300">{d.requests.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-red-400">{d.errors}</td>
                  <td className="py-2 px-2 text-right text-green-400">{d.cacheHits}</td>
                  <td className="py-2 px-2 text-right text-gray-400">{d.avgResponseTime}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
