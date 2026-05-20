import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import Layout, { PageHeader } from '../../components/layout/Layout';
import Table, { Pagination } from '../../components/ui/Table';
import { PlanBadge, StatusBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { formatDate, formatNumber } from '../../utils/helpers';
import { useToast } from '../../components/ui/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page: p, limit: 20 });
      setUsers(res.data.data || []);
      setTotal(res.data.meta?.total || 0);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateUser(editUser.id, {
        planType: editUser.planType,
        role: editUser.role,
        isActive: editUser.isActive,
      });
      setEditUser(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update user.');
    }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (u) => <span className="font-medium text-gray-200">{u.name}</span> },
    { key: 'email', label: 'Email', render: (u) => <span className="text-gray-400 text-xs font-mono">{u.email}</span> },
    { key: 'planType', label: 'Plan', render: (u) => <PlanBadge plan={u.planType} /> },
    { key: 'isActive', label: 'Status', render: (u) => <StatusBadge active={u.isActive} /> },
    { key: 'apiKeys', label: 'API Keys', render: (u) => <span className="text-gray-400">{u._count?.apiKeys || 0}</span> },
    { key: 'createdAt', label: 'Joined', render: (u) => <span className="text-gray-500 text-xs">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions', label: '', render: (u) => (
        <button onClick={() => setEditUser({ ...u })} className="text-xs text-brand-400 hover:text-brand-300">
          Edit
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <PageHeader title="Users" subtitle={`${formatNumber(total)} registered accounts`} />

      <Table columns={columns} data={users} loading={loading} emptyMessage="No users found" />
      <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-200">{editUser.name}</p>
              <p className="text-xs text-gray-500">{editUser.email}</p>
            </div>
            <Select
              label="Plan"
              value={editUser.planType}
              onChange={(e) => setEditUser({ ...editUser, planType: e.target.value })}
            >
              {['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'].map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select
              label="Role"
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
            >
              <option value="CLIENT">CLIENT</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
            <Select
              label="Status"
              value={editUser.isActive.toString()}
              onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === 'true' })}
            >
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </Select>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button loading={saving} onClick={handleSave}>Save changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
