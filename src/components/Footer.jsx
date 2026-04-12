import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import BrandLogo from './BrandLogo';
import api from '../utils/api';
import './Footer.css';

export default function Footer() {
  const [c, setC] = useState(null);

  useEffect(() => {
    api.get('/site-content').then(r => setC(r.data)).catch(() => setC({}));
  }, []);

  const d = c || {};

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo"><BrandLogo size="md" /></div>
            <p>{d.footerTagline || "Australia's trusted auto workshop and lifestyle brand. We keep your vehicle running and your style on point."}</p>
            <div className="footer-social">
              <a href="#"><FiFacebook /></a>
              <a href="#"><FiInstagram /></a>
              <a href="#"><FiTwitter /></a>
              <a href="#"><FiYoutube /></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Our Services</Link></li>
              <li><Link to="/appointment">Book Appointment</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Oil Change</Link></li>
              <li><Link to="/services">Brake Service</Link></li>
              <li><Link to="/services">Engine Diagnostics</Link></li>
              <li><Link to="/services">Tire Service</Link></li>
              <li><Link to="/services">AC Service</Link></li>
              <li><Link to="/services">Full Car Service</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Info</h4>
            <ul>
              <li><FiMapPin /> {d.footerAddress || '123 Workshop Street, Sydney NSW 2000, Australia'}</li>
              <li><FiPhone /> {d.footerPhone || '+61 2 9000 0000'}</li>
              <li><FiMail /> {d.footerEmail || 'info@everestautohub.com.au'}</li>
              <li><FiClock /> Mon-Sat: 8AM - 7PM</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>{d.footerCopyright || '© 2024 Everest Auto Hub. All rights reserved.'}</p>
          <p>Designed with ❤️ for car enthusiasts</p>
        </div>
      </div>
    </footer>
  );
}
