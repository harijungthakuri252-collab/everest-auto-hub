import { useEffect, useState } from 'react';
import { FiDownload, FiCalendar, FiList, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { exportCSV } from '../../utils/exportCSV';
import toast from 'react-hot-toast';
import './AdminAppointments.css';

const STATUS_COLORS = {
  pending:   { badge: 'badge-warning',  bg: 'rgba(233,196,106,0.15)', border: 'rgba(233,196,106,0.4)', dot: '#e9c46a' },
  confirmed: { badge: 'badge-info',     bg: 'rgba(76,201,240,0.15)',  border: 'rgba(76,201,240,0.4)',  dot: '#4cc9f0' },
  completed: { badge: 'badge-success',  bg: 'rgba(45,106,79,0.2)',    border: 'rgba(45,106,79,0.5)',   dot: '#2d6a4f' },
  cancelled: { badge: 'badge-danger',   bg: 'rgba(230,57,70,0.12)',   border: 'rgba(230,57,70,0.3)',   dot: '#e63946' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Detail Modal ─────────────────────────────────────────────────────────────
function AppointmentModal({ appt, onClose, onStatusChange }) {
  const [status, setStatus] = useState(appt.status);
  const [saving, setSaving] = useState(false);
  const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(appt._id, status);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Appointment Details</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.2rem' }}>
          {[
            ['Customer',  appt.name],
            ['Email',     appt.email],
            ['Phone',     appt.phone],
            ['Vehicle',   appt.vehicle],
            ['Service',   appt.service?.name || 'N/A'],
            ['Price',     appt.service?.price ? `$${appt.service.price}` : '—'],
            ['Date',      new Date(appt.date).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
            ['Time',      appt.timeSlot],
          ].map(([label, val]) => (
            <div key={label} style={{ background: 'var(--dark-2)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--light)', fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {appt.message && (
          <div style={{ background: 'var(--dark-2)', borderRadius: 8, padding: '10px 14px', marginBottom: '1.2rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Note</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--light)' }}>{appt.message}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={status} onChange={e => setStatus(e.target.value)}
            style={{ flex: 1, background: 'var(--dark-2)', border: `1px solid ${sc.border}`, color: 'var(--light)', padding: '9px 12px', borderRadius: 'var(--radius)', fontSize: '0.88rem' }}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '9px 18px' }}>
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Calendar View ─────────────────────────────────────────────────────────────
function CalendarView({ appointments, onSelect }) {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Build calendar grid
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  // Group appointments by date string
  const byDate = {};
  appointments.forEach(a => {
    const d = new Date(a.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(a);
    }
  });

  const isToday = (day) => day && today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="appt-calendar">
      {/* Month nav */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={prevMonth}><FiChevronLeft /></button>
        <h3 className="cal-month-title">{MONTHS[month]} {year}</h3>
        <button className="cal-nav-btn" onClick={nextMonth}><FiChevronRight /></button>
      </div>

      {/* Day headers */}
      <div className="cal-grid">
        {DAYS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}

        {/* Cells */}
        {cells.map((day, i) => (
          <div key={i} className={`cal-cell ${day ? 'cal-cell--active' : ''} ${isToday(day) ? 'cal-cell--today' : ''}`}>
            {day && (
              <>
                <span className="cal-day-num">{day}</span>
                <div className="cal-events">
                  {(byDate[day] || []).slice(0, 3).map(a => (
                    <button key={a._id} className="cal-event" onClick={() => onSelect(a)}
                      style={{ background: STATUS_COLORS[a.status]?.bg, borderLeft: `3px solid ${STATUS_COLORS[a.status]?.dot}` }}>
                      <span className="cal-event-time">{a.timeSlot}</span>
                      <span className="cal-event-name">{a.name}</span>
                    </button>
                  ))}
                  {(byDate[day] || []).length > 3 && (
                    <span className="cal-more">+{byDate[day].length - 3} more</span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <span key={s} className="cal-legend-item">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter]   = useState('all');
  const [view, setView]       = useState('list'); // 'list' | 'calendar'
  const [selected, setSelected] = useState(null);

  const load = () => api.get('/appointments').then(r => setAppointments(r.data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/appointments/${id}`, { status });
    toast.success('Status updated');
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return;
    await api.delete(`/appointments/${id}`);
    toast.success('Deleted');
    load();
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  const handleExport = () => {
    const rows = filtered.map(a => ({
      'Appointment ID': a._id.slice(-8),
      'Customer Name':  a.name,
      'Email':          a.email,
      'Phone':          a.phone,
      'Vehicle':        a.vehicle,
      'Service':        a.service?.name || 'N/A',
      'Service Price':  a.service?.price || '',
      'Date':           new Date(a.date).toLocaleDateString('en-AU'),
      'Time Slot':      a.timeSlot,
      'Status':         a.status,
      'Message':        a.message || '',
      'Booked On':      new Date(a.createdAt).toLocaleDateString('en-AU'),
    }));
    exportCSV(rows, 'appointments');
    toast.success(`Exported ${rows.length} appointments to Excel`);
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-header">
        <h2>Appointments</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--dark-2)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <button onClick={() => setView('list')} style={{ padding: '7px 14px', background: view === 'list' ? 'var(--primary)' : 'transparent', border: 'none', color: view === 'list' ? '#fff' : 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem' }}>
              <FiList size={14} /> List
            </button>
            <button onClick={() => setView('calendar')} style={{ padding: '7px 14px', background: view === 'calendar' ? 'var(--primary)' : 'transparent', border: 'none', color: view === 'calendar' ? '#fff' : 'var(--gray)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem' }}>
              <FiCalendar size={14} /> Calendar
            </button>
          </div>

          {/* Status filters (list view only) */}
          {view === 'list' && ['all','pending','confirmed','completed','cancelled'].map(s => (
            <button key={s} className={`cat-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}

          <button onClick={handleExport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem' }}>
            <FiDownload size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <CalendarView appointments={appointments} onSelect={setSelected} />
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Customer</th><th>Vehicle</th><th>Service</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(a)}>
                  <td>
                    <strong>{a.name}</strong><br />
                    <small style={{ color: 'var(--gray)' }}>{a.email}</small><br />
                    <small style={{ color: 'var(--gray)' }}>{a.phone}</small>
                  </td>
                  <td>{a.vehicle}</td>
                  <td>{a.service?.name || 'N/A'}</td>
                  <td>
                    {new Date(a.date).toLocaleDateString('en-AU')}<br />
                    <small style={{ color: 'var(--gray)' }}>{a.timeSlot}</small>
                  </td>
                  <td><span className={`badge ${STATUS_COLORS[a.status]?.badge}`}>{a.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="action-btns" style={{ flexWrap: 'wrap' }}>
                      <select value={a.status} onChange={e => updateStatus(a._id, e.target.value)}
                        style={{ background: 'var(--dark-2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--light)', padding: '5px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="btn-delete" onClick={() => handleDelete(a._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No appointments found</p>}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <AppointmentModal
          appt={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}
