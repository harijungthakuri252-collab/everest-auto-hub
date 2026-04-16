import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiUser, FiSave, FiDollarSign } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user, login } = useAuth();
  const { currency, changeCurrency } = useCurrency();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      login(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pw.newPw.length < 6) return toast.error('New password must be at least 6 characters');
    if (pw.newPw !== pw.confirm) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await api.post('/auth/login', { email: user.email, password: pw.current });
      const { data } = await api.put('/auth/profile', { password: pw.newPw });
      login(data);
      toast.success('Password changed successfully!');
      setPw({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message === 'Invalid email or password'
        ? 'Current password is incorrect'
        : 'Failed to change password');
    }
    setPwLoading(false);
  };

  const PwField = ({ label, field, placeholder }) => (
    <div className="form-group">
      <label>{label}</label>
      <div className="pw-input-wrap">
        <input
          type={show[field] ? 'text' : 'password'}
          value={pw[field]}
          onChange={e => setPw(p => ({ ...p, [field]: e.target.value }))}
          placeholder={placeholder}
          required
          style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '11px 42px 11px 14px', borderRadius: 'var(--radius)', fontSize: '0.9rem', width: '100%', fontFamily: 'var(--font-body)' }}
        />
        <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
          style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {show[field] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-header">
        <h2>Account Settings</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

        {/* Profile Info */}

        {/* Profile Info */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1 }}>
            <FiUser /> Profile Info
          </h3>
          <div style={{ background: 'var(--dark-2)', borderRadius: 8, padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
              {user?.name?.[0]}
            </div>
            <div>
              <strong style={{ display: 'block' }}>{user?.name}</strong>
              <small style={{ color: 'var(--gray)' }}>{user?.email}</small>
            </div>
            <span className="badge" style={{ marginLeft: 'auto' }}>{user?.role}</span>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Display Name</label>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+61 4XX XXX XXX" />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={profileLoading}>
              <FiSave /> {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1 }}>
            <FiLock /> Change Password
          </h3>
          <form onSubmit={handlePasswordChange}>
            <PwField label="Current Password" field="current" placeholder="Enter current password" />
            <PwField label="New Password" field="newPw" placeholder="Min 6 characters" />
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Confirm New Password</label>
              <div className="pw-input-wrap" style={{ position: 'relative' }}>
                <input
                  type={show.confirm ? 'text' : 'password'}
                  value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password"
                  required
                  style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '11px 42px 11px 14px', borderRadius: 'var(--radius)', fontSize: '0.9rem', width: '100%', fontFamily: 'var(--font-body)' }}
                />
                <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                  style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {show.confirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {pw.newPw && pw.confirm && (
                <small style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, color: pw.newPw === pw.confirm ? '#2d6a4f' : 'var(--primary)', fontSize: '0.78rem' }}>
                  {pw.newPw === pw.confirm ? <><FiCheck size={12} /> Passwords match</> : '✗ Passwords do not match'}
                </small>
              )}
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={pwLoading}>
              <FiLock /> {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Currency Selector */}
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1 }}>
          <FiDollarSign /> Store Currency
        </h3>
        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Select the currency used across the entire website for all prices.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
          {CURRENCIES.map(c => (
            <button key={c.code} type="button"
              onClick={async () => {
                changeCurrency(c.code);
                toast.success(`Currency changed to ${c.name}`);
                // Save as global default to database
                try {
                  await api.put('/site-content', { defaultCurrency: c.code });
                } catch {}
              }}
              style={{
                background: currency.code === c.code ? 'rgba(249,115,22,0.15)' : 'var(--dark-2)',
                border: `2px solid ${currency.code === c.code ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 'var(--radius)',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'var(--transition)',
                textAlign: 'left',
              }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: currency.code === c.code ? 'var(--primary)' : 'var(--light)', minWidth: 28 }}>
                {c.symbol}
              </span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: currency.code === c.code ? 'var(--primary)' : 'var(--light)' }}>{c.code}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>{c.name}</div>
              </div>
              {currency.code === c.code && (
                <FiCheck size={16} color="var(--primary)" style={{ marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--gray)', fontSize: '0.78rem', marginTop: '1rem' }}>
          ⚠️ This changes the currency symbol only. Prices are stored as-is in the database.
        </p>
      </div>
    </div>
  );
}
