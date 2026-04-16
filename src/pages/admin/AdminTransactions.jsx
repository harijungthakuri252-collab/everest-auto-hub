import { useEffect, useState } from 'react';
import { FiDollarSign, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import api from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

const STATUS_STYLE = {
  succeeded:        { color: '#2d6a4f', bg: 'rgba(45,106,79,0.15)',  label: '✅ Paid' },
  processing:       { color: '#4cc9f0', bg: 'rgba(76,201,240,0.12)', label: '⏳ Processing' },
  requires_payment_method: { color: '#e9c46a', bg: 'rgba(233,196,106,0.12)', label: '⚠️ Incomplete' },
  canceled:         { color: '#e63946', bg: 'rgba(230,57,70,0.12)',  label: '❌ Cancelled' },
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payment/transactions');
      setTransactions(data);
    } catch {
      setTransactions([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const total = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="admin-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiDollarSign /> Stripe Transactions
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>
            Total collected: <strong style={{ color: '#2d6a4f' }}>{formatPrice(total)}</strong>
          </span>
          <button onClick={load} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <a href="https://dashboard.stripe.com/test/payments" target="_blank" rel="noreferrer"
            className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
            <FiExternalLink size={14} /> Stripe Dashboard
          </a>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const s = STATUS_STYLE[t.status] || { color: 'var(--gray)', bg: 'rgba(255,255,255,0.05)', label: t.status };
                return (
                  <tr key={t.id}>
                    <td>
                      <small style={{ fontFamily: 'monospace', color: 'var(--gray)' }}>{t.id.slice(-16)}</small>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {formatPrice(t.amount)}
                    </td>
                    <td>{t.currency}</td>
                    <td>
                      <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <small>{new Date(t.created).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>
              No transactions yet. They'll appear here after customers pay via Stripe.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
