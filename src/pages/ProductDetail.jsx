import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus, FiCheck, FiZoomIn,
         FiChevronLeft, FiChevronRight, FiX, FiStar, FiZap, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const IMG_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StarRating({ rating, count, size = 16, interactive, onRate }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={size}
          fill={i <= Math.round(rating) ? '#ffd60a' : 'none'}
          color={i <= Math.round(rating) ? '#ffd60a' : '#555'}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && onRate && onRate(i)} />
      ))}
      {count !== undefined && <span style={{ fontSize:'0.82rem', color:'var(--gray)' }}>({count} reviews)</span>}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
      <span style={{ fontSize:'0.78rem', color:'var(--gray)', width:40, flexShrink:0 }}>{star} star</span>
      <div style={{ flex:1, height:8, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'#ffd60a', borderRadius:4, transition:'width 0.4s' }} />
      </div>
      <span style={{ fontSize:'0.78rem', color:'var(--gray)', width:24, textAlign:'right' }}>{count}</span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('newest');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${IMG_BASE}${img}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data);
      setSelectedSize(r.data.sizes?.[0] || '');
      setSelectedColor(r.data.colors?.[0] || '');
    });
    api.get(`/products/${id}/related`).then(r => setRelated(r.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    api.get(`/reviews?productId=${id}&sort=${reviewSort}`).then(r => setReviews(r.data)).catch(() => {});
  }, [id, reviewSort]);

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    if (product.stock === 0) return toast.error('Out of stock');
    addToCart(product, selectedSize, selectedColor, qty);
    setAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    if (product.stock === 0) return toast.error('Out of stock');
    addToCart(product, selectedSize, selectedColor, qty);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave a review');
    if (!reviewForm.comment.trim()) return toast.error('Please write a comment');
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { productId: id, ...reviewForm });
      toast.success('Review submitted! It will appear after admin approval.');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmittingReview(false);
  };

  const markHelpful = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpful: (r.helpful||0)+1 } : r));
    } catch {}
  };

  if (!product) return <div className="spinner" style={{ marginTop:'200px' }} />;

  const discount = product.originalPrice ? Math.round((1 - product.price/product.originalPrice)*100) : 0;
  const ratingCounts = [5,4,3,2,1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));

  return (
    <div className="product-detail-page">
      <div className="container" style={{ paddingTop:'120px', paddingBottom:'80px' }}>
        <Link to="/shop" className="back-link"><FiArrowLeft /> Back to Shop</Link>

        {/* Main product section */}
        <div className="pd-inner">
          {/* Images */}
          <div className="pd-images">
            <div className="pd-thumbnails-left">
              {product.images?.map((img, i) => (
                <button key={i} className={`pd-thumb ${activeImg===i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                  <img src={getImageUrl(img)} alt="" />
                </button>
              ))}
            </div>
            <div className="pd-main-img" onClick={() => setLightbox(true)} style={{ cursor:'zoom-in', position:'relative' }}>
              {getImageUrl(product.images?.[activeImg]) ? (
                <img src={getImageUrl(product.images[activeImg])} alt={product.name} />
              ) : (
                <div className="pd-img-placeholder">👕</div>
              )}
              <div className="pd-zoom-hint"><FiZoomIn size={16} /> Click to zoom</div>
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">
            <span className="product-category">{product.category}</span>
            <h1 className="pd-title">{product.name}</h1>
            <span style={{ fontSize:'0.8rem', color:'var(--gray)' }}>by <strong style={{ color:'var(--primary)' }}>{product.brand || 'Everest Auto Hub'}</strong></span>

            {/* Rating summary */}
            <div style={{ margin:'10px 0', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <StarRating rating={product.rating||0} count={product.numReviews||0} />
              <a href="#reviews" style={{ fontSize:'0.82rem', color:'var(--primary)' }}>
                {product.numReviews > 0 ? `See all ${product.numReviews} reviews` : 'Be the first to review'}
              </a>
            </div>

            <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.06)', margin:'12px 0' }} />

            {/* Price */}
            <div className="pd-price">
              <span className="price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="original-price">{formatPrice(product.originalPrice)}</span>
                  <span className="discount-badge">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div style={{ margin:'8px 0 16px' }}>
              {product.stock === 0 ? (
                <span style={{ color:'#e63946', fontWeight:700 }}>❌ Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span style={{ color:'#e63946', fontWeight:600 }}>⚠️ Only {product.stock} left in stock — order soon</span>
              ) : (
                <span style={{ color:'#2d6a4f', fontWeight:600 }}>✅ In Stock</span>
              )}
            </div>

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div className="pd-option">
                <label>Size: <strong>{selectedSize || 'Select a size'}</strong>
                  {!selectedSize && <span style={{ color:'#e63946', fontSize:'0.78rem' }}> *required</span>}
                </label>
                <div className="option-btns">
                  {product.sizes.map(s => (
                    <button key={s} className={`option-btn ${selectedSize===s ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>
                      {selectedSize===s && <FiCheck size={11} style={{ marginRight:3 }} />}{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors?.length > 0 && (
              <div className="pd-option">
                <label>Color: <strong>{selectedColor}</strong></label>
                <div className="option-btns">
                  {product.colors.map(c => (
                    <button key={c} className={`option-btn ${selectedColor===c ? 'active' : ''}`} onClick={() => setSelectedColor(c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pd-qty">
              <label>Quantity:</label>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q-1))}><FiMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock||99, q+1))}><FiPlus /></button>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex', gap:10, marginTop:'1rem' }}>
              <button className={`btn-primary pd-add-btn ${added ? 'added' : ''}`} onClick={handleAdd} disabled={product.stock===0} style={{ flex:1 }}>
                {product.stock===0 ? 'Out of Stock' : added ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart</>}
              </button>
              <button className="btn-buy-now-pd" onClick={handleBuyNow} disabled={product.stock===0}>
                <FiZap size={15} /> Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="pd-trust">
              <div className="trust-item"><FiTruck size={16} /><span>Free Delivery</span></div>
              <div className="trust-item"><FiShield size={16} /><span>Secure Payment</span></div>
              <div className="trust-item"><FiRefreshCw size={16} /><span>Easy Returns</span></div>
            </div>

            {/* Description */}
            <div className="pd-desc-section">
              <h4>About this item</h4>
              <p className="pd-desc">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div id="reviews" className="pd-reviews-section">
          <div className="reviews-header">
            <h2>Customer Reviews</h2>
            {!showReviewForm && (
              <button className="btn-outline" onClick={() => { if (!user) { toast.error('Please login to review'); return; } setShowReviewForm(true); }}>
                Write a Review
              </button>
            )}
          </div>

          {/* Rating summary */}
          {reviews.length > 0 && (
            <div className="rating-summary">
              <div className="rating-big">
                <span className="rating-number">{(product.rating||0).toFixed(1)}</span>
                <StarRating rating={product.rating||0} size={20} />
                <span style={{ color:'var(--gray)', fontSize:'0.82rem' }}>{product.numReviews} ratings</span>
              </div>
              <div className="rating-bars">
                {ratingCounts.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviews.length} />
                ))}
              </div>
            </div>
          )}

          {/* Review form */}
          {showReviewForm && (
            <div className="review-form card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h4>Your Review</h4>
                <button onClick={() => setShowReviewForm(false)} style={{ background:'none', border:'none', color:'var(--gray)', cursor:'pointer' }}><FiX /></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Rating *</label>
                  <StarRating rating={reviewForm.rating} size={28} interactive onRate={r => setReviewForm(f => ({ ...f, rating: r }))} />
                </div>
                <div className="form-group">
                  <label>Review Title</label>
                  <input value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Summarize your experience" />
                </div>
                <div className="form-group">
                  <label>Review *</label>
                  <textarea rows={4} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="What did you like or dislike? How was the quality?" required />
                </div>
                <button type="submit" className="btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Sort reviews */}
          {reviews.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'1.5rem 0 1rem' }}>
              <span style={{ color:'var(--gray)', fontSize:'0.85rem' }}>Sort by:</span>
              {['newest','highest','lowest','helpful'].map(s => (
                <button key={s} onClick={() => setReviewSort(s)}
                  style={{ background: reviewSort===s ? 'rgba(249,115,22,0.15)' : 'var(--dark-2)', border: `1px solid ${reviewSort===s ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`, color: reviewSort===s ? 'var(--primary)' : 'var(--gray)', padding:'5px 12px', borderRadius:20, cursor:'pointer', fontSize:'0.78rem', fontFamily:'var(--font-body)' }}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Review list */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--gray)' }}>
                <FiStar size={32} style={{ opacity:0.3, marginBottom:8 }} />
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : reviews.map(r => (
              <div key={r._id} className="review-item card">
                <div className="review-top">
                  <div className="review-avatar">{r.name[0]}</div>
                  <div>
                    <strong>{r.name}</strong>
                    {r.verified && <span className="verified-badge">✅ Verified Purchase</span>}
                    <div style={{ marginTop:3 }}><StarRating rating={r.rating} size={13} /></div>
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--gray)' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-AU', { year:'numeric', month:'short', day:'numeric' })}
                  </span>
                </div>
                {r.title && <h4 className="review-title">{r.title}</h4>}
                <p className="review-comment">{r.comment}</p>
                <button className="helpful-btn" onClick={() => markHelpful(r._id)}>
                  👍 Helpful ({r.helpful||0})
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="pd-related">
            <h2>Customers Also Bought</h2>
            <div className="grid-4">
              {related.map(p => (
                <Link key={p._id} to={`/shop/${p._id}`} className="related-card card">
                  <div className="related-img">
                    {getImageUrl(p.images?.[0]) ? <img src={getImageUrl(p.images[0])} alt={p.name} /> : <span>👕</span>}
                  </div>
                  <div style={{ padding:'10px' }}>
                    <p style={{ fontSize:'0.85rem', color:'var(--light)', margin:'0 0 4px', fontWeight:600 }}>{p.name}</p>
                    {p.numReviews > 0 && <StarRating rating={p.rating} count={p.numReviews} size={12} />}
                    <p style={{ color:'var(--primary)', fontWeight:700, margin:'4px 0 0' }}>{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && product.images?.length > 0 && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <button className="lightbox-close" onClick={() => setLightbox(false)}><FiX size={22} /></button>
          {product.images.length > 1 && (
            <button className="lightbox-nav lightbox-prev" onClick={e => { e.stopPropagation(); setActiveImg(i => (i-1+product.images.length)%product.images.length); }}><FiChevronLeft size={26} /></button>
          )}
          <div className="lightbox-img-wrap" onClick={e => e.stopPropagation()}>
            <img src={getImageUrl(product.images[activeImg])} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <button className="lightbox-nav lightbox-next" onClick={e => { e.stopPropagation(); setActiveImg(i => (i+1)%product.images.length); }}><FiChevronRight size={26} /></button>
          )}
          <div className="lightbox-dots">
            {product.images.map((_,i) => <span key={i} className={`lightbox-dot ${i===activeImg?'active':''}`} onClick={e => { e.stopPropagation(); setActiveImg(i); }} />)}
          </div>
        </div>
      )}
    </div>
  );
}
