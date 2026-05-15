import { useState } from 'react';
import Layout, { PageHeader } from '../../components/layout/Layout';

const BASE_URL = 'https://api.villageapi.in';

const endpoints = [
  {
    group: 'Geography',
    color: 'brand',
    items: [
      {
        method: 'GET',
        path: '/api/v1/states',
        description: 'List all Indian states with pagination',
        params: [
          { name: 'page', type: 'integer', default: '1', desc: 'Page number' },
          { name: 'limit', type: 'integer', default: '20', desc: 'Results per page (max 100)' },
        ],
        response: `{
  "success": true,
  "data": [
    { "id": 1, "code": "27", "name": "Maharashtra" },
    { "id": 2, "code": "7",  "name": "Delhi" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 36, "totalPages": 2 }
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/states/:stateCode/districts',
        description: 'List districts for a given state',
        params: [
          { name: 'stateCode', type: 'string', default: '27', desc: 'State code (path param)' },
          { name: 'page', type: 'integer', default: '1', desc: 'Page number' },
        ],
        response: `{
  "success": true,
  "data": [
    { "id": 1, "code": "572", "name": "Ahmednagar", "stateCode": "27" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 36 }
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/states/:stateCode/districts/:districtCode/subdistricts',
        description: 'List sub-districts (tehsils/talukas) for a district',
        params: [
          { name: 'stateCode', type: 'string', default: '27', desc: 'State code' },
          { name: 'districtCode', type: 'string', default: '572', desc: 'District code' },
        ],
        response: `{
  "success": true,
  "data": [
    { "id": 1, "code": "4341", "name": "Akole", "districtCode": "572" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 14 }
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/states/:stateCode/districts/:districtCode/subdistricts/:subdistrictCode/villages',
        description: 'List all villages in a sub-district',
        params: [
          { name: 'stateCode', type: 'string', default: '27', desc: 'State code' },
          { name: 'districtCode', type: 'string', default: '572', desc: 'District code' },
          { name: 'subdistrictCode', type: 'string', default: '4341', desc: 'Sub-district code' },
          { name: 'page', type: 'integer', default: '1', desc: 'Page number' },
          { name: 'limit', type: 'integer', default: '20', desc: 'Results per page' },
        ],
        response: `{
  "success": true,
  "data": [
    { "id": 1, "code": "V001", "name": "Akole", "subdistrictCode": "4341" }
  ],
  "meta": { "page": 1, "limit": 20, "total": 47 }
}`,
      },
    ],
  },
  {
    group: 'Search',
    color: 'green',
    items: [
      {
        method: 'GET',
        path: '/api/v1/search/villages',
        description: 'Full-text search across all 600K+ villages (trigram indexed)',
        params: [
          { name: 'q', type: 'string', default: 'Pune', desc: 'Search query (min 2 chars)' },
          { name: 'stateCode', type: 'string', default: '', desc: 'Filter by state code' },
          { name: 'limit', type: 'integer', default: '20', desc: 'Max results (up to 100)' },
        ],
        response: `{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Pune",
      "subdistrict": "Haveli",
      "district": "Pune",
      "state": "Maharashtra"
    }
  ],
  "meta": { "total": 4, "limit": 20 }
}`,
      },
      {
        method: 'GET',
        path: '/api/v1/search/autocomplete',
        description: 'Autocomplete suggestions — optimized for search-as-you-type',
        params: [
          { name: 'q', type: 'string', default: 'Mum', desc: 'Prefix query (min 2 chars)' },
          { name: 'limit', type: 'integer', default: '10', desc: 'Max suggestions (up to 20)' },
        ],
        response: `{
  "success": true,
  "data": [
    "Mumbai",
    "Mumbra",
    "Murbad"
  ]
}`,
      },
    ],
  },
  {
    group: 'Authentication',
    color: 'amber',
    items: [
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Create a new B2B account',
        params: [
          { name: 'name', type: 'string', default: '', desc: 'Full name (2–150 chars)' },
          { name: 'email', type: 'string', default: '', desc: 'Work email address' },
          { name: 'password', type: 'string', default: '', desc: 'Min 8 chars, mixed case + number' },
          { name: 'company', type: 'string', default: '', desc: 'Company name (optional)' },
        ],
        response: `{
  "success": true,
  "data": {
    "user": { "id": 42, "email": "dev@company.com", "role": "CLIENT", "planType": "FREE" },
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate and receive JWT tokens',
        params: [
          { name: 'email', type: 'string', default: '', desc: 'Registered email' },
          { name: 'password', type: 'string', default: '', desc: 'Account password' },
        ],
        response: `{
  "success": true,
  "data": {
    "user": { "id": 42, "role": "CLIENT", "planType": "FREE" },
    "accessToken": "<15-min JWT>",
    "refreshToken": "<7-day JWT>"
  }
}`,
      },
    ],
  },
];

const methodColors = {
  GET: 'text-green-400 bg-green-500/10 ring-1 ring-green-500/30',
  POST: 'text-blue-400 bg-blue-500/10 ring-1 ring-blue-500/30',
  PUT: 'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/30',
  DELETE: 'text-red-400 bg-red-500/10 ring-1 ring-red-500/30',
};

const groupColors = {
  brand: 'text-brand-400 bg-brand-500/10 ring-1 ring-brand-500/30',
  green: 'text-green-400 bg-green-500/10 ring-1 ring-green-500/30',
  amber: 'text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/30',
};

function EndpointCard({ endpoint }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card-sm border border-gray-800 hover:border-gray-700 transition-colors">
      <button
        className="w-full flex items-center gap-4 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${methodColors[endpoint.method]}`}>
          {endpoint.method}
        </span>
        <span className="flex-1 font-mono text-sm text-gray-300 truncate">{endpoint.path}</span>
        <span className="text-xs text-gray-500 hidden sm:block truncate max-w-xs">{endpoint.description}</span>
        <svg
          className={`h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-4 animate-fade-in">
          <p className="text-sm text-gray-400">{endpoint.description}</p>

          {/* Auth header note */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-300">
            <span className="font-semibold">Authentication:</span> Geography & Search endpoints require{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded font-mono">X-API-Key</code> and{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded font-mono">X-API-Secret</code> headers.
          </div>

          {/* Parameters */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parameters</p>
            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full text-xs">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500">Name</th>
                    <th className="px-3 py-2 text-left text-gray-500">Type</th>
                    <th className="px-3 py-2 text-left text-gray-500">Default</th>
                    <th className="px-3 py-2 text-left text-gray-500">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {endpoint.params.map((p) => (
                    <tr key={p.name}>
                      <td className="px-3 py-2 font-mono text-brand-400">{p.name}</td>
                      <td className="px-3 py-2 text-gray-500">{p.type}</td>
                      <td className="px-3 py-2 font-mono text-gray-500">{p.default || <span className="text-gray-700">—</span>}</td>
                      <td className="px-3 py-2 text-gray-400">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Example response */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Example Response</p>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto font-mono leading-relaxed">
              {endpoint.response}
            </pre>
          </div>

          {/* curl example */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">cURL Example</p>
            <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-400 overflow-x-auto font-mono">
{`curl -X ${endpoint.method} "${BASE_URL}${endpoint.path.replace(':stateCode', '27').replace(':districtCode', '572').replace(':subdistrictCode', '4341')}" \\
  -H "X-API-Key: vaip_your_api_key" \\
  -H "X-API-Secret: your_secret"`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiExplorer() {
  const [activeGroup, setActiveGroup] = useState('all');

  const groups = ['all', ...endpoints.map((e) => e.group)];
  const filtered = activeGroup === 'all' ? endpoints : endpoints.filter((e) => e.group === activeGroup);

  return (
    <Layout>
      <PageHeader
        title="API Reference"
        subtitle="Complete documentation for all endpoints"
        actions={
          <a
            href="https://docs.villageapi.in"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Full Docs
          </a>
        }
      />

      {/* Base URL + Auth info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="card-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Base URL</p>
          <code className="font-mono text-brand-400 text-sm">{BASE_URL}</code>
        </div>
        <div className="card-sm">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Authentication</p>
          <div className="flex flex-col gap-1 font-mono text-xs">
            <span className="text-gray-300">X-API-Key: <span className="text-brand-400">vaip_your_key</span></span>
            <span className="text-gray-300">X-API-Secret: <span className="text-amber-400">your_64_char_secret</span></span>
          </div>
        </div>
      </div>

      {/* Rate limits */}
      <div className="card mb-8">
        <p className="text-sm font-semibold text-gray-300 mb-4">Rate Limits by Plan</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { plan: 'FREE', limit: '1,000', color: 'text-gray-400' },
            { plan: 'PREMIUM', limit: '10,000', color: 'text-blue-400' },
            { plan: 'PRO', limit: '100,000', color: 'text-purple-400' },
            { plan: 'UNLIMITED', limit: '∞', color: 'text-amber-400' },
          ].map((t) => (
            <div key={t.plan} className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className={`text-lg font-bold font-mono ${t.color}`}>{t.limit}</p>
              <p className="text-xs text-gray-500 mt-1">req/day · {t.plan}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              activeGroup === g
                ? 'bg-brand-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        {filtered.map((group) => (
          <div key={group.group}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${groupColors[group.color]}`}>
                {group.group}
              </span>
              <span className="text-xs text-gray-600">{group.items.length} endpoints</span>
            </div>
            <div className="space-y-2">
              {group.items.map((ep) => (
                <EndpointCard key={ep.path + ep.method} endpoint={ep} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
