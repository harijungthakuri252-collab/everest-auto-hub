import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSave, FiImage, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import RichTextEditor from '../../components/RichTextEditor';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImageUrl = (img) => img?.startsWith('/uploads') ? `${IMG_BASE}${img}` : img || null;

// ── Reusable Field ────────────────────────────────────────
function Field({ label, fieldKey, value, onChange, multiline, placeholder }) {
  const style = {
    background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--light)', padding: '10px 14px', borderRadius: 'var(--radius)',
    fontSize: '0.88rem', width: '100%', fontFamily: 'var(--font-body)',
    resize: multiline ? 'vertical' : 'none', boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray)', marginBottom: 5 }}>{label}</label>
      {multiline
        ? <textarea rows={3} value={value || ''} onChange={e => onChange(fieldKey, e.target.value)} style={style} placeholder={placeholder} />
        : <input type="text" value={value || ''} onChange={e => onChange(fieldKey, e.target.value)} style={style} placeholder={placeholder} />
      }
    </div>
  );
}

// ── Image Uploader ────────────────────────────────────────
function ImageUploader({ label, fieldKey, value, onUpload, onClear }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const preview = getImageUrl(value);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpload(fieldKey, data.url);
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gray)', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {preview ? (
          <div style={{ position: 'relative', width: 90, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => onClear(fieldKey)}
              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <FiX size={11} />
            </button>
          </div>
        ) : (
          <div style={{ width: 90, height: 60, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', flexShrink: 0 }}>
            <FiImage size={20} />
          </div>
        )}
        <button type="button" onClick={() => inputRef.current.click()}
          style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.82rem' }}>
          {uploading ? 'Uploading...' : preview ? 'Change' : 'Upload Image'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: '1.6rem', marginBottom: '1.2rem' }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1.2rem' }}>{title}</h4>
      {children}
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────────
const TABS = [
  { key: 'about',       label: '📖 About' },
  { key: 'services',    label: '🔧 Services' },
  { key: 'contact',     label: '📞 Contact' },
  { key: 'appointment', label: '📅 Appointment' },
  { key: 'shop',        label: '🛍️ Shop' },
  { key: 'footer',      label: '🦶 Footer' },
];

export default function AdminSiteContent() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('about');

  useEffect(() => {
    api.get('/site-content').then(r => setForm(r.data)).catch(() => toast.error('Failed to load'));
  }, []);

  const handleChange = useCallback((key, value) => {
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
      const { data } = await api.put('/site-content', form);
      setForm(data);
      toast.success('Content saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  // Team member helpers
  const updateTeamMember = (i, key, val) => {
    const team = [...(form.aboutTeam || [])];
    team[i] = { ...team[i], [key]: val };
    setForm(prev => ({ ...prev, aboutTeam: team }));
  };

  const addTeamMember = () => {
    setForm(prev => ({ ...prev, aboutTeam: [...(prev.aboutTeam || []), { name: '', role: '', exp: '', image: '' }] }));
  };

  const removeTeamMember = (i) => {
    setForm(prev => ({ ...prev, aboutTeam: prev.aboutTeam.filter((_, idx) => idx !== i) }));
  };

  const uploadTeamImage = async (i, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateTeamMember(i, 'image', data.url);
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
  };

  // Why points helpers
  const updatePoint = (i, val) => {
    const pts = [...(form.apptWhyPoints || [])];
    pts[i] = val;
    setForm(prev => ({ ...prev, apptWhyPoints: pts }));
  };
  const addPoint    = () => setForm(prev => ({ ...prev, apptWhyPoints: [...(prev.apptWhyPoints || []), ''] }));
  const removePoint = (i) => setForm(prev => ({ ...prev, apptWhyPoints: prev.apptWhyPoints.filter((_, idx) => idx !== i) }));

  if (!form) return <div style={{ padding: '2rem', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: 10 }}><div className="spinner" /> Loading...</div>;

  const inputStyle = { background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '8px 12px', borderRadius: 'var(--radius)', fontSize: '0.85rem', width: '100%', fontFamily: 'var(--font-body)', boxSizing: 'border-box' };

  return (
    <div>
      {/* Header */}
      <div className="admin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>Site Content Manager</h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-body)', background: tab === t.key ? 'var(--primary)' : 'var(--dark-2)', color: tab === t.key ? '#fff' : 'var(--gray)', transition: 'var(--transition)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ABOUT ── */}
      {tab === 'about' && (
        <>
          <Section title="Hero Banner">
            <RichTextEditor label="Tag (small text above title)" value={form.aboutHeroTag} onChange={(val) => handleChange('aboutHeroTag', val)} />
            <RichTextEditor label="Title" value={form.aboutHeroTitle} onChange={(val) => handleChange('aboutHeroTitle', val)} />
            <RichTextEditor label="Subtitle" value={form.aboutHeroSubtitle} onChange={(val) => handleChange('aboutHeroSubtitle', val)} />
            <ImageUploader label="Hero Background Image" fieldKey="aboutHeroImage" value={form.aboutHeroImage} onUpload={handleUpload} onClear={handleClear} />
          </Section>

          <Section title="Our Story Section">
            <RichTextEditor label="Tag" value={form.aboutWhoTag} onChange={(val) => handleChange('aboutWhoTag', val)} />
            <RichTextEditor label="Title" value={form.aboutWhoTitle} onChange={(val) => handleChange('aboutWhoTitle', val)} />
            <RichTextEditor label="Paragraph 1" value={form.aboutPara1} onChange={(val) => handleChange('aboutPara1', val)} placeholder="First paragraph about your business..." />
            <RichTextEditor label="Paragraph 2" value={form.aboutPara2} onChange={(val) => handleChange('aboutPara2', val)} placeholder="Second paragraph..." />
            <ImageUploader label="Story Image" fieldKey="aboutImage" value={form.aboutImage} onUpload={handleUpload} onClear={handleClear} />
          </Section>

          <Section title="Team Section">
            <Field label="Tag" fieldKey="aboutTeamTag" value={form.aboutTeamTag} onChange={handleChange} />
            <Field label="Title" fieldKey="aboutTeamTitle" value={form.aboutTeamTitle} onChange={handleChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {(form.aboutTeam || []).map((m, i) => (
                <div key={i} style={{ background: 'var(--dark-2)', borderRadius: 8, padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div><label style={{ fontSize: '0.75rem', color: 'var(--gray)', display: 'block', marginBottom: 4 }}>Name</label>
                      <input value={m.name} onChange={e => updateTeamMember(i, 'name', e.target.value)} style={inputStyle} /></div>
                    <div><label style={{ fontSize: '0.75rem', color: 'var(--gray)', display: 'block', marginBottom: 4 }}>Role</label>
                      <input value={m.role} onChange={e => updateTeamMember(i, 'role', e.target.value)} style={inputStyle} /></div>
                    <div><label style={{ fontSize: '0.75rem', color: 'var(--gray)', display: 'block', marginBottom: 4 }}>Experience</label>
                      <input value={m.exp} onChange={e => updateTeamMember(i, 'exp', e.target.value)} style={inputStyle} placeholder="e.g. 10 years" /></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {getImageUrl(m.image) ? (
                      <div style={{ position: 'relative', width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', flexShrink: 0 }}>
                        <img src={getImageUrl(m.image)} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => updateTeamMember(i, 'image', '')}
                          style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                          <FiX size={10} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--dark-3)', border: '2px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', flexShrink: 0, fontSize: '1.2rem' }}>
                        {m.name?.[0] || '?'}
                      </div>
                    )}
                    <label style={{ background: 'var(--dark-3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '6px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Upload Photo
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadTeamImage(i, e.target.files[0])} />
                    </label>
                    <button type="button" onClick={() => removeTeamMember(i)}
                      style={{ marginLeft: 'auto', background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                      <FiTrash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTeamMember}
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '10px', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem' }}>
                <FiPlus /> Add Team Member
              </button>
            </div>
          </Section>
        </>
      )}

      {/* ── SERVICES ── */}
      {tab === 'services' && (
        <Section title="Services Page Hero">
          <Field label="Tag" fieldKey="servicesHeroTag" value={form.servicesHeroTag} onChange={handleChange} />
          <Field label="Title" fieldKey="servicesHeroTitle" value={form.servicesHeroTitle} onChange={handleChange} />
          <Field label="Subtitle" fieldKey="servicesHeroSubtitle" value={form.servicesHeroSubtitle} onChange={handleChange} />
          <ImageUploader label="Hero Background Image" fieldKey="servicesHeroImage" value={form.servicesHeroImage} onUpload={handleUpload} onClear={handleClear} />
          <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: 8 }}>
            💡 Individual services (name, price, image, description) are managed in the <strong style={{ color: 'var(--light)' }}>Services</strong> section.
          </p>
        </Section>
      )}

      {/* ── CONTACT ── */}
      {tab === 'contact' && (
        <>
          <Section title="Hero Banner">
            <Field label="Tag" fieldKey="contactHeroTag" value={form.contactHeroTag} onChange={handleChange} />
            <Field label="Title" fieldKey="contactHeroTitle" value={form.contactHeroTitle} onChange={handleChange} />
            <Field label="Subtitle" fieldKey="contactHeroSubtitle" value={form.contactHeroSubtitle} onChange={handleChange} />
          </Section>
          <Section title="Contact Information">
            <Field label="Address" fieldKey="contactAddress" value={form.contactAddress} onChange={handleChange} multiline />
            <Field label="Phone 1" fieldKey="contactPhone1" value={form.contactPhone1} onChange={handleChange} placeholder="+61 2 9000 0000" />
            <Field label="Phone 2" fieldKey="contactPhone2" value={form.contactPhone2} onChange={handleChange} placeholder="+61 2 9111 1111" />
            <Field label="Email" fieldKey="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="info@everestautohub.com" />
            <Field label="Working Hours Line 1" fieldKey="contactHours1" value={form.contactHours1} onChange={handleChange} placeholder="Monday - Saturday: 8:00 AM - 7:00 PM" />
            <Field label="Working Hours Line 2" fieldKey="contactHours2" value={form.contactHours2} onChange={handleChange} placeholder="Sunday: 10:00 AM - 4:00 PM" />
          </Section>
          <Section title="Google Maps Embed (optional)">
            <Field label="Google Maps Embed URL" fieldKey="contactMapEmbed" value={form.contactMapEmbed} onChange={handleChange} placeholder="Paste Google Maps embed src URL here" />
            <p style={{ color: 'var(--gray)', fontSize: '0.78rem', marginTop: 4 }}>
              Go to Google Maps → Share → Embed a map → copy only the <code style={{ color: 'var(--primary)' }}>src="..."</code> URL
            </p>
            {form.contactMapEmbed && (
              <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <iframe src={form.contactMapEmbed} width="100%" height="200" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Map preview" />
              </div>
            )}
          </Section>
        </>
      )}

      {/* ── APPOINTMENT ── */}
      {tab === 'appointment' && (
        <>
          <Section title="Hero Banner">
            <Field label="Tag" fieldKey="apptHeroTag" value={form.apptHeroTag} onChange={handleChange} />
            <Field label="Title" fieldKey="apptHeroTitle" value={form.apptHeroTitle} onChange={handleChange} />
            <Field label="Subtitle" fieldKey="apptHeroSubtitle" value={form.apptHeroSubtitle} onChange={handleChange} />
            <ImageUploader label="Hero Background Image" fieldKey="apptHeroImage" value={form.apptHeroImage} onUpload={handleUpload} onClear={handleClear} />
          </Section>
          <Section title="Why Book With Us Panel">
            <Field label="Section Title" fieldKey="apptWhyTitle" value={form.apptWhyTitle} onChange={handleChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {(form.apptWhyPoints || []).map((pt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={pt} onChange={e => updatePoint(i, e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="e.g. Free vehicle inspection" />
                  <button type="button" onClick={() => removePoint(i)}
                    style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.3)', color: '#e63946', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPoint}
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px dashed var(--primary)', color: 'var(--primary)', padding: '8px', borderRadius: 'var(--radius)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem' }}>
                <FiPlus /> Add Point
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Field label="Phone" fieldKey="apptPhone" value={form.apptPhone} onChange={handleChange} />
              <Field label="Email" fieldKey="apptEmail" value={form.apptEmail} onChange={handleChange} />
            </div>
          </Section>
        </>
      )}

      {/* ── SHOP ── */}
      {tab === 'shop' && (
        <Section title="Shop Page Hero">
          <Field label="Tag" fieldKey="shopHeroTag" value={form.shopHeroTag} onChange={handleChange} />
          <Field label="Title" fieldKey="shopHeroTitle" value={form.shopHeroTitle} onChange={handleChange} />
          <Field label="Subtitle" fieldKey="shopHeroSubtitle" value={form.shopHeroSubtitle} onChange={handleChange} />
          <ImageUploader label="Hero Background Image" fieldKey="shopHeroImage" value={form.shopHeroImage} onUpload={handleUpload} onClear={handleClear} />
          <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: 8 }}>
            💡 Individual products are managed in the <strong style={{ color: 'var(--light)' }}>Products</strong> section.
          </p>
        </Section>
      )}

      {/* ── FOOTER ── */}
      {tab === 'footer' && (
        <Section title="Footer Content">
          <Field label="Tagline (below logo)" fieldKey="footerTagline" value={form.footerTagline} onChange={handleChange} multiline />
          <Field label="Phone" fieldKey="footerPhone" value={form.footerPhone} onChange={handleChange} />
          <Field label="Email" fieldKey="footerEmail" value={form.footerEmail} onChange={handleChange} />
          <Field label="Address" fieldKey="footerAddress" value={form.footerAddress} onChange={handleChange} />
          <Field label="Copyright Text" fieldKey="footerCopyright" value={form.footerCopyright} onChange={handleChange} />
        </Section>
      )}
    </div>
  );
}
