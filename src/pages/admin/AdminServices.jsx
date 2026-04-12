import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import api from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import toast from 'react-hot-toast';

const empty = { name: '', description: '', price: '', duration: '', isActive: true, image: '' };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const fileRef = useRef();
  const { formatPrice } = useCurrency();

  const load = () => api.get('/services/all').then(r => setServices(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setPreview(''); setEditing(null); setModal(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, description: s.description, price: s.price, duration: s.duration || '', isActive: s.isActive, image: s.image || '' });
    setPreview(s.image || '');
    setEditing(s._id);
    setModal(true);
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image: res.data.url }));
      setPreview(res.data.url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/services/${editing}`, form);
        toast.success('Service updated');
      } else {
        await api.post('/services', form);
        toast.success('Service created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    await api.delete(`/services/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Services</h2>
        <button className="btn-primary" onClick={openAdd}><FiPlus /> Add Service</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s._id}>
                <td>
                  <div className="product-thumb">
                    {getImageUrl(s.image)
                      ? <img src={getImageUrl(s.image)} alt={s.name} />
                      : <FiImage size={22} color="var(--gray)" />
                    }
                  </div>
                </td>
                <td>
                  <strong>{s.name}</strong>
                  <br /><small style={{ color: 'var(--gray)' }}>{s.description.slice(0, 50)}...</small>
                </td>
                <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(s.price)}</td>
                <td>{s.duration || '—'}</td>
                <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => openEdit(s)}><FiEdit2 /></button>
                    <button className="btn-delete" onClick={() => handleDelete(s._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No services yet</p>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>

              {/* Image Upload */}
              <div className="form-group">
                <label>Service Image</label>
                <div className="service-img-upload">
                  {preview ? (
                    <div className="service-img-preview">
                      <img src={getImageUrl(preview)} alt="preview" />
                      <button type="button" className="remove-img-btn" onClick={() => { setPreview(''); setForm(f => ({ ...f, image: '' })); }}>
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="upload-box" onClick={() => fileRef.current.click()} disabled={uploading}>
                      <FiUpload size={22} />
                      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </div>

              <div className="form-group">
                <label>Service Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Oil Change" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 1-2 hours" />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                {editing ? 'Update Service' : 'Create Service'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
