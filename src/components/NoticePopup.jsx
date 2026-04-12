import { useEffect, useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../utils/api';
import './NoticePopup.css';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imgUrl = (img) => img?.startsWith('/uploads') ? `${IMG_BASE}${img}` : img || null;

const TYPE_CONFIG = {
  info:    { accent: '#4cc9f0', emoji: '📢' },
  offer:   { accent: '#f97316', emoji: '🎁' },
  warning: { accent: '#e9c46a', emoji: '⚠️' },
  event:   { accent: '#2d6a4f', emoji: '🎉' },
};

export default function NoticePopup() {
  const [notices, setNotices] = useState([]);
  const [index, setIndex]     = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    api.get('/notices/active').then(r => {
      if (!r.data?.length) return;

      // Filter out notices the user already dismissed this session
      const dismissed = JSON.parse(sessionStorage.getItem('dismissed_notices') || '[]');
      const fresh = r.data.filter(n => !dismissed.includes(n._id));
      if (fresh.length === 0) return;

      setNotices(fresh);
      setIndex(0);
      // Small delay so it doesn't flash on page load
      setTimeout(() => setVisible(true), 800);
    }).catch(() => {});
  }, []);

  const dismiss = () => {
    // Remember dismissed IDs for this session
    const dismissed = JSON.parse(sessionStorage.getItem('dismissed_notices') || '[]');
    const ids = notices.map(n => n._id);
    sessionStorage.setItem('dismissed_notices', JSON.stringify([...new Set([...dismissed, ...ids])]));
    setVisible(false);
  };

  const prev = () => setIndex(i => (i - 1 + notices.length) % notices.length);
  const next = () => setIndex(i => (i + 1) % notices.length);

  if (!visible || notices.length === 0) return null;

  const notice = notices[index];
  const cfg    = TYPE_CONFIG[notice.type] || TYPE_CONFIG.info;

  return (
    <div className="notice-overlay" onClick={dismiss}>
      <div
        className="notice-popup"
        style={{ '--notice-accent': cfg.accent }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className="notice-close" onClick={dismiss} aria-label="Close">
          <FiX size={18} />
        </button>

        {/* Type badge */}
        <div className="notice-badge">
          <span>{cfg.emoji}</span>
          <span>{notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}</span>
        </div>

        {/* Image */}
        {imgUrl(notice.image) && (
          <div className="notice-img-wrap">
            <img src={imgUrl(notice.image)} alt={notice.title} />
          </div>
        )}

        {/* Content */}
        <div className="notice-body">
          <h3 className="notice-title">{notice.title}</h3>
          {notice.message && <p className="notice-message">{notice.message}</p>}
        </div>

        {/* Pagination if multiple */}
        {notices.length > 1 && (
          <div className="notice-nav">
            <button onClick={prev} className="notice-nav-btn"><FiChevronLeft /></button>
            <span className="notice-dots">
              {notices.map((_, i) => (
                <span key={i} className={`notice-dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} />
              ))}
            </span>
            <button onClick={next} className="notice-nav-btn"><FiChevronRight /></button>
          </div>
        )}

        <button className="notice-dismiss-btn" onClick={dismiss}>
          Got it, thanks!
        </button>
      </div>
    </div>
  );
}
