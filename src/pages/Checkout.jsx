import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', phone:'', address:'', city:'', postalCode:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({ product: i._id, name: i.name, image: i.images?.[0], price: i.price, size: i.size, color: i.color, quantity: i.quantity })),
        shippingAddress: form,
        totalPrice: total,
        paymentMethod: 'COD',
      });
      clearCart();
      setSuccess(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  if (success) return (
    <div className="checkout-success">
      <FiCheckCircle size={80} color="var(--primary)" />
      <h2>Order Placed!</h2>
      <p>Thank you for your order. We'll contact you for delivery.</p>
      <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
    </div>
  );

  return (
    <div className="checkout-page">
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <h1 className="section-title">Check<span>out</span></h1>
        <div className="checkout-inner">
          <form onSubmit={handleSubmit} className="checkout-form card">
            <h3>Shipping Information</h3>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" required />
              </div>
              <div className="form-group">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal code" />
              </div>
            </div>
            <div className="payment-method">
              <h4>Payment Method</h4>
              <div className="payment-option active">
                <span>💵</span> Cash on Delivery (COD)
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
              {loading ? 'Placing Order...' : '✅ Place Order'}
            </button>
          </form>

          <div className="order-review card">
            <h3>Order Review</h3>
            {cart.map((item, i) => (
              <div key={i} className="order-item">
                <span>{item.name}{item.size ? ` (${item.size})` : ''}{item.color ? ` · ${item.color}` : ''}</span>
                <span>x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>Total</strong>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
