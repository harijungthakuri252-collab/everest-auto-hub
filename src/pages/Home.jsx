import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar, FiCheckCircle, FiPhone, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import { GiCarWheel, GiAutoRepair, GiMechanicGarage } from 'react-icons/gi';
import api from '../utils/api';
import BrandLogo from '../components/BrandLogo';
import { useCurrency } from '../context/CurrencyContext';
import './Home.css';

const whyUsFeatures = [
  { icon: <GiAutoRepair size={32} />, title: 'Expert Technicians', desc: 'Certified mechanics with years of hands-on experience.' },
  { icon: <GiCarWheel size={32} />, title: 'Quality Parts', desc: 'We use only genuine and high-quality replacement parts.' },
  { icon: <GiMechanicGarage size={32} />, title: 'Modern Equipment', desc: 'State-of-the-art diagnostic and repair equipment.' },
  { icon: <FiCheckCircle size={32} />, title: 'Warranty Guaranteed', desc: 'All our services come with a satisfaction guarantee.' },
];

import { getImageUrl as resolveImg } from '../utils/imageUrl';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Home() {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data.slice(0, 6)));
    api.get('/products/featured').then(r => setProducts(r.data.slice(0, 4)));
    api.get('/reviews').then(r => setReviews(r.data.slice(0, 3)));
    api.get('/home-content', { params: { _t: Date.now() } }).then(r => setContent(r.data)).catch(console.error);
  }, []);

  const getImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith('/uploads') ? `${IMG_BASE}${img}` : img;
  };

  // Shorthand helpers with fallbacks
  const c = content || {};
  const heroBadge = c.heroBadge || "🇦🇺 Australia's Premier Auto Workshop";
  const heroSubtitle = c.heroSubtitle || "Expert auto repair, maintenance & your favorite automotive lifestyle brand. We keep your ride smooth and your style sharp.";
  const heroImage = getImageUrl(c.heroImage);

  const servicesSectionTag = c.servicesSectionTag || 'What We Do';
  const servicesSectionTitle = c.servicesSectionTitle || 'Our Services';
  const servicesSectionSubtitle = c.servicesSectionSubtitle || 'Professional auto care services to keep your vehicle in peak condition';

  const whyTitle = c.whyTitle || 'Built on Trust & Expertise';
  const whySubtitle = c.whySubtitle || "At Everest Auto Hub, we combine technical expertise with genuine care for your vehicle. Our team of certified mechanics ensures every job is done right the first time.";
  const whyImage = getImageUrl(c.whyImage);

  const shopBannerTag = c.shopBannerTag || 'Everest Clothing';
  const shopBannerTitle = c.shopBannerTitle || 'Wear Your Passion';
  const shopBannerSubtitle = c.shopBannerSubtitle || 'Exclusive automotive lifestyle clothing. Rep the Everest brand with premium quality tees, hoodies, caps and more.';
  const shopBannerImage = getImageUrl(c.shopBannerImage);

  const ctaTitle = c.ctaTitle || 'Ready to Book Your Service?';
  const ctaSubtitle = c.ctaSubtitle || 'Schedule your appointment today and get your vehicle back in top shape.';
  const ctaPhone = c.ctaPhone || '+61 2 9000 0000';

  // Render plain text or HTML safely
  const renderText = (text, className, style) => {
    if (!text) return null;
    const isHtml = /<[a-z][\s\S]*>/i.test(text);
    if (isHtml) return <span className={className} style={style} dangerouslySetInnerHTML={{ __html: text }} />;
    return <span className={className} style={style}>{text}</span>;
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          {heroImage
            ? <img src={heroImage} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
            : null
          }
          <div className="hero-overlay" />
        </div>
      <div className="container hero-content">
          <div className="hero-badge">
            <span>{heroBadge}</span>
          </div>
          <h1 className="hero-title">
            <BrandLogo size="hero" />
          </h1>
          <div className="hero-subtitle">
            {renderText(heroSubtitle)}
          </div>
          <div className="hero-actions">
            <Link to="/appointment" className="btn-primary">
              <FiCalendar /> Book Appointment
            </Link>
            <Link to="/services" className="btn-outline">
              Our Services <FiArrowRight />
            </Link>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-indicator" />
        </div>
      </section>

      {/* Services */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header">
            <p className="section-tag">{servicesSectionTag}</p>
            <h2 className="section-title">{servicesSectionTitle.includes('Services')
              ? <>{servicesSectionTitle.replace('Services', '')}<span>Services</span></>
              : servicesSectionTitle}
            </h2>
            <div className="section-subtitle">{renderText(servicesSectionSubtitle)}</div>
          </div>
          <div className="grid-3">
            {services.map(s => (
              <div key={s._id} className="service-card card">
                {getImageUrl(s.image) ? (
                  <div className="service-card-img">
                    <img src={getImageUrl(s.image)} alt={s.name} />
                  </div>
                ) : (
                  <div className="service-icon">🔧</div>
                )}
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="service-footer">
                  <span className="service-price">{formatPrice(s.price)}</span>
                  <span className="service-duration">{s.duration}</span>
                </div>
                <Link to="/appointment" className="service-book">Book Now <FiArrowRight /></Link>
              </div>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/services" className="btn-outline">View All Services <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-text">
              <p className="section-tag">Why Everest Auto Hub</p>
              <h2 className="section-title">{whyTitle}</h2>
              <div style={{ color: 'var(--gray)', marginBottom: '2rem', lineHeight: 1.8 }}>
                {renderText(whySubtitle)}
              </div>
              <div className="why-features">
                {whyUsFeatures.map((w, i) => (
                  <div key={i} className="why-feature">
                    <div className="why-icon">{w.icon}</div>
                    <div>
                      <h4>{w.title}</h4>
                      <p>{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/appointment" className="btn-primary" style={{ marginTop: '1.5rem' }}>
                <FiPhone /> Call Us Now
              </Link>
            </div>
            <div className="why-image">
              <div className="why-img-box">
                {whyImage ? (
                  <img src={whyImage} alt="Workshop" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} />
                ) : (
                  <div className="why-img-placeholder">
                    <GiMechanicGarage size={120} />
                    <p>Everest Auto Hub Workshop</p>
                  </div>
                )}
                <div className="why-badge-float" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Banner */}
      <section className="shop-banner" style={shopBannerImage ? { backgroundImage: `url(${shopBannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="container">
          <div className="shop-banner-inner">
            <div className="shop-banner-text">
              <p className="section-tag">{shopBannerTag}</p>
              <h2 className="section-title">
                {shopBannerTitle.includes('Passion')
                  ? <>Wear Your <span>Passion</span></>
                  : shopBannerTitle}
              </h2>
              <div>{renderText(shopBannerSubtitle)}</div>
              <Link to="/shop" className="btn-primary">
                <FiShoppingBag /> Shop Now
              </Link>
            </div>
            <div className="shop-banner-products">
              {products.map(p => (
                <Link to={`/shop/${p._id}`} key={p._id} className="mini-product-card">
                  <div className="mini-product-img">
                    {getImageUrl(p.images?.[0]) ? (
                      <img src={getImageUrl(p.images[0])} alt={p.name} />
                    ) : (
                      <div className="img-placeholder">👕</div>
                    )}
                  </div>
                  <div className="mini-product-info">
                    <span>{p.name}</span>
                    <strong>{formatPrice(p.price)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="section reviews-section">
          <div className="container">
            <div className="section-header">
              <p className="section-tag">Testimonials</p>
              <h2 className="section-title">What Our <span>Customers</span> Say</h2>
            </div>
            <div className="grid-3">
              {reviews.map(r => (
                <div key={r._id} className="review-card card">
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} fill={i < r.rating ? '#ffd60a' : 'none'} color={i < r.rating ? '#ffd60a' : '#555'} />
                    ))}
                  </div>
                  <p className="review-comment">"{r.comment}"</p>
                  <div className="review-author">
                    <div className="review-avatar">{r.name[0]}</div>
                    <div>
                      <strong>{r.name}</strong>
                      <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h2>{ctaTitle.includes('Service')
                ? <>{ctaTitle.replace('Service?', '')}<span>Service?</span></>
                : ctaTitle}
              </h2>
              <div>{renderText(ctaSubtitle)}</div>
            </div>
            <div className="cta-actions">
              <Link to="/appointment" className="btn-primary">
                <FiCalendar /> Book Now
              </Link>
              <a href={`tel:${ctaPhone.replace(/\s/g, '')}`} className="btn-outline">
                <FiPhone /> {ctaPhone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
