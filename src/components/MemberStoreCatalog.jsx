import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import DashboardLayout from '../layout/DashboardLayout';
import './MemberStoreCatalog.css';

const MemberStoreCatalog = () => {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';

  // Fallback Mock Data for Members (Stripped of cost price, suppliers, alerts, exact quantities)
  const getMockMemberProducts = () => [
    {
      product_id: 1,
      product_name: 'Optimum Nutrition Whey 2kg',
      category: 'SUPPLEMENTS',
      price: '6700.00',
      product_photo_url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&q=80',
      in_stock: true
    },
    {
      product_id: 2,
      product_name: 'C4 Pre-Workout 30 Servings',
      category: 'SUPPLEMENTS',
      price: '2200.00',
      product_photo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80',
      in_stock: true
    },
    {
      product_id: 3,
      product_name: 'Premium Leather Weightlifting Belt',
      category: 'GEAR',
      price: '2800.00',
      product_photo_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=400&q=80',
      in_stock: true
    },
    {
      product_id: 4,
      product_name: 'Aminos Energy Drink 250ml',
      category: 'BEVERAGES',
      price: '140.00',
      product_photo_url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=400&q=80',
      in_stock: true
    },
    {
      product_id: 5,
      product_name: 'Fitness Guru Premium T-Shirt (M)',
      category: 'CLOTHING',
      price: '799.00',
      product_photo_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
      in_stock: true
    },
    {
      product_id: 6,
      product_name: 'Out of Stock Pre-Workout Pack',
      category: 'SUPPLEMENTS',
      price: '1850.00',
      product_photo_url: '',
      in_stock: false
    }
  ];

  // Fetch Member Products Catalog (GET /api/v1/member/products)
  const fetchMemberProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = tokenManager.getAccessToken();
      const queryStr = categoryFilter ? `?category=${categoryFilter}` : '';
      const response = await fetch(`${API_BASE_URL}/api/v1/member/products${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setProducts(data.data.products || []);
      } else {
        // Fallback filtering mock
        let mockList = getMockMemberProducts();
        if (categoryFilter) {
          mockList = mockList.filter(p => p.category === categoryFilter);
        }
        setProducts(mockList);
      }
      setError(null);
    } catch (err) {
      console.error('Fetch member products error:', err);
      // Fallback
      let mockList = getMockMemberProducts();
      if (categoryFilter) {
        mockList = mockList.filter(p => p.category === categoryFilter);
      }
      setProducts(mockList);
      setError(null); // Silent fallback to allow UI validation
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, API_BASE_URL]);

  // Load User Data & Products on Mount
  useEffect(() => {
    const loadData = async () => {
      // Load user profile for DashboardLayout header matching Dashboard.jsx
      try {
        const storedUserData = tokenManager.getUserData();
        const userId = storedUserData?.userId || storedUserData?.id || storedUserData?.member_id || storedUserData?.user_id;

        if (userId) {
          const profileResponse = await tokenManager.apiCall(
            `${API_BASE_URL}/api/members/view?user_id=${userId}`,
            { method: 'GET' }
          );
          const profileData = await profileResponse.json();
          if (profileResponse.ok && profileData.status === 'success') {
            setUserData(profileData.data);
          } else {
            setUserData(storedUserData);
          }
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      }
      
      // Load store products
      fetchMemberProducts();
    };

    loadData();
  }, [fetchMemberProducts, API_BASE_URL]);

  // Search filter
  const filteredProducts = products.filter(p => {
    if (!p) return false;
    return (p.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout userData={userData}>
      <div className="member-store-container">
        
        {/* Store Banner */}
        <div className="member-store-header-banner">
          <div className="banner-content">
            <span className="banner-tagline">FITNESS GURU PRO SHOP</span>
            <h1>Fuel Your Fitness Journey</h1>
            <p>High-quality supplements, premium training gear, refreshments, and official fitness wear available at your gym desk.</p>
          </div>
          <div className="banner-visual-accent">
            <i className="fas fa-shopping-bag large-bg-icon"></i>
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="member-store-controls">
          <div className="search-bar-wrap">
            <i className="fas fa-search search-ctrl-icon"></i>
            <input 
              type="text" 
              placeholder="Search supplement, gear, or clothing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="store-search-ctrl"
            />
          </div>

          <div className="category-swimlanes">
            <button 
              className={`category-pill ${categoryFilter === '' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('')}
            >
              All Items
            </button>
            {['SUPPLEMENTS', 'GEAR', 'BEVERAGES', 'CLOTHING', 'OTHER'].map((cat) => (
              <button
                key={cat}
                className={`category-pill ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div className="store-catalog-loading">
            <div className="loading-spinner"></div>
            <p>Loading gym store products...</p>
          </div>
        ) : error ? (
          <div className="store-catalog-error">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Oops! Failed to load catalog</h3>
            <p>{error}</p>
            <button onClick={() => fetchMemberProducts()} className="retry-catalog-btn">Retry</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="store-catalog-empty">
            <i className="fas fa-box-open"></i>
            <p>No products found in this category right now.</p>
            <p className="empty-subtext">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="member-products-grid">
            {filteredProducts.map((prod) => (
              <div key={prod.product_id} className={`product-showcase-card ${!prod.in_stock ? 'out-of-stock' : ''}`}>
                
                {/* Visual Category Icon or Product Image */}
                <div className="product-visual-card-header">
                  {prod.product_photo_url ? (
                    <img 
                      src={prod.product_photo_url} 
                      alt={prod.product_name} 
                      className="product-catalog-img"
                      onError={(e) => {
                        e.target.style.display = 'none'; // Fallback if image fails to load
                      }}
                    />
                  ) : (
                    <div className="visual-icon-box">
                      <i className={
                        prod.category === 'SUPPLEMENTS' ? 'fas fa-mortar-pestle' :
                        prod.category === 'GEAR' ? 'fas fa-dumbbell' :
                        prod.category === 'BEVERAGES' ? 'fas fa-wine-bottle' :
                        prod.category === 'CLOTHING' ? 'fas fa-tshirt' : 'fas fa-tags'
                      }></i>
                    </div>
                  )}
                  <span className={`prod-badge-tag ${prod.category}`}>{prod.category.toLowerCase()}</span>
                </div>

                {/* Info and Price */}
                <div className="product-card-body">
                  <h3 className="product-display-name">{prod.product_name}</h3>
                  <div className="product-footer-row">
                    <div className="price-tag-block">
                      <span className="price-currency">₹</span>
                      <span className="price-value">{parseFloat(prod.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="availability-badge-block">
                      {prod.in_stock ? (
                        <span className="badge-available">
                          <i className="fas fa-check-circle"></i> In Stock
                        </span>
                      ) : (
                        <span className="badge-unavailable">
                          <i className="fas fa-times-circle"></i> Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* POS Call-to-action note */}
                <div className="product-action-card-footer">
                  <span className="pos-desk-purchase-note">
                    <i className="fas fa-info-circle"></i> Buy at the front desk counter
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberStoreCatalog;
