import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import { HttpStatusBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Table';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { formatDateTime, formatNumber, truncate } from '../../utils/helpers';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: '2xx Success', value: '2' },
  { label: '4xx Client Error', value: '4' },
  { label: '5xx Server Error', value: '5' },
];

export default function AdminApiLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 25 };
      if (statusFilter) params.statusCode = statusFilter;
      const res = await adminApi.getLogs(params);
      setLogs(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { setPage(1); load(1); }, [statusFilter]);
  useEffect(() => { load(page); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const filtered = search
    ? logs.filter((l) => l.endpoint?.includes(search) || l.user?.email?.includes(search))
    : logs;

  const successCount = logs.filter((l) => l.statusCode < 300).length;
  const errorCount = logs.filter((l) => l.statusCode >= 400).length;
  const cacheCount = logs.filter((l) => l.cacheHit).length;

  return (
    <Layout>
      <PageHeader
        title="Request Logs"
        subtitle={`${formatNumber(total)} total log entries`}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-sm flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Success (this page)</p>
            <p className="text-lg font-bold text-green-400">{successCount}</p>
          </div>
        </div>
        <div className="card-sm flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Errors (this page)</p>
            <p className="text-lg font-bold text-red-400">{errorCount}</p>
          </div>
        </div>
        <div className="card-sm flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Cache Hits (this page)</p>
            <p className="text-lg font-bold text-brand-400">{cacheCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form onSubmit={handleSearch} className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter by endpoint or user…"
            className="input-base pl-9 py-2 text-sm w-72"
          />
        </form>

        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                statusFilter === opt.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter(''); }}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={10} cols={7} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  {['Endpoint', 'Method', 'Status', 'Time', 'Cache', 'User', 'When'].map((h) => (
                    <th key={h} className="table-header px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/30 transition-colors group">
                      <td className="table-cell px-4 font-mono text-xs text-gray-300 max-w-[240px]">
                        <span title={log.endpoint}>{truncate(log.endpoint, 45)}</span>
                      </td>
                      <td className="table-cell px-4 text-xs text-gray-400">{log.method}</td>
                      <td className="table-cell px-4"><HttpStatusBadge code={log.statusCode} /></td>
                      <td className={`table-cell px-4 text-xs font-mono ${log.responseTime > 500 ? 'text-amber-400' : log.responseTime > 200 ? 'text-gray-400' : 'text-green-400'}`}>
                        {log.responseTime}ms
                      </td>
                      <td className="table-cell px-4">
                        {log.cacheHit ? (
                          <span className="inline-flex items-center gap-1 text-xs text-brand-400 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                            HIT
                          </span>
                        ) : (
                          <span className="text-xs text-gray-700">MISS</span>
                        )}
                      </td>
                      <td className="table-cell px-4">
                        {log.user ? (
                          <div>
                            <p className="text-xs text-gray-300">{log.user.name}</p>
                            <p className="text-xs text-gray-600 font-mono">{truncate(log.user.email, 28)}</p>
                          </div>
                        ) : (
                          <span className="text-gray-700 text-xs">—</span>
                        )}
                      </td>
                      <td className="table-cell px-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={Math.ceil(total / 25)} onPageChange={setPage} />
        </>
      )}
    </Layout>
  );
}
