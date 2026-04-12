import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data);
      setSelectedSize(r.data.sizes?.[0] || '');
      setSelectedColor(r.data.colors?.[0] || '');
    });
  }, [id]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
  };

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      return toast.error('Please select a size');
    }
    addToCart(product, selectedSize, selectedColor, qty);
    setAdded(true);
    toast.success('Added to cart!');
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <div className="spinner" style={{ marginTop: '200px' }} />;

  return (
    <div className="product-detail-page">
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
        <Link to="/shop" className="back-link"><FiArrowLeft /> Back to Shop</Link>
        <div className="pd-inner">
          {/* Images */}
          <div className="pd-images">
            <div className="pd-main-img">
              {getImageUrl(product.images?.[activeImg]) ? (
                <img src={getImageUrl(product.images[activeImg])} alt={product.name} />
              ) : (
                <div className="pd-img-placeholder">👕</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbnails">
                {product.images.map((img, i) => (
                  <button key={i} className={`pd-thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                    <img src={getImageUrl(img)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="pd-price">
              <span className="price">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="original-price">{formatPrice(product.originalPrice)}</span>
              )}              {product.originalPrice && (
                <span className="discount-badge">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>
            <p className="pd-desc">{product.description}</p>

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="pd-option">
                <label>
                  Size: <strong>{selectedSize || 'Select a size'}</strong>
                  {!selectedSize && <span className="required-hint"> *required</span>}
                </label>
                <div className="option-btns">
                  {product.sizes.map(s => (
                    <button key={s}
                      className={`option-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => setSelectedSize(s)}>
                      {selectedSize === s && <FiCheck size={12} style={{ marginRight: 4 }} />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="pd-option">
                <label>Color: <strong>{selectedColor}</strong></label>
                <div className="option-btns">
                  {product.colors.map(c => (
                    <button key={c}
                      className={`option-btn ${selectedColor === c ? 'active' : ''}`}
                      onClick={() => setSelectedColor(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pd-qty">
              <label>Quantity:</label>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><FiMinus /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}><FiPlus /></button>
              </div>
            </div>

            <button
              className={`btn-primary pd-add-btn ${added ? 'added' : ''}`}
              onClick={handleAdd}
              disabled={product.stock === 0}>
              {product.stock === 0
                ? 'Out of Stock'
                : added
                  ? <><FiCheck /> Added to Cart</>
                  : <><FiShoppingCart /> Add to Cart</>
              }
            </button>

            <div className="pd-meta">
              <span>Brand: {product.brand || 'Everest Auto Hub'}</span>
              <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
                {product.stock > 0 ? `✅ ${product.stock} in stock` : '❌ Out of stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
