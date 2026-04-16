import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  FiGrid, FiTool, FiCalendar, FiShoppingBag, FiPackage,
  FiUsers, FiStar, FiLogOut, FiMenu, FiX, FiHome, FiSettings,
  FiLayout, FiEdit, FiBell, FiChevronRight, FiMoreHorizontal
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import BrandLogo from '../../components/BrandLogo';
import './AdminLayout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bellOpen, setBellOpen]       = useState(false);
  const { user, logout }              = useAuth();
  const { counts, totalBadge, recentActivity, refresh } = useNotifications();
  const location  = useLocation();
  const navigate  = useNavigate();
  const bellRef   = useRef();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems = [
    { path: '/admin',              icon: <FiGrid />,      label: 'Dashboard', exact: true },
    { path: '/admin/home',         icon: <FiLayout />,    label: 'Home Page' },
    { path: '/admin/site-content', icon: <FiEdit />,      label: 'Site Content' },
    { path: '/admin/notices',      icon: <FiBell />,      label: 'Notices' },
    { path: '/admin/services',     icon: <FiTool />,      label: 'Services' },
    { path: '/admin/appointments', icon: <FiCalendar />,  label: 'Appointments', badge: counts.pendingAppointments },
    { path: '/admin/products',     icon: <FiShoppingBag />, label: 'Products' },
    { path: '/admin/orders',       icon: <FiPackage />,   label: 'Orders',       badge: counts.pendingOrders },
    { path: '/admin/users',        icon: <FiUsers />,     label: 'Users' },
    { path: '/admin/reviews',      icon: <FiStar />,      label: 'Reviews',      badge: counts.pendingReviews },
    { path: '/admin/settings',     icon: <FiSettings />,  label: 'Settings' },
  ];

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'collapsed'}`}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            {sidebarOpen
              ? <BrandLogo size="sm" />
              : <span style={{ fontSize: '1.2rem', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontStyle: 'italic', color: '#f97316' }}>E</span>
            }
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`sidebar-link ${isActive(item.path, item.exact) ? 'active' : ''}`}>
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {item.icon}
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.badge > 0 && (
                <span className="nav-badge-label">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link">
            <FiHome />
            {sidebarOpen && <span>View Site</span>}
          </Link>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h2 className="admin-page-title">Admin Panel</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Bell button */}
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button className="topbar-bell-btn" onClick={() => { setBellOpen(o => !o); refresh(); }}>
                <FiBell size={20} />
                {totalBadge > 0 && (
                  <span className="topbar-bell-badge">{totalBadge > 99 ? '99+' : totalBadge}</span>
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div className="bell-dropdown">
                  <div className="bell-dropdown-header">
                    <span>Notifications</span>
                    {totalBadge > 0 && <span className="bell-total-badge">{totalBadge} pending</span>}
                  </div>

                  {/* Summary pills */}
                  <div className="bell-summary">
                    {counts.pendingOrders > 0 && (
                      <Link to="/admin/orders" className="bell-pill bell-pill--order" onClick={() => setBellOpen(false)}>
                        🛒 {counts.pendingOrders} new order{counts.pendingOrders !== 1 ? 's' : ''}
                        <FiChevronRight size={12} />
                      </Link>
                    )}
                    {counts.pendingAppointments > 0 && (
                      <Link to="/admin/appointments" className="bell-pill bell-pill--appt" onClick={() => setBellOpen(false)}>
                        📅 {counts.pendingAppointments} appointment{counts.pendingAppointments !== 1 ? 's' : ''}
                        <FiChevronRight size={12} />
                      </Link>
                    )}
                    {counts.pendingReviews > 0 && (
                      <Link to="/admin/reviews" className="bell-pill bell-pill--review" onClick={() => setBellOpen(false)}>
                        ⭐ {counts.pendingReviews} review{counts.pendingReviews !== 1 ? 's' : ''} to approve
                        <FiChevronRight size={12} />
                      </Link>
                    )}
                    {totalBadge === 0 && (
                      <p style={{ color: 'var(--gray)', fontSize: '0.85rem', padding: '8px 0', textAlign: 'center' }}>
                        ✅ All caught up!
                      </p>
                    )}
                  </div>

                  {/* Recent activity feed */}
                  {recentActivity.length > 0 && (
                    <>
                      <div className="bell-section-label">Recent Activity</div>
                      <div className="bell-feed">
                        {recentActivity.map((item, i) => (
                          <Link key={i} to={item.link} className="bell-feed-item" onClick={() => setBellOpen(false)}>
                            <span className="bell-feed-icon">{item.icon}</span>
                            <div className="bell-feed-content">
                              <span className="bell-feed-title">{item.title}</span>
                              <span className="bell-feed-sub">{item.sub}</span>
                            </div>
                            <span className="bell-feed-time">{timeAgo(item.time)}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User info */}
            <div className="admin-user">
              <div className="admin-avatar">{user?.name?.[0]}</div>
              <div>
                <span>{user?.name}</span>
                <small>Administrator</small>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="admin-mobile-nav">
        <Link to="/admin" className={isActive('/admin', true) ? 'active' : ''}>
          <FiGrid size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/appointments" className={isActive('/admin/appointments') ? 'active' : ''}>
          <FiCalendar size={20} />
          {counts.pendingAppointments > 0 && <span className="admin-mobile-badge">{counts.pendingAppointments}</span>}
          <span>Bookings</span>
        </Link>
        <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
          <FiPackage size={20} />
          {counts.pendingOrders > 0 && <span className="admin-mobile-badge">{counts.pendingOrders}</span>}
          <span>Orders</span>
        </Link>
        <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
          <FiShoppingBag size={20} />
          <span>Products</span>
        </Link>
        <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>
          <FiMoreHorizontal size={20} />
          <span>More</span>
        </Link>
      </nav>
    </div>
  );
}
