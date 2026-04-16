import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiLock, FiCreditCard } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── Payment form inside Stripe Elements ──────────────────
function StripePaymentForm({ clientSecret, validatedItems, shippingAddress, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm order in our backend
        await api.post('/payment/confirm-order', {
          paymentIntentId: paymentIntent.id,
          items: validatedItems,
          shippingAddress,
        });
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      <button
        type="submit"
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
        disabled={!stripe || loading}
      >
        <FiLock size={16} />
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.75rem', marginTop: 10 }}>
        🔒 Secured by Stripe · Google Pay · Apple Pay · Cards accepted
      </p>
    </form>
  );
}

// ── Main Checkout page ────────────────────────────────────
export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', postalCode: '' });
  const [step, setStep] = useState('details'); // 'details' | 'payment' | 'success'
  const [clientSecret, setClientSecret] = useState('');
  const [validatedItems, setValidatedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'cod'

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city)
      return toast.error('Please fill in all required fields');

    if (paymentMethod === 'cod') {
      // COD — place order directly
      setLoading(true);
      try {
        await api.post('/orders', {
          items: cart.map(i => ({ product: i._id, name: i.name, image: i.images?.[0], price: i.price, size: i.size, color: i.color, quantity: i.quantity })),
          shippingAddress: form,
          paymentMethod: 'COD',
          totalPrice: total,
        });
        clearCart();
        setStep('success');
        toast.success('Order placed!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Order failed');
      }
      setLoading(false);
      return;
    }

    // Stripe — create payment intent
    setLoading(true);
    try {
      const { data } = await api.post('/payment/create-intent', {
        items: cart.map(i => ({ product: i._id, name: i.name, price: i.price, size: i.size, color: i.color, quantity: i.quantity })),
      });
      setClientSecret(data.clientSecret);
      setValidatedItems(data.validatedItems);
      setStep('payment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment');
    }
    setLoading(false);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setStep('success');
    toast.success('Payment successful! Order placed.');
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--gray)' }}>Your cart is empty</p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Browse Shop</button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="checkout-success">
        <FiCheckCircle size={80} color="var(--primary)" />
        <h2>Order Placed!</h2>
        <p>Thank you for your order. We'll contact you for delivery.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
      </div>
    );
  }

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#f97316',
        colorBackground: '#141414',
        colorText: '#f8f9fa',
        colorDanger: '#e63946',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
      },
    },
  } : null;

  return (
    <div className="checkout-page">
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <div className="checkout-inner">

          {/* Left — Form */}
          <div className="checkout-form card">
            {step === 'details' && (
              <>
                <h3><FiCreditCard /> Checkout</h3>

                <form onSubmit={handleDetailsSubmit}>
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem' }}>Shipping Details</h4>
                  <div className="grid-2">
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label>Full Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61 4XX XXX XXX" required />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input name="city" value={form.city} onChange={handleChange} placeholder="Sydney" required />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label>Address *</label>
                      <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" required />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="2000" />
                    </div>
                  </div>

                  {/* Payment method selector */}
                  <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, margin: '1.5rem 0 1rem' }}>Payment Method</h4>
                  <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
                    <button type="button"
                      onClick={() => setPaymentMethod('stripe')}
                      style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius)', border: `2px solid ${paymentMethod === 'stripe' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, background: paymentMethod === 'stripe' ? 'rgba(249,115,22,0.1)' : 'var(--dark-2)', color: 'var(--light)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
                      💳 Card / Google Pay / Apple Pay
                    </button>
                    <button type="button"
                      onClick={() => setPaymentMethod('cod')}
                      style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius)', border: `2px solid ${paymentMethod === 'cod' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, background: paymentMethod === 'cod' ? 'rgba(249,115,22,0.1)' : 'var(--dark-2)', color: 'var(--light)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'var(--font-body)' }}>
                      💵 Cash on Delivery
                    </button>
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={loading}>
                    {loading ? 'Processing...' : paymentMethod === 'stripe' ? '→ Continue to Payment' : '✓ Place Order (COD)'}
                  </button>
                </form>
              </>
            )}

            {step === 'payment' && clientSecret && stripeOptions && (
              <>
                <h3><FiLock /> Secure Payment</h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Complete your payment below. Use test card: <code style={{ color: 'var(--primary)' }}>4242 4242 4242 4242</code>
                </p>
                <Elements stripe={stripePromise} options={stripeOptions}>
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    validatedItems={validatedItems}
                    shippingAddress={form}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
                <button type="button" onClick={() => setStep('details')}
                  style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', marginTop: 12, fontSize: '0.85rem' }}>
                  ← Back to details
                </button>
              </>
            )}
          </div>

          {/* Right — Order summary */}
          <div className="order-review card">
            <h3>Order Summary</h3>
            {cart.map((item, i) => (
              <div key={i} className="order-item">
                <span>{item.name}{item.size ? ` (${item.size})` : ''}{item.color ? ` · ${item.color}` : ''} ×{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>Total</strong>
              <strong style={{ color: 'var(--primary)' }}>{formatPrice(total)}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
