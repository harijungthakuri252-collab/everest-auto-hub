import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Services from './pages/Services';
import Appointment from './pages/Appointment';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminNotices from './pages/admin/AdminNotices';
import NoticePopup from './components/NoticePopup';

const ProtectedAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const ProtectedUser = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login?redirect=/profile" replace />;
  return children;
};

// Redirect logged-in users away from login page
const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div className="spinner" />
    </div>
  );
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
};

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
    <NoticePopup />
  </>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/appointment" element={<PublicLayout><Appointment /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/shop/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      <Route path="/profile" element={<PublicLayout><ProtectedUser><Profile /></ProtectedUser></PublicLayout>} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedAdmin><AdminLayout /></ProtectedAdmin>}>
        <Route index element={<Dashboard />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="home" element={<AdminHomePage />} />
        <Route path="site-content" element={<AdminSiteContent />} />
        <Route path="notices" element={<AdminNotices />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <CurrencyProvider>
          <CartProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#242424', color: '#f8f9fa', border: '1px solid rgba(255,255,255,0.1)' },
                success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
              }}
            />
          </CartProvider>
        </CurrencyProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
