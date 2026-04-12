import { useEffect, useState } from 'react';
import { FiStar, FiTrash2, FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const load = () => api.get('/reviews/all').then(r => setReviews(r.data));
  useEffect(() => { load(); }, []);

  const toggleApprove = async (id, current) => {
    await api.put(`/reviews/${id}`, { isApproved: !current });
    toast.success(current ? 'Review hidden' : 'Review approved');
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Reviews</h2>
        <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{reviews.length} total reviews</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Customer</th><th>Rating</th><th>Comment</th><th>Type</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r._id}>
                <td>
                  <strong>{r.name}</strong><br />
                  <small style={{ color: 'var(--gray)' }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={14} fill={i < r.rating ? '#ffd60a' : 'none'} color={i < r.rating ? '#ffd60a' : '#555'} />
                    ))}
                  </div>
                </td>
                <td style={{ maxWidth: '250px' }}><small>{r.comment}</small></td>
                <td><span className="badge badge-info">{r.type}</span></td>
                <td><span className={`badge ${r.isApproved ? 'badge-success' : 'badge-warning'}`}>{r.isApproved ? 'Approved' : 'Pending'}</span></td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => toggleApprove(r._id, r.isApproved)}>
                      <FiCheck /> {r.isApproved ? 'Hide' : 'Approve'}
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(r._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No reviews yet</p>}
      </div>
    </div>
  );
}
