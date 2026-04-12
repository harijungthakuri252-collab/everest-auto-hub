import { useEffect, useState, useCallback } from 'react';
import { FiCalendar, FiUser, FiPhone, FiMail, FiTruck, FiCheckCircle } from 'react-icons/fi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import './Appointment.css';

const ALL_SLOTS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'
];

export default function Appointment() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [services, setServices] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [siteContent, setSiteContent] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    vehicle: '',
    service: '',
    date: '',
    timeSlot: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/services').then(r => setServices(r.data));
    api.get('/site-content').then(r => setSiteContent(r.data)).catch(() => setSiteContent({}));
  }, []);

  // Fetch booked slots whenever date or service changes
  const fetchAvailability = useCallback(async (date, service) => {
    if (!date || !service) { setBookedSlots([]); return; }
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/appointments/availability?date=${date}&service=${service}`);
      setBookedSlots(data.bookedSlots || []);
    } catch {
      setBookedSlots([]);
    }
    setLoadingSlots(false);
  }, []);

  const handleChange = e => {
    const updated = { ...form, [e.target.name]: e.target.value };
    // Reset time slot if date or service changes
    if (e.target.name === 'date' || e.target.name === 'service') {
      updated.timeSlot = '';
      fetchAvailability(
        e.target.name === 'date' ? e.target.value : form.date,
        e.target.name === 'service' ? e.target.value : form.service
      );
    }
    setForm(updated);
  };

  const [timeSlotError, setTimeSlotError] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.timeSlot) {
      setTimeSlotError(true);
      toast.error('Please select a time slot to continue');
      // Scroll to time slots
      document.querySelector('.time-slots')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setTimeSlotError(false);
    setLoading(true);
    try {
      await api.post('/appointments', {
        ...form,
        user: user?._id,
      });
      setSuccess(true);
      toast.success('Appointment booked! Check your email for confirmation.');
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', vehicle: '', service: '', date: '', timeSlot: '', message: '' });
      setBookedSlots([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    }
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const sc = siteContent || {};

  return (
    <div className="appointment-page">
      <div className="page-hero">
        <div className="container">
          <p className="section-tag">{sc.apptHeroTag || 'Schedule a Visit'}</p>
          <h1 className="section-title">Book an <span>Appointment</span></h1>
          <p className="section-subtitle">{sc.apptHeroSubtitle || "Fill in the form below and we'll confirm your slot"}</p>
        </div>
      </div>

      <div className="container appt-container">
        <div className="appt-info">
          <h3>{sc.apptWhyTitle || 'Why Book With Us?'}</h3>
          <ul>
            {(Array.isArray(sc.apptWhyPoints) && sc.apptWhyPoints.length > 0
              ? sc.apptWhyPoints
              : ['Confirmation email sent instantly','Real-time slot availability','Expert certified mechanics','Transparent pricing','Free vehicle inspection','Cancel up to 2 hours before']
            ).map((pt, i) => <li key={i}>✅ {pt}</li>)}
          </ul>
          <div className="appt-contact">
            <p><FiPhone /> {sc.apptPhone || '+61 2 9000 0000'}</p>
            <p><FiMail /> {sc.apptEmail || 'info@everestautohub.com.au'}</p>
          </div>
        </div>

        <div className="appt-form-box card">
          {success ? (
            <div className="success-msg">
              <FiCheckCircle size={60} color="var(--primary)" />
              <h3>Appointment Booked!</h3>
              <p>A confirmation email has been sent to <strong>{form.email || user?.email}</strong>.</p>
              <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>We'll contact you shortly to confirm your slot.</p>
              <button className="btn-primary" onClick={() => setSuccess(false)}>Book Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3>Appointment Details</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label><FiUser /> Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label><FiPhone /> Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" required />
                </div>
                <div className="form-group">
                  <label><FiMail /> Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                </div>
                <div className="form-group">
                  <label><FiTruck /> Vehicle</label>
                  <input name="vehicle" value={form.vehicle} onChange={handleChange} placeholder="e.g. Toyota Corolla 2020" required />
                </div>
                <div className="form-group">
                  <label>Service</label>
                  <select name="service" value={form.service} onChange={handleChange} required>
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id}>{s.name} — {formatPrice(s.price)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><FiCalendar /> Date</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} min={today} required />
                </div>

                {/* Time Slots with availability */}
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>
                    Preferred Time
                    {loadingSlots && <span style={{ color: 'var(--gray)', fontSize: '0.75rem', marginLeft: 8 }}>Checking availability...</span>}
                    {!loadingSlots && form.date && form.service && (
                      <span style={{ color: 'var(--gray)', fontSize: '0.75rem', marginLeft: 8 }}>
                        {bookedSlots.length > 0 ? `${bookedSlots.length} slot(s) unavailable` : 'All slots available'}
                      </span>
                    )}
                  </label>
                  <div className="time-slots">
                    {ALL_SLOTS.map(t => {
                      const isBooked = bookedSlots.includes(t);
                      const isSelected = form.timeSlot === t;
                      return (
                        <button
                          type="button"
                          key={t}
                          disabled={isBooked}
                          className={`time-slot ${isSelected ? 'active' : ''} ${isBooked ? 'booked' : ''}`}
                          onClick={() => { if (!isBooked) { setForm({ ...form, timeSlot: t }); setTimeSlotError(false); } }}
                          title={isBooked ? 'This slot is already booked' : t}
                        >
                          {t}
                          {isBooked && <span className="slot-booked-label">Taken</span>}
                        </button>
                      );
                    })}
                  </div>
                  {timeSlotError && (
                    <small style={{ color: '#e63946', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: '0.85rem' }}>
                      ⚠️ Please select a time slot before confirming
                    </small>
                  )}
                  {!form.date || !form.service ? (
                    <small style={{ color: 'var(--gray)', marginTop: 6, display: 'block' }}>
                      Select a service and date to see available slots
                    </small>
                  ) : null}
                </div>

                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Additional Notes</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Describe your issue or any special requests..." />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                disabled={loading}
              >
                {loading ? 'Booking...' : '🗓 Confirm Appointment'}
              </button>
              {!form.timeSlot && (
                <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.8rem', marginTop: 8 }}>
                  ⏰ Select a time slot above to enable booking
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
