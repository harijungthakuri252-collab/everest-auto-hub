import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiDollarSign } from 'react-icons/fi';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';
import './Services.css';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [c, setC] = useState(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/services').then(r => { setServices(r.data); setLoading(false); });
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};
  const getImageUrl = (img) => img?.startsWith('/uploads') ? `${IMG_BASE}${img}` : img;

  return (
    <div className="services-page">
      <div className="page-hero" style={d.servicesHeroImage ? { backgroundImage: `url(${getImageUrl(d.servicesHeroImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="container">
          <p className="section-tag">{d.servicesHeroTag || 'What We Offer'}</p>
          <h1 className="section-title">Our <span>Services</span></h1>
          <p className="section-subtitle">{d.servicesHeroSubtitle || 'Professional auto care from certified mechanics'}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '60px 20px' }}>
        {loading ? <div className="spinner" /> : (
          <div className="grid-3">
            {services.map(s => (
              <div key={s._id} className="service-detail-card card">
                {getImageUrl(s.image) ? (
                  <div className="sdc-img"><img src={getImageUrl(s.image)} alt={s.name} /></div>
                ) : (
                  <div className="sdc-icon">🔧</div>
                )}
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="sdc-meta">
                  <span><FiDollarSign /> {formatPrice(s.price)}</span>
                  <span><FiClock /> {s.duration}</span>
                </div>
                <Link to="/appointment" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                  Book This Service <FiArrowRight />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
