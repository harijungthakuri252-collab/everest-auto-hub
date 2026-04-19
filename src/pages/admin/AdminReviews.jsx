import { useEffect, useState } from 'react';
import { FiStar, FiTrash2, FiCheck, FiX, FiFilter } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={13}
          fill={i <= rating ? '#ffd60a' : 'none'}
          color={i <= rating ? '#ffd60a' : '#555'} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all'); // all | pending | approved | product | general

  const load = () => api.get('/reviews/all').then(r => setReviews(r.data));
  useEffect(() => { load(); }, []);

  const toggleApprove = async (id, current) => {
    await api.put(`/reviews/${id}`, { isApproved: !current });
    toast.success(current ? 'Review hidden' : 'Review approved — product rating updated');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review? This will update the product rating.')) return;
    await api.delete(`/reviews/${id}`);
    toast.success('Deleted');
    load();
  };

  const filtered = reviews.filter(r => {
    if (filter === 'pending')  return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    if (filter === 'product')  return r.type === 'product';
    if (filter === 'general')  return r.type !== 'product';
    return true;
  });

  const pending = reviews.filter(r => !r.isApproved).length;

  return (
    <div>
      <div className="admin-header">
        <h2>Reviews</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {['all','pending','approved','product','general'].map(f => (
            <button key={f} className={`cat-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pending > 0 && (
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: '0.7rem', marginLeft: 5 }}>{pending}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Product</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r._id}>
                <td>
                  <strong>{r.name}</strong><br />
                  <small style={{ color: 'var(--gray)' }}>{new Date(r.createdAt).toLocaleDateString('en-AU')}</small>
                </td>
                <td>
                  <Stars rating={r.rating} />
                  <small style={{ color: 'var(--gray)', fontSize: '0.72rem' }}>{r.rating}/5</small>
                </td>
                <td style={{ maxWidth: 260 }}>
                  {r.title && <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: 3 }}>{r.title}</strong>}
                  <small style={{ color: 'var(--gray)', lineHeight: 1.5 }}>
                    {r.comment?.length > 120 ? r.comment.slice(0, 120) + '...' : r.comment}
                  </small>
                  {r.helpful > 0 && (
                    <small style={{ display: 'block', color: '#4cc9f0', marginTop: 3 }}>👍 {r.helpful} found helpful</small>
                  )}
                </td>
                <td>
                  {r.product ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                      {r.product?.name || 'Product'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>General</span>
                  )}
                </td>
                <td>
                  {r.verified
                    ? <span style={{ color: '#2d6a4f', fontSize: '0.78rem', fontWeight: 600 }}>✅ Verified</span>
                    : <span style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>—</span>}
                </td>
                <td>
                  <span className={`badge ${r.isApproved ? 'badge-success' : 'badge-warning'}`}>
                    {r.isApproved ? 'Live' : 'Pending'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className={r.isApproved ? 'btn-delete' : 'btn-edit'}
                      onClick={() => toggleApprove(r._id, r.isApproved)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {r.isApproved ? <><FiX size={13} /> Hide</> : <><FiCheck size={13} /> Approve</>}
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(r._id)}><FiTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
            No {filter !== 'all' ? filter : ''} reviews found
          </p>
        )}
      </div>
    </div>
  );
}
