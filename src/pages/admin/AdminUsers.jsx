import { useEffect, useState } from 'react';
import { FiTrash2, FiDownload } from 'react-icons/fi';
import api from '../../utils/api';
import { exportCSV } from '../../utils/exportCSV';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const load = () => api.get('/admin/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('User deleted');
    load();
  };

  const handleExport = () => {
    const rows = users.map(u => ({
      'Name':       u.name,
      'Email':      u.email,
      'Phone':      u.phone || '',
      'Role':       u.role,
      'Verified':   u.isVerified ? 'Yes' : 'No',
      'Address':    u.address || '',
      'Joined':     new Date(u.createdAt).toLocaleDateString('en-AU'),
    }));
    exportCSV(rows, 'users');
    toast.success(`Exported ${rows.length} users to Excel`);
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Users</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{users.length} total users</span>
          <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
            <FiDownload size={14} /> Export Excel
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', background: u.role === 'admin' ? 'var(--primary)' : 'var(--dark-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {u.name[0]}
                    </div>
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td><span className={`badge ${u.role === 'admin' ? '' : 'badge-info'}`}>{u.role}</span></td>
                <td><small>{new Date(u.createdAt).toLocaleDateString()}</small></td>
                <td>
                  {u.role !== 'admin' && (
                    <button className="btn-delete" onClick={() => handleDelete(u._id)}><FiTrash2 /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
