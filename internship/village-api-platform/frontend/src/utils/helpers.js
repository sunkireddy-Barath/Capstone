export const formatNumber = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
  : String(n);

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const planColors = {
  FREE: 'bg-gray-500/20 text-gray-400',
  PREMIUM: 'bg-blue-500/20 text-blue-400',
  PRO: 'bg-purple-500/20 text-purple-400',
  UNLIMITED: 'bg-amber-500/20 text-amber-400',
};

export const statusColor = (code) => {
  if (code < 300) return 'text-green-400';
  if (code < 400) return 'text-blue-400';
  if (code < 500) return 'text-amber-400';
  return 'text-red-400';
};

export const truncate = (str, n = 40) =>
  str && str.length > n ? `${str.slice(0, n)}…` : str;

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
