import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import './Cart.css';

export default function Cart() {
  const { cart, removeFromCart, updateQty, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const handleCheckout = () => {
    if (!user) return navigate('/login?redirect=/checkout');
    navigate('/checkout');
  };

  if (cart.length === 0) return (
    <div className="empty-cart">
      <FiShoppingBag size={60} />
      <h2>Your cart is empty</h2>
      <p>Add some items from our shop</p>
      <Link to="/shop" className="btn-primary">Browse Shop</Link>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <h1 className="section-title">Shopping <span>Cart</span></h1>
        <div className="cart-inner">
          <div className="cart-items">
            {cart.map((item, i) => (
              <div key={i} className="cart-item card">
                <div className="cart-item-img">
                  {item.images?.[0]
                    ? <img src={item.images[0].startsWith('http') ? item.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.images[0]}`} alt={item.name} />
                    : <span>👕</span>}
                </div>
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ' | '}
                    {item.color && `Color: ${item.color}`}
                  </p>
                  <span className="cart-item-price">{formatPrice(item.price)}</span>
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQty(item._id, item.size, item.color, item.quantity - 1)}><FiMinus /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.size, item.color, item.quantity + 1)}><FiPlus /></button>
                </div>
                <div className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
                <button className="cart-remove" onClick={() => removeFromCart(item._id, item.size, item.color)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="free">Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="btn-primary checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout <FiArrowRight />
            </button>
            <Link to="/shop" className="continue-shopping">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
