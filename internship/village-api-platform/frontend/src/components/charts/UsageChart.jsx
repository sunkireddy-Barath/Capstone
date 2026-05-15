import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="font-medium text-gray-100">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function RequestsAreaChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date ? format(new Date(d.date), 'MMM d') : d.date,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
        <Area type="monotone" dataKey="requests" stroke="#6366f1" fill="url(#reqGrad)" strokeWidth={2} name="Requests" dot={false} />
        <Area type="monotone" dataKey="errors" stroke="#f87171" fill="url(#errGrad)" strokeWidth={2} name="Errors" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ResponseTimeChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date ? format(new Date(d.date), 'MMM d') : d.date,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={50} unit="ms" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="avgResponseTime" fill="#818cf8" radius={[4, 4, 0, 0]} name="Avg Response (ms)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
