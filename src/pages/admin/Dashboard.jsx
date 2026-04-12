import { useEffect, useState } from 'react';
import { FiUsers, FiCalendar, FiPackage, FiShoppingBag, FiDollarSign, FiClock, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import './Dashboard.css';

const CustomTooltip = ({ active, payload, label, formatPrice }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '2px 0', fontSize: '0.88rem', fontWeight: 600 }}>
            {p.name === 'revenue' ? formatPrice(p.value) : `${p.value} orders`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
  }, []);

  if (!stats) return <div className="spinner" />;

  const cards = [
    {
      icon: <FiDollarSign />,
      label: 'Total Revenue',
      value: formatPrice(stats.revenue),
      color: '#2d6a4f',
      sub: `${formatPrice(stats.orderRevenue)} orders · ${formatPrice(stats.appointmentRevenue)} services`,
    },
    { icon: <FiUsers />, label: 'Total Users', value: stats.users, color: '#023e8a' },
    { icon: <FiCalendar />, label: 'Appointments', value: stats.appointments, color: '#e9c46a', sub: `${stats.pendingAppointments} pending` },
    { icon: <FiPackage />, label: 'Orders', value: stats.orders, color: 'var(--primary)', sub: `${stats.pendingOrders} pending` },
    { icon: <FiShoppingBag />, label: 'Products', value: stats.products, color: '#7b2d8b' },
  ];

  return (
    <div className="dashboard">
      <div className="admin-header">
        <h2>Dashboard Overview</h2>
        <span className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{ '--accent': c.color }}>
            <div className="stat-card-icon">{c.icon}</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{c.value}</span>
              <span className="stat-card-label">{c.label}</span>
              {c.sub && <span className="stat-card-sub"><FiClock size={12} /> {c.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {stats.monthlyData?.length > 0 && (
        <div className="card" style={{ padding: '1.8rem', marginTop: '2rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTrendingUp /> Revenue — Last 6 Months (Delivered Orders)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} />
              <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>

          {/* Orders line chart */}
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: '#4cc9f0', textTransform: 'uppercase', letterSpacing: 1, margin: '2rem 0 1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiPackage /> Orders Per Month
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} />
              <Line type="monotone" dataKey="orders" stroke="#4cc9f0" strokeWidth={2} dot={{ fill: '#4cc9f0', r: 4 }} name="orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.monthlyData?.length === 0 && (
        <div className="card" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center', color: 'var(--gray)' }}>
          <FiTrendingUp size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
          <p>Revenue chart will appear once orders are marked as delivered.</p>
        </div>
      )}

      <div className="dashboard-welcome">
        <h3>Welcome to Everest Auto Hub Admin Panel</h3>
        <p>Manage your services, appointments, products, orders, and more from here.</p>
      </div>
    </div>
  );
}
