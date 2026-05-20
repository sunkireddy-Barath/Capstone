import { useEffect, useState, useRef } from 'react';
import { adminApi } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { PlanBadge, StatusBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Table';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { formatDate, formatNumber, copyToClipboard } from '../../utils/helpers';
import { useToast } from '../../components/ui/Toast';

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const handle = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-400 transition-colors"
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400">Copied</span>
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

export default function AdminApiKeys() {
  const [keys, setKeys] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();
  const prevSearch = useRef(search);

  const load = async (p = page, q = search) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (q) params.search = q;
      const res = await adminApi.getApiKeys(params);
      setKeys(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (prevSearch.current !== search) {
      prevSearch.current = search;
      setPage(1);
      load(1, search);
    } else {
      load(page, search);
    }
  }, [page, search]);

  const filtered = keys;

  return (
    <Layout>
      <PageHeader
        title="API Keys"
        subtitle={`${formatNumber(total)} total keys across all users`}
        actions={
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keys, names, emails…"
              className="input-base pl-9 py-2 text-sm w-64"
            />
          </div>
        }
      />

      {loading ? (
        <SkeletonTable rows={10} cols={6} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  {['Key', 'Name', 'User', 'Plan', 'Status', 'Daily Limit', 'Last Used', 'Created'].map((h) => (
                    <th key={h} className="table-header px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">
                      No API keys found
                    </td>
                  </tr>
                ) : (
                  filtered.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="table-cell px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400 truncate max-w-[180px]">{key.key}</span>
                          <CopyBtn text={key.key} label="API Key" />
                        </div>
                      </td>
                      <td className="table-cell px-4 font-medium text-gray-200">{key.name}</td>
                      <td className="table-cell px-4">
                        <div>
                          <p className="text-xs text-gray-300">{key.user?.name || '—'}</p>
                          <p className="text-xs text-gray-500 font-mono">{key.user?.email || '—'}</p>
                        </div>
                      </td>
                      <td className="table-cell px-4">
                        <PlanBadge plan={key.user?.planType || 'FREE'} />
                      </td>
                      <td className="table-cell px-4">
                        <StatusBadge active={key.isActive} />
                      </td>
                      <td className="table-cell px-4 text-gray-400">{key.dailyLimit?.toLocaleString()}</td>
                      <td className="table-cell px-4 text-gray-500 text-xs">
                        {key.lastUsedAt ? formatDate(key.lastUsedAt) : <span className="text-gray-700">Never</span>}
                      </td>
                      <td className="table-cell px-4 text-gray-500 text-xs">{formatDate(key.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
