import { useState, useEffect, useRef } from 'react';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiPackage,
  FiCalendar, FiEdit2, FiSave, FiLock, FiEye, FiEyeOff,
  FiCheck, FiCamera, FiX
} from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import './Profile.css';

const TABS = ['Overview', 'My Orders', 'My Appointments', 'Security'];

export default function Profile() {
  const { user, login } = useAuth();
  const { formatPrice } = useCurrency();
  const [tab, setTab] = useState('Overview');
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef();

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).catch(() => {});
    api.get('/appointments/my').then(r => setAppointments(r.data)).catch(() => {});
  }, []);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
  };

  // Avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data: updated } = await api.put('/auth/profile', { avatar: res.data.url });
      login(updated);
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Upload failed');
    }
    setAvatarUploading(false);
  };

  // Profile save
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      login(data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await api.post('/auth/login', { email: user.email, password: pwForm.currentPassword });
      const { data } = await api.put('/auth/profile', { password: pwForm.newPassword });
      login(data);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message === 'Invalid email or password'
        ? 'Current password is incorrect' : 'Failed to change password');
    }
    setPwLoading(false);
  };

  const statusColor = { pending: '#e9c46a', confirmed: '#4cc9f0', completed: '#2d6a4f', cancelled: '#e63946', processing: '#4cc9f0', shipped: '#4361ee', delivered: '#2d6a4f' };

  return (
    <div className="profile-page">
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="profile-layout">

          {/* Left — Profile Card */}
          <aside className="profile-sidebar">
            {/* Avatar */}
            <div className="avatar-section">
              <div className="avatar-wrap">
                {getImageUrl(user?.avatar) ? (
                  <img src={getImageUrl(user.avatar)} alt={user.name} className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
                )}
                <button className="avatar-edit-btn" onClick={() => fileRef.current.click()} disabled={avatarUploading} title="Change photo">
                  {avatarUploading ? '...' : <FiCamera size={14} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
              </div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email"><FiMail size={13} /> {user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? '' : 'badge-info'}`}>{user?.role}</span>
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="pstat">
                <span>{orders.length}</span>
                <small>Orders</small>
              </div>
              <div className="pstat">
                <span>{appointments.length}</span>
                <small>Appointments</small>
              </div>
            </div>

            {/* Info */}
            <div className="profile-info-list">
              {user?.phone && <p><FiPhone size={13} /> {user.phone}</p>}
              {user?.address && <p><FiMapPin size={13} /> {user.address}</p>}
            </div>

            {/* Tab nav */}
            <nav className="profile-nav">
              {TABS.map(t => (
                <button key={t} className={`profile-nav-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'Overview' && <FiUser size={14} />}
                  {t === 'My Orders' && <FiPackage size={14} />}
                  {t === 'My Appointments' && <FiCalendar size={14} />}
                  {t === 'Security' && <FiLock size={14} />}
                  {t}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right — Tab Content */}
          <main className="profile-main">

            {/* OVERVIEW TAB */}
            {tab === 'Overview' && (
              <div className="profile-card card">
                <div className="card-header-row">
                  <h3>Personal Information</h3>
                  {!editing && (
                    <button className="btn-outline" style={{ padding: '7px 16px', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
                      <FiEdit2 size={13} /> Edit
                    </button>
                  )}
                </div>
                {!editing ? (
                  <div className="info-grid">
                    <div className="info-item"><label>Full Name</label><span>{user?.name}</span></div>
                    <div className="info-item"><label>Email</label><span>{user?.email}</span></div>
                    <div className="info-item"><label>Phone</label><span>{user?.phone || '—'}</span></div>
                    <div className="info-item"><label>Address</label><span>{user?.address || '—'}</span></div>
                    <div className="info-item"><label>Member Since</label><span>{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}</span></div>
                    <div className="info-item"><label>Account Type</label><span style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
                  </div>
                ) : (
                  <form onSubmit={handleSave}>
                    <div className="grid-2">
                      <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                      <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+61 4XX XXX XXX" /></div>
                      <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn-primary" disabled={loading}><FiSave size={14} /> {loading ? 'Saving...' : 'Save Changes'}</button>
                      <button type="button" className="btn-outline" onClick={() => setEditing(false)}><FiX size={14} /> Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {tab === 'My Orders' && (
              <div>
                <h3 className="tab-title"><FiPackage /> My Orders ({orders.length})</h3>
                {orders.length === 0 ? (
                  <div className="empty-tab card">
                    <FiPackage size={40} />
                    <p>No orders yet</p>
                    <a href="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>Browse Shop</a>
                  </div>
                ) : orders.map(o => (
                  <div key={o._id} className="activity-card card">
                    <div className="activity-header">
                      <span className="activity-id">Order #{o._id.slice(-8)}</span>
                      <span className="activity-date">{new Date(o.createdAt).toLocaleDateString('en-AU')}</span>
                      <span className="badge" style={{ background: statusColor[o.status] || 'var(--gray)' }}>{o.status}</span>
                    </div>

                    {/* Order status timeline */}
                    {o.status !== 'cancelled' && (
                      <div className="order-timeline">
                        {['pending','processing','shipped','delivered'].map((s, i) => {
                          const steps = ['pending','processing','shipped','delivered'];
                          const currentIdx = steps.indexOf(o.status);
                          const isDone = i <= currentIdx;
                          const icons = ['🕐','⚙️','🚚','✅'];
                          return (
                            <div key={s} className={`timeline-step ${isDone ? 'done' : ''}`}>
                              <div className="timeline-dot">{icons[i]}</div>
                              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                              {i < 3 && <div className={`timeline-line ${isDone && i < currentIdx ? 'done' : ''}`} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {o.status === 'cancelled' && (
                      <div style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: '0.85rem', color: '#e63946' }}>
                        ❌ This order was cancelled
                      </div>
                    )}

                    <div className="order-items-list">
                      {o.items?.map((item, i) => (
                        <div key={i} className="order-item-row">
                          <div className="oi-img">
                            {getImageUrl(item.image) ? <img src={getImageUrl(item.image)} alt={item.name} /> : <span>👕</span>}
                          </div>
                          <div className="oi-info">
                            <strong>{item.name}</strong>
                            <span>
                              {item.size && `Size: ${item.size}`}
                              {item.color && ` · ${item.color}`}
                              {` · Qty: ${item.quantity}`}
                            </span>
                          </div>
                          <span className="oi-price">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="activity-footer">
                      <span>Total: <strong style={{ color: 'var(--primary)' }}>{formatPrice(o.totalPrice)}</strong></span>
                      <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{o.paymentMethod || 'COD'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {tab === 'My Appointments' && (
              <div>
                <h3 className="tab-title"><FiCalendar /> My Appointments ({appointments.length})</h3>
                {appointments.length === 0 ? (
                  <div className="empty-tab card">
                    <FiCalendar size={40} />
                    <p>No appointments booked yet</p>
                    <a href="/appointment" className="btn-primary" style={{ marginTop: '1rem' }}>Book Appointment</a>
                  </div>
                ) : appointments.map(a => (
                  <div key={a._id} className="activity-card card">
                    <div className="activity-header">
                      <span className="activity-id">#{a._id.slice(-8)}</span>
                      <span className="activity-date">{new Date(a.date).toLocaleDateString('en-AU')}</span>
                      <span className="badge" style={{ background: statusColor[a.status] || 'var(--gray)' }}>{a.status}</span>
                      {/* Cancel button — only for pending/confirmed */}
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <button
                          style={{ marginLeft: 'auto', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}
                          onClick={async () => {
                            if (!confirm('Cancel this appointment?')) return;
                            try {
                              await api.put(`/appointments/cancel/${a._id}`);
                              toast.success('Appointment cancelled');
                              setAppointments(prev => prev.map(x => x._id === a._id ? { ...x, status: 'cancelled' } : x));
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Cannot cancel');
                            }
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <div className="appt-detail-grid">
                      <div className="appt-detail-item">
                        <label>Service</label>
                        <span>{a.service?.name || 'N/A'}</span>
                      </div>
                      <div className="appt-detail-item">
                        <label>Vehicle</label>
                        <span>{a.vehicle}</span>
                      </div>
                      <div className="appt-detail-item">
                        <label>Time Slot</label>
                        <span>{a.timeSlot}</span>
                      </div>
                      <div className="appt-detail-item">
                        <label>Price</label>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(a.service?.price)}</span>
                      </div>
                    </div>
                    {a.message && <p className="appt-note">📝 {a.message}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* SECURITY TAB */}
            {tab === 'Security' && (
              <div className="profile-card card">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  {[
                    { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                    { key: 'newPassword', label: 'New Password', placeholder: 'Min 8 chars, include a number' },
                    { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                  ].map(({ key, label, placeholder }) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <div className="pw-input-wrap">
                        <input
                          type={showPw[key] ? 'text' : 'password'}
                          value={pwForm[key]}
                          onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          required
                        />
                        <button type="button" className="pw-toggle" onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}>
                          {showPw[key] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwForm.newPassword && pwForm.confirmPassword && (
                    <small className={pwForm.newPassword === pwForm.confirmPassword ? 'pw-match' : 'pw-no-match'}>
                      {pwForm.newPassword === pwForm.confirmPassword
                        ? <><FiCheck size={12} /> Passwords match</>
                        : '✗ Passwords do not match'}
                    </small>
                  )}
                  <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} disabled={pwLoading}>
                    <FiLock size={14} /> {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
