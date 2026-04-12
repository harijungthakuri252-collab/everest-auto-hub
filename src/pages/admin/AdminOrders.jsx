import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import api from '../../utils/api';
import { exportCSV } from '../../utils/exportCSV';
import toast from 'react-hot-toast';
import './AdminOrders.css';

const statusColors = {
  pending: 'badge-warning',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const load = () => api.get('/orders').then(r => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}`, { status });
    toast.success('Status updated');
    load();
  };

  const handleExport = () => {
    const rows = filtered.map(o => ({
      'Order ID':       o._id.slice(-8),
      'Customer Name':  o.user?.name || o.shippingAddress?.name || '',
      'Customer Email': o.user?.email || '',
      'Phone':          o.shippingAddress?.phone || '',
      'City':           o.shippingAddress?.city || '',
      'Address':        o.shippingAddress?.address || '',
      'Postal Code':    o.shippingAddress?.postalCode || '',
      'Items':          o.items?.map(i => `${i.name} x${i.quantity}`).join(' | '),
      'Total (AUD)':    o.totalPrice,
      'Payment':        o.paymentMethod || 'COD',
      'Status':         o.status,
      'Date':           new Date(o.createdAt).toLocaleDateString('en-AU'),
    }));
    exportCSV(rows, 'orders');
    toast.success(`Exported ${rows.length} orders to Excel`);
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Orders</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} className={`cat-btn ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
            <FiDownload size={14} /> Export Excel
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <>
                <tr key={o._id}>
                  <td>
                    <button className="order-expand-btn" onClick={() => toggleExpand(o._id)}>
                      {expanded === o._id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                    <small style={{ color: 'var(--gray)', fontFamily: 'monospace' }}>
                      #{o._id.slice(-8)}
                    </small>
                  </td>
                  <td>
                    <strong>{o.user?.name || o.shippingAddress?.name}</strong><br />
                    <small style={{ color: 'var(--gray)' }}>{o.shippingAddress?.phone}</small><br />
                    <small style={{ color: 'var(--gray)' }}>{o.shippingAddress?.city}</small>
                  </td>
                  <td>
                    <span className="items-summary">
                      {o.items?.length} item{o.items?.length !== 1 ? 's' : ''}
                    </span>
                    <div className="items-preview">
                      {o.items?.slice(0, 2).map((item, i) => (
                        <span key={i} className="item-chip">
                          {item.name}
                          {item.size && <strong> · {item.size}</strong>}
                          {item.color && <span style={{ color: 'var(--gray)' }}> · {item.color}</span>}
                          {item.quantity > 1 && <span> ×{item.quantity}</span>}
                        </span>
                      ))}
                      {o.items?.length > 2 && (
                        <span className="item-chip" style={{ color: 'var(--gray)' }}>
                          +{o.items.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    A$ {o.totalPrice?.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${statusColors[o.status]}`}>{o.status}</span>
                  </td>
                  <td>
                    <small>{new Date(o.createdAt).toLocaleDateString('en-AU')}</small>
                  </td>
                  <td>
                    <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                      style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '5px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>

                {/* Expanded order details */}
                {expanded === o._id && (
                  <tr key={`${o._id}-detail`} className="order-detail-row">
                    <td colSpan={7}>
                      <div className="order-detail-box">
                        <div className="order-detail-grid">
                          {/* Items breakdown */}
                          <div className="order-items-list">
                            <h4>Order Items</h4>
                            {o.items?.map((item, i) => (
                              <div key={i} className="order-item-row">
                                <div className="order-item-img">
                                  {getImageUrl(item.image)
                                    ? <img src={getImageUrl(item.image)} alt={item.name} />
                                    : <span>👕</span>
                                  }
                                </div>
                                <div className="order-item-info">
                                  <strong>{item.name}</strong>
                                  <div className="order-item-meta">
                                    {item.size && (
                                      <span className="meta-tag size-meta">Size: <strong>{item.size}</strong></span>
                                    )}
                                    {item.color && (
                                      <span className="meta-tag color-meta">Color: <strong>{item.color}</strong></span>
                                    )}
                                    <span className="meta-tag qty-meta">Qty: <strong>{item.quantity}</strong></span>
                                  </div>
                                </div>
                                <div className="order-item-price">
                                  A$ {(item.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping info */}
                          <div className="order-shipping-info">
                            <h4>Shipping Address</h4>
                            <p><strong>{o.shippingAddress?.name}</strong></p>
                            <p>{o.shippingAddress?.phone}</p>
                            <p>{o.shippingAddress?.address}</p>
                            <p>{o.shippingAddress?.city} {o.shippingAddress?.postalCode}</p>
                            <div className="order-payment">
                              <h4 style={{ marginTop: '1rem' }}>Payment</h4>
                              <p>{o.paymentMethod || 'COD'}</p>
                              <p className="order-total-line">Total: <strong>A$ {o.totalPrice?.toLocaleString()}</strong></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No orders found</p>
        )}
      </div>
    </div>
  );
}
