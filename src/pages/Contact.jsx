import { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [c, setC] = useState(null);

  useEffect(() => {
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};

  const handleSubmit = e => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name:'', email:'', phone:'', message:'' });
  };

  return (
    <div className="contact-page">
      <div className="page-hero">
        <div className="container">
          <p className="section-tag">{d.contactHeroTag || 'Get In Touch'}</p>
          <h1 className="section-title">Contact <span>Us</span></h1>
          <p className="section-subtitle">{d.contactHeroSubtitle || "We're here to help with any questions"}</p>
        </div>
      </div>

      <div className="container contact-container">
        <div className="contact-info">
          <h3>Contact Information</h3>
          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-icon"><FiMapPin /></div>
              <div><h4>Location</h4><p>{d.contactAddress || '123 Workshop Street, Sydney NSW 2000, Australia'}</p></div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><FiPhone /></div>
              <div>
                <h4>Phone</h4>
                {d.contactPhone1 && <p>{d.contactPhone1}</p>}
                {d.contactPhone2 && <p>{d.contactPhone2}</p>}
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><FiMail /></div>
              <div><h4>Email</h4><p>{d.contactEmail || 'info@everestautohub.com'}</p></div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><FiClock /></div>
              <div>
                <h4>Working Hours</h4>
                {d.contactHours1 && <p>{d.contactHours1}</p>}
                {d.contactHours2 && <p>{d.contactHours2}</p>}
              </div>
            </div>
          </div>

          {/* Google Maps embed */}
          {d.contactMapEmbed && (
            <div style={{ marginTop: '1.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <iframe src={d.contactMapEmbed} width="100%" height="220" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="Our Location" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="contact-form card">
          <h3>Send a Message</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+61 4XX XXX XXX" />
            </div>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="How can we help you?" required style={{ minHeight: '150px' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <FiSend /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
