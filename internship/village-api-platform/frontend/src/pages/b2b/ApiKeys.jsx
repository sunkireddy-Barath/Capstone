import { useEffect, useState } from 'react';
import { b2bApi } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { formatDate, copyToClipboard } from '../../utils/helpers';

function CopyField({ label, value, monospace = true }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handle = async () => {
    await copyToClipboard(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-950 rounded-xl border border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className={`text-xs text-gray-300 truncate ${monospace ? 'font-mono' : ''}`}>{value}</p>
        </div>
        <button
          onClick={handle}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 bg-gray-800 hover:bg-gray-700 text-gray-300"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function InlineCopy({ text }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const handle = async (e) => {
    e.stopPropagation();
    await copyToClipboard(text);
    setCopied(true);
    toast.success('API key copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="ml-2 text-xs text-gray-600 hover:text-brand-400 transition-colors">
      {copied ? <span className="text-green-400">✓</span> : '⎘'}
    </button>
  );
}

export default function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokeId, setRevokeId] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await b2bApi.listApiKeys();
      setKeys(res.data.data || []);
    } catch { toast.error('Failed to load API keys'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await b2bApi.createApiKey({ name: keyName.trim() });
      setNewKey(res.data.data);
      setKeyName('');
      setCreateOpen(false);
      load();
      toast.success('API key created successfully');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create key');
    } finally {
      setCreating(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revokeId) return;
    setRevoking(revokeId);
    try {
      await b2bApi.revokeApiKey(revokeId);
      toast.success('API key revoked');
      load();
    } catch {
      toast.error('Failed to revoke key');
    } finally {
      setRevoking(null);
      setRevokeId(null);
    }
  };

  return (
    <Layout>
      <PageHeader
        title="API Keys"
        subtitle="Manage your API credentials"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New API Key
          </Button>
        }
      />

      {/* New key one-time reveal */}
      {newKey && (
        <div className="mb-6 card border border-green-500/30 bg-green-500/5 animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-400">API Key created!</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Save the secret now — it won't be shown again after you close this.
                </p>
              </div>
            </div>
            <button onClick={() => setNewKey(null)} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            <CopyField label="API Key (public — safe to share)" value={newKey.key} />
            <CopyField label="API Secret (private — store securely)" value={newKey.secret} />
          </div>
          <div className="mt-4 flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2.5 border border-amber-500/20">
            <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Both headers are required: <code className="bg-gray-900 px-1.5 py-0.5 rounded font-mono">X-API-Key</code> and <code className="bg-gray-900 px-1.5 py-0.5 rounded font-mono">X-API-Secret</code></span>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable rows={3} cols={5} />
      ) : keys.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2 border-gray-800">
          <div className="h-14 w-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-300 mb-2">No API keys yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first API key to start accessing CapStone</p>
          <Button onClick={() => setCreateOpen(true)}>Create API Key</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`card-sm flex items-center justify-between gap-4 transition-all duration-150 hover:border-gray-700 ${!key.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="text-sm font-semibold text-gray-200">{key.name}</p>
                  <StatusBadge active={key.isActive} />
                </div>
                <div className="flex items-center font-mono text-xs text-gray-500">
                  <span className="truncate max-w-[260px]">{key.key}</span>
                  {key.isActive && <InlineCopy text={key.key} />}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                  <span>Created {formatDate(key.createdAt)}</span>
                  <span>·</span>
                  <span>{key.lastUsedAt ? `Last used ${formatDate(key.lastUsedAt)}` : 'Never used'}</span>
                  <span>·</span>
                  <span className="text-gray-500">{key.dailyLimit?.toLocaleString()} req/day</span>
                </div>
              </div>
              {key.isActive && (
                <Button
                  variant="danger"
                  size="sm"
                  loading={revoking === key.id}
                  onClick={() => setRevokeId(key.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Key Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); setError(''); setKeyName(''); }}
        title="Create API Key"
        size="sm"
      >
        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2.5 border border-red-500/20">
              {error}
            </div>
          )}
          <Input
            label="Key name"
            placeholder="e.g. Production App, Mobile Backend"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            helper="Give it a name you'll recognize later"
            autoFocus
          />
          <div className="flex gap-3 justify-end pt-1">
            <Button variant="secondary" onClick={() => { setCreateOpen(false); setError(''); }}>
              Cancel
            </Button>
            <Button loading={creating} onClick={handleCreate} disabled={!keyName.trim()}>
              Generate Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Confirm Modal */}
      <Modal
        open={!!revokeId}
        onClose={() => setRevokeId(null)}
        title="Revoke API Key"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">This action is permanent</p>
              <p className="text-xs text-gray-400 mt-1">
                Revoking this key will immediately invalidate it. Any applications using it will stop working. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRevokeId(null)}>Cancel</Button>
            <Button variant="danger" loading={!!revoking} onClick={confirmRevoke}>
              Yes, revoke key
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
