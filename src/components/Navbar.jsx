import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <BrandLogo size="md" />
        </Link>

        <ul className={`navbar-links ${open ? 'open' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/appointment">Book Appointment</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            <FiShoppingCart size={20} />
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <button className="user-btn">
                <FiUser size={18} /> {user.name.split(' ')[0]}
              </button>
              <div className="user-dropdown">
                {user.role === 'admin' && (
                  <Link to="/admin"><FiSettings size={14} /> Admin Panel</Link>
                )}
                <Link to="/profile"><FiUser size={14} /> My Profile</Link>
                <button onClick={handleLogout}><FiLogOut size={14} /> Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Login
            </Link>
          )}

          <button className="hamburger" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
