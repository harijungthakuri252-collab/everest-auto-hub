import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiFilter, FiEye, FiZap } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import './Shop.css';

const categories = ['All', 'T-Shirts', 'Hoodies', 'Caps', 'Jackets', 'Accessories'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then(r => { setProducts(r.data); setFiltered(r.data); setLoading(false); });
    api.get('/site-content').then(r => setSiteContent(r.data)).catch(() => setSiteContent({}));
  }, []);

  useEffect(() => {
    let result = products;
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, search, products]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
  };

  const handleAddToCart = (product) => {
    const size = selectedSizes[product._id];
    if (product.sizes?.length > 0 && !size) {
      toast.error('Please select a size first');
      return;
    }
    addToCart(product, size || 'One Size', product.colors?.[0] || '');
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    const size = selectedSizes[product._id];
    if (product.sizes?.length > 0 && !size) {
      toast.error('Please select a size first');
      return;
    }
    addToCart(product, size || 'One Size', product.colors?.[0] || '');
    navigate('/checkout');
  };

  const selectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const sc = siteContent || {};

  return (
    <div className="shop-page">
      <div className="page-hero">
        <div className="container">
          <p className="section-tag">{sc.shopHeroTag || 'Everest Clothing'}</p>
          <h1 className="section-title">Our <span>Shop</span></h1>
          <p className="section-subtitle">{sc.shopHeroSubtitle || 'Premium automotive lifestyle clothing'}</p>
        </div>
      </div>

      <div className="container shop-container">
        <div className="shop-filters">
          <div className="search-box">
            <FiSearch />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="category-filters">
            <FiFilter />
            {categories.map(c => (
              <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            <p className="results-count">{filtered.length} products found</p>
            <div className="grid-4">
              {filtered.map(p => (
                <div key={p._id} className="product-card card">
                  <Link to={`/shop/${p._id}`} className="product-img">
                    {getImageUrl(p.images?.[0]) ? (
                      <img src={getImageUrl(p.images[0])} alt={p.name} />
                    ) : (
                      <div className="product-img-placeholder">👕</div>
                    )}
                    {p.isFeatured && <span className="badge product-badge">Featured</span>}
                    {p.originalPrice && <span className="badge badge-warning sale-badge">Sale</span>}
                  </Link>
                  <div className="product-info">
                    <span className="product-category">{p.category}</span>
                    <h3><Link to={`/shop/${p._id}`}>{p.name}</Link></h3>
                    <div className="product-price">
                      <span className="price">{formatPrice(p.price)}</span>
                      {p.originalPrice && <span className="original-price">{formatPrice(p.originalPrice)}</span>}
                    </div>
                    {p.sizes?.length > 0 && (
                      <div className="product-sizes">
                        {p.sizes.map(s => (
                          <button
                            key={s}
                            type="button"
                            className={`size-tag size-tag-btn ${selectedSizes[p._id] === s ? 'size-tag-active' : ''}`}
                            onClick={() => selectSize(p._id, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {p.sizes?.length > 0 && !selectedSizes[p._id] && (
                      <small style={{ color: 'var(--gray)', fontSize: '0.75rem', marginBottom: 6, display: 'block' }}>
                        👆 Select a size
                      </small>
                    )}
                    <div className="product-card-actions">
                      <button className="btn-cart-icon" onClick={() => handleAddToCart(p)} title="Add to Cart">
                        <FiShoppingCart size={17} />
                      </button>
                      <button className="btn-buy-now" onClick={() => handleBuyNow(p)}>
                        <FiZap size={14} /> Buy Now
                      </button>
                      <Link to={`/shop/${p._id}`} className="btn-view-btn" title="View Details">
                        <FiEye />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty-state">
                <p>No products found. Try a different search or category.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* No modal needed - sizes selected inline on card */}
    </div>
  );
}
