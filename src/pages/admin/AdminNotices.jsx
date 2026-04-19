import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiImage, FiToggleLeft, FiToggleRight, FiBell } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgUrl = (img) => img?.startsWith('/uploads') ? `${IMG_BASE}${img}` : img || null;

const TYPE_STYLES = {
  info:    { bg: 'rgba(76,201,240,0.12)',  border: 'rgba(76,201,240,0.35)',  label: '📢 Info',    color: '#4cc9f0' },
  offer:   { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.35)',  label: '🎁 Offer',   color: '#f97316' },
  warning: { bg: 'rgba(233,196,106,0.12)', border: 'rgba(233,196,106,0.35)', label: '⚠️ Warning', color: '#e9c46a' },
  event:   { bg: 'rgba(45,106,79,0.15)',   border: 'rgba(45,106,79,0.4)',    label: '🎉 Event',   color: '#2d6a4f' },
};

const EMPTY = { title: '', message: '', image: '', type: 'info', isActive: true, expiresAt: '' };

export default function AdminNotices() {
  const [notices, setNotices]   = useState([]);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null); // null = new
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const load = () => api.get('/notices').then(r => setNotices(r.data));
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (n) => {
    setEditing(n._id);
    setForm({
      title: n.title, message: n.message || '', image: n.image || '',
      type: n.type, isActive: n.isActive,
      expiresAt: n.expiresAt ? new Date(n.expiresAt).toISOString().slice(0, 16) : '',
    });
    setModal(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      const payload = { ...form, expiresAt: form.expiresAt || null };
      if (editing) {
        await api.put(`/notices/${editing}`, payload);
        toast.success('Notice updated');
      } else {
        await api.post('/notices', payload);
        toast.success('Notice published!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    await api.delete(`/notices/${id}`);
    toast.success('Deleted');
    load();
  };

  const toggleActive = async (n) => {
    await api.put(`/notices/${n._id}`, { ...n, isActive: !n.isActive });
    load();
  };

  const inputStyle = {
    background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--light)', padding: '10px 14px', borderRadius: 'var(--radius)',
    fontSize: '0.88rem', width: '100%', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  };

  return (
    <div>
      <div className="admin-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FiBell /> Notices & Offers</h2>
        <button className="btn-primary" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiPlus /> New Notice
        </button>
      </div>

      {notices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray)' }}>
          <FiBell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No notices yet. Create one to show a popup to all visitors.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notices.map(n => {
          const ts = TYPE_STYLES[n.type] || TYPE_STYLES.info;
          const expired = n.expiresAt && new Date(n.expiresAt) < new Date();
          return (
            <div key={n._id} style={{ background: 'var(--dark-3)', border: `1px solid ${ts.border}`, borderRadius: 'var(--radius)', padding: '1.2rem 1.4rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* Image preview */}
              {imgUrl(n.image) && (
                <img src={imgUrl(n.image)} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{ts.label}</span>
                  <span style={{ fontSize: '0.72rem', background: n.isActive && !expired ? 'rgba(45,106,79,0.2)' : 'rgba(255,255,255,0.05)', color: n.isActive && !expired ? '#2d6a4f' : 'var(--gray)', border: `1px solid ${n.isActive && !expired ? 'rgba(45,106,79,0.4)' : 'rgba(255,255,255,0.1)'}`, padding: '2px 8px', borderRadius: 20 }}>
                    {expired ? '⏰ Expired' : n.isActive ? '✅ Active' : '⏸ Paused'}
                  </span>
                  {n.expiresAt && !expired && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray)' }}>Expires {new Date(n.expiresAt).toLocaleDateString('en-AU')}</span>
                  )}
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--light)' }}>{n.title}</h4>
                {n.message && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray)', whiteSpace: 'pre-wrap' }}>{n.message}</p>}
                <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: '#555' }}>Created {new Date(n.createdAt).toLocaleDateString('en-AU')}</p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => toggleActive(n)} title={n.isActive ? 'Pause' : 'Activate'}
                  style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: n.isActive ? '#2d6a4f' : 'var(--gray)', padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {n.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                </button>
                <button onClick={() => openEdit(n)}
                  style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <FiEdit2 size={15} />
                </button>
                <button onClick={() => handleDelete(n._id)}
                  style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Notice' : 'New Notice / Offer'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>

            {/* Type selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
              {Object.entries(TYPE_STYLES).map(([key, ts]) => (
                <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type: key }))}
                  style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${form.type === key ? ts.color : 'rgba(255,255,255,0.1)'}`, background: form.type === key ? ts.bg : 'var(--dark-2)', color: form.type === key ? ts.color : 'var(--gray)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}>
                  {ts.label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', color: 'var(--gray)', display: 'block', marginBottom: 5 }}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="e.g. 20% Off All Services This Weekend!" />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', color: 'var(--gray)', display: 'block', marginBottom: 5 }}>Message (optional)</label>
              <RichTextEditor
                value={form.message}
                onChange={(val) => setForm(f => ({ ...f, message: val }))}
                placeholder="Add more details about this notice..."
              />
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label style={{ fontSize: '0.82rem', color: 'var(--gray)', display: 'block', marginBottom: 5 }}>Image / Banner (optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {imgUrl(form.image) ? (
                  <div style={{ position: 'relative', width: 100, height: 65, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <img src={imgUrl(form.image)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                      <FiX size={11} />
                    </button>
                  </div>
                ) : (
                  <div style={{ width: 100, height: 65, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', flexShrink: 0 }}>
                    <FiImage size={22} />
                  </div>
                )}
                <button type="button" onClick={() => fileRef.current.click()}
                  style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.82rem' }}>
                  {uploading ? 'Uploading...' : form.image ? 'Change Image' : 'Upload Image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.82rem', color: 'var(--gray)', display: 'block', marginBottom: 5 }}>Expiry Date & Time (optional)</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} style={inputStyle} />
              <small style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>Leave empty to show indefinitely</small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', color: 'var(--light)' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                Publish immediately (show to all visitors)
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>
                {saving ? 'Saving...' : editing ? 'Update Notice' : '📢 Publish Notice'}
              </button>
              <button onClick={() => setModal(false)}
                style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--gray)', padding: '11px 18px', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
