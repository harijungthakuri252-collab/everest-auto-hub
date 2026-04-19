import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiFilter, FiEye, FiZap, FiStar, FiChevronDown, FiX } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import './Shop.css';

const categories = ['All', 'T-Shirts', 'Hoodies', 'Caps', 'Jackets', 'Accessories'];
const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'newest',     label: 'Newest Arrivals' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Avg. Customer Review' },
  { value: 'bestseller', label: 'Best Sellers' },
];

function StarRating({ rating, count, size = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', gap: 1 }}>
        {[1,2,3,4,5].map(i => (
          <FiStar key={i} size={size}
            fill={i <= Math.round(rating) ? '#ffd60a' : 'none'}
            color={i <= Math.round(rating) ? '#ffd60a' : '#555'} />
        ))}
      </div>
      {count !== undefined && (
        <span style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>({count})</span>
      )}
    </div>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  // Filters
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then(r => {
      setProducts(r.data);
      const max = Math.max(...r.data.map(p => p.price), 100);
      setMaxPrice(max);
      setPriceRange([0, max]);
      setLoading(false);
    });
    api.get('/site-content').then(r => setSiteContent(r.data)).catch(() => setSiteContent({}));
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [category, search, sort, priceRange, minRating]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== 'All') result = result.filter(p => p.category === category);
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()));
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (minRating > 0) result = result.filter(p => (p.rating || 0) >= minRating);

    switch (sort) {
      case 'newest':     result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'price-asc':  result.sort((a,b) => a.price - b.price); break;
      case 'price-desc': result.sort((a,b) => b.price - a.price); break;
      case 'rating':     result.sort((a,b) => (b.rating||0) - (a.rating||0)); break;
      case 'bestseller': result.sort((a,b) => (b.soldCount||0) - (a.soldCount||0)); break;
      default: result.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return result;
  }, [products, category, search, sort, priceRange, minRating]);

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img}`;
  };

  const handleAddToCart = (product) => {
    const size = selectedSizes[product._id];
    if (product.sizes?.length > 0 && !size) { toast.error('Please select a size first'); return; }
    addToCart(product, size || 'One Size', product.colors?.[0] || '');
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    const size = selectedSizes[product._id];
    if (product.sizes?.length > 0 && !size) { toast.error('Please select a size first'); return; }
    addToCart(product, size || 'One Size', product.colors?.[0] || '');
    navigate('/checkout');
  };

  const selectSize = (productId, size) => setSelectedSizes(prev => ({ ...prev, [productId]: size }));

  const sc = siteContent || {};
  const discount = (p) => p.originalPrice ? Math.round((1 - p.price/p.originalPrice)*100) : 0;

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
        {/* Top bar — search + sort */}
        <div className="shop-topbar">
          <div className="search-box">
            <FiSearch />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ background:'none',border:'none',color:'var(--gray)',cursor:'pointer' }}><FiX size={14}/></button>}
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter size={14} /> Filters {showFilters ? '▲' : '▼'}
            </button>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="shop-layout">
          {/* Sidebar filters */}
          <aside className={`shop-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filter-section">
              <h4>Category</h4>
              {categories.map(c => (
                <label key={c} className="filter-radio">
                  <input type="radio" name="category" checked={category===c} onChange={() => setCategory(c)} />
                  <span>{c}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <span style={{ fontSize:'0.8rem', color:'var(--gray)' }}>{formatPrice(priceRange[0])}</span>
                <span style={{ fontSize:'0.8rem', color:'var(--gray)', marginLeft:'auto' }}>{formatPrice(priceRange[1])}</span>
              </div>
              <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                style={{ width:'100%', accentColor:'var(--primary)' }} />
            </div>

            <div className="filter-section">
              <h4>Avg. Customer Review</h4>
              {[4,3,2,1].map(r => (
                <label key={r} className="filter-radio" onClick={() => setMinRating(minRating===r ? 0 : r)}>
                  <input type="radio" readOnly checked={minRating===r} />
                  <StarRating rating={r} size={12} />
                  <span style={{ fontSize:'0.78rem', color:'var(--gray)' }}> & Up</span>
                </label>
              ))}
            </div>

            {(category !== 'All' || search || minRating > 0 || priceRange[1] < maxPrice) && (
              <button className="clear-filters-btn" onClick={() => { setCategory('All'); setSearch(''); setMinRating(0); setPriceRange([0, maxPrice]); }}>
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Product grid */}
          <div className="shop-main">
            <div className="results-bar">
              <span className="results-count">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                {search && ` for "${search}"`}
                {category !== 'All' && ` in ${category}`}
              </span>
            </div>

            {loading ? <div className="spinner" /> : (
              <>
                <div className="grid-4">
                  {paginated.map(p => (
                    <div key={p._id} className="product-card card">
                      <Link to={`/shop/${p._id}`} className="product-img">
                        {getImageUrl(p.images?.[0]) ? (
                          <img src={getImageUrl(p.images[0])} alt={p.name} />
                        ) : (
                          <div className="product-img-placeholder">👕</div>
                        )}
                        {p.isFeatured && <span className="badge product-badge">Featured</span>}
                        {discount(p) > 0 && <span className="badge badge-warning sale-badge">-{discount(p)}%</span>}
                        {p.stock > 0 && p.stock <= 5 && <span className="low-stock-badge">Only {p.stock} left!</span>}
                        {p.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
                      </Link>

                      <div className="product-info">
                        <span className="product-category">{p.category}</span>
                        <h3><Link to={`/shop/${p._id}`}>{p.name}</Link></h3>

                        {/* Rating */}
                        {p.numReviews > 0 ? (
                          <Link to={`/shop/${p._id}#reviews`} style={{ textDecoration:'none' }}>
                            <StarRating rating={p.rating} count={p.numReviews} />
                          </Link>
                        ) : (
                          <span style={{ fontSize:'0.75rem', color:'var(--gray)' }}>No reviews yet</span>
                        )}

                        <div className="product-price">
                          <span className="price">{formatPrice(p.price)}</span>
                          {p.originalPrice && <span className="original-price">{formatPrice(p.originalPrice)}</span>}
                        </div>

                        {/* Size selector */}
                        {p.sizes?.length > 0 && (
                          <div className="product-sizes">
                            {p.sizes.map(s => (
                              <button key={s} type="button"
                                className={`size-tag-btn ${selectedSizes[p._id] === s ? 'size-tag-active' : ''}`}
                                onClick={() => selectSize(p._id, s)}>
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                        {p.sizes?.length > 0 && !selectedSizes[p._id] && (
                          <small style={{ color:'var(--gray)', fontSize:'0.72rem', display:'block', marginBottom:6 }}>👆 Select a size</small>
                        )}

                        <div className="product-card-actions">
                          <button className="btn-cart-icon" onClick={() => handleAddToCart(p)} title="Add to Cart" disabled={p.stock===0}>
                            <FiShoppingCart size={17} />
                          </button>
                          <button className="btn-buy-now" onClick={() => handleBuyNow(p)} disabled={p.stock===0}>
                            <FiZap size={14} /> {p.stock===0 ? 'Out of Stock' : 'Buy Now'}
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
                    <p>No products found. Try adjusting your filters.</p>
                    <button className="btn-outline" onClick={() => { setCategory('All'); setSearch(''); setMinRating(0); setPriceRange([0, maxPrice]); }}>
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>‹ Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i+1).map(n => (
                      <button key={n} className={`page-btn ${page===n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                    ))}
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next ›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
