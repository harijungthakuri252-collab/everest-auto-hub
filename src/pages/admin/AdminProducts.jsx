import { useEffect, useState, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminProducts.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const CATEGORIES = ['T-Shirts', 'Hoodies', 'Caps', 'Jackets', 'Accessories'];

const emptyForm = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'T-Shirts', sizes: [], colors: '', stock: '',
  isFeatured: false, isActive: true, images: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileRef = useRef();

  const load = () => api.get('/products').then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setPreviewImages([]);
    setEditing(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, price: p.price,
      originalPrice: p.originalPrice || '', category: p.category,
      sizes: p.sizes || [], colors: (p.colors || []).join(', '),
      stock: p.stock, isFeatured: p.isFeatured, isActive: p.isActive,
      images: p.images || [],
    });
    setPreviewImages(p.images || []);
    setEditing(p._id);
    setModal(true);
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const data = new FormData();
        data.append('image', file);
        const res = await api.post('/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(res.data.url);
      }
      const newImages = [...(form.images || []), ...uploaded];
      setForm(f => ({ ...f, images: newImages }));
      setPreviewImages(newImages);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    }
    setUploading(false);
  };

  const removeImage = (idx) => {
    const updated = form.images.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, images: updated }));
    setPreviewImages(updated);
  };

  const toggleSize = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      colors: form.colors.split(',').map(c => c.trim()).filter(Boolean),
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
    };
    try {
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <div className="admin-header">
        <h2>Products</h2>
        <button className="btn-primary" onClick={openAdd}><FiPlus /> Add Product</button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Sizes</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <div className="product-thumb">
                    {p.images?.[0]
                      ? <img src={p.images[0].startsWith('http') ? p.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.images[0]}`} alt={p.name} />
                      : <FiImage size={24} color="var(--gray)" />
                    }
                  </div>
                </td>
                <td>
                  <strong>{p.name}</strong>
                  {p.isFeatured && <span className="badge" style={{ marginLeft: 8, fontSize: '0.65rem' }}>Featured</span>}
                </td>
                <td>{p.category}</td>
                <td>A$ {p.price.toLocaleString()}</td>
                <td>
                  <div className="size-tags-row">
                    {p.sizes?.map(s => <span key={s} className="size-tag-sm">{s}</span>)}
                  </div>
                </td>
                <td>{p.stock}</td>
                <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => openEdit(p)}><FiEdit2 /></button>
                    <button className="btn-delete" onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No products yet</p>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-wide">
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div className="upload-section">
                <label className="upload-label">Product Images</label>
                <div className="image-preview-grid">
                  {previewImages.map((img, i) => (
                    <div key={i} className="preview-img-wrap">
                      <img src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`} alt="" />
                      <button type="button" className="remove-img-btn" onClick={() => removeImage(i)}><FiX /></button>
                    </div>
                  ))}
                  <button type="button" className="upload-box" onClick={() => fileRef.current.click()} disabled={uploading}>
                    {uploading ? <span>Uploading...</span> : <><FiUpload size={24} /><span>Upload Images</span></>}
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
                <small style={{ color: 'var(--gray)' }}>Max 5MB per image. JPG, PNG, WebP supported.</small>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Product Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Everest Classic Tee" required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (A$)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" required />
                </div>
                <div className="form-group">
                  <label>Original Price (A$) — for sale</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="Leave blank if no sale" />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                </div>
                <div className="form-group">
                  <label>Colors (comma separated)</label>
                  <input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Black, White, Red" />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the product..." required />
              </div>

              {/* Size Selector */}
              <div className="form-group">
                <label>Available Sizes <small style={{ color: 'var(--gray)' }}>(click to toggle)</small></label>
                <div className="size-selector">
                  {SIZES.map(s => (
                    <button type="button" key={s}
                      className={`size-toggle-btn ${form.sizes.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                {form.sizes.length > 0 && (
                  <small style={{ color: 'var(--primary)', marginTop: 6, display: 'block' }}>
                    Selected: {form.sizes.join(', ')}
                  </small>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Featured on Homepage</label>
                  <select value={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.value === 'true' })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                {editing ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
