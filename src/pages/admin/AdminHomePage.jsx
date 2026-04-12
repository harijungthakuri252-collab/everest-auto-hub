import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSave, FiImage, FiX, FiHome } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

import { getImageUrl } from '../../utils/imageUrl';

const imgUrl = (img) => getImageUrl(img);

// ── Stable image uploader ────────────────────────────────────────────────────
function ImageUploader({ label, fieldKey, value, onUpload, onClear }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpload(fieldKey, data.url);
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      toast.error('Upload failed');
    }
    setUploading(false);
    // reset so same file can be re-selected
    e.target.value = '';
  };

  const preview = getImageUrl(value);

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--gray)', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {preview ? (
          <div style={{ position: 'relative', width: 90, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => onClear(fieldKey)}
              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            >
              <FiX size={11} />
            </button>
          </div>
        ) : (
          <div style={{ width: 90, height: 60, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', flexShrink: 0 }}>
            <FiImage size={20} />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.82rem' }}
        >
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Stable text field ────────────────────────────────────────────────────────
function Field({ label, fieldKey, value, onFieldChange, multiline }) {
  const inputStyle = {
    background: 'var(--dark-2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--light)',
    padding: '10px 14px',
    borderRadius: 'var(--radius)',
    fontSize: '0.88rem',
    width: '100%',
    fontFamily: 'var(--font-body)',
    resize: multiline ? 'vertical' : 'none',
    boxSizing: 'border-box',
  };

  const handleChange = (e) => onFieldChange(fieldKey, e.target.value);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--gray)', marginBottom: 5 }}>
        {label}
      </label>
      {multiline
        ? <textarea rows={3} value={value || ''} onChange={handleChange} style={inputStyle} />
        : <input type="text" value={value || ''} onChange={handleChange} style={inputStyle} />
      }
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: '1.8rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1.4rem' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AdminHomePage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/home-content')
      .then(r => setForm(r.data))
      .catch(err => {
        console.error('Load error:', err.response?.data || err.message);
        toast.error('Failed to load content');
      });
  }, []);

  // Stable callbacks — won't cause child re-mounts
  const handleFieldChange = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleUpload = useCallback((key, url) => {
    setForm(prev => ({ ...prev, [key]: url }));
  }, []);

  const handleClear = useCallback((key) => {
    setForm(prev => ({ ...prev, [key]: '' }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/home-content', form);
      setForm(data);
      toast.success('Home page content saved!');
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  if (!form) return (
    <div style={{ padding: '2rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="spinner" /> Loading content...
    </div>
  );

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiHome /> Home Page Content
        </h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiSave /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Hero */}
      <Section title="🚀 Hero Section">
        <Field label="Badge Text" fieldKey="heroBadge" value={form.heroBadge} onFieldChange={handleFieldChange} />
        <Field label="Subtitle" fieldKey="heroSubtitle" value={form.heroSubtitle} onFieldChange={handleFieldChange} multiline />
        <ImageUploader label="Hero Background Image" fieldKey="heroImage" value={form.heroImage} onUpload={handleUpload} onClear={handleClear} />
      </Section>

      {/* Services */}
      <Section title="🔧 Services Section">
        <Field label="Tag (small label above title)" fieldKey="servicesSectionTag" value={form.servicesSectionTag} onFieldChange={handleFieldChange} />
        <Field label="Title" fieldKey="servicesSectionTitle" value={form.servicesSectionTitle} onFieldChange={handleFieldChange} />
        <Field label="Subtitle" fieldKey="servicesSectionSubtitle" value={form.servicesSectionSubtitle} onFieldChange={handleFieldChange} multiline />
      </Section>

      {/* Why Us */}
      <Section title="✅ Why Choose Us Section">
        <Field label="Title" fieldKey="whyTitle" value={form.whyTitle} onFieldChange={handleFieldChange} />
        <Field label="Description" fieldKey="whySubtitle" value={form.whySubtitle} onFieldChange={handleFieldChange} multiline />
        <ImageUploader label="Workshop Image" fieldKey="whyImage" value={form.whyImage} onUpload={handleUpload} onClear={handleClear} />
      </Section>

      {/* Shop Banner */}
      <Section title="🛍️ Shop Banner Section">
        <Field label="Tag (small label above title)" fieldKey="shopBannerTag" value={form.shopBannerTag} onFieldChange={handleFieldChange} />
        <Field label="Title" fieldKey="shopBannerTitle" value={form.shopBannerTitle} onFieldChange={handleFieldChange} />
        <Field label="Description" fieldKey="shopBannerSubtitle" value={form.shopBannerSubtitle} onFieldChange={handleFieldChange} multiline />
        <ImageUploader label="Banner Background Image" fieldKey="shopBannerImage" value={form.shopBannerImage} onUpload={handleUpload} onClear={handleClear} />
      </Section>

      {/* CTA */}
      <Section title="📞 CTA Banner Section">
        <Field label="Title" fieldKey="ctaTitle" value={form.ctaTitle} onFieldChange={handleFieldChange} />
        <Field label="Subtitle" fieldKey="ctaSubtitle" value={form.ctaSubtitle} onFieldChange={handleFieldChange} multiline />
        <Field label="Phone Number" fieldKey="ctaPhone" value={form.ctaPhone} onFieldChange={handleFieldChange} />
      </Section>
    </div>
  );
}
