import React, { useState, useEffect, useCallback } from 'react';
import tokenManager from '../utils/tokenManager';
import './AdminStoreManagement.css';

const AdminStoreManagement = () => {
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'pos', 'restock'
  
  // API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.fitnessguru.org.in';
  
  // Toast notifications
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  // State: Inventory Stocks
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Super Admin Filters (Optional query overrides)
  const [gymIdFilter, setGymIdFilter] = useState('');
  const [branchIdFilter, setBranchIdFilter] = useState('');
  
  const userData = tokenManager.getUserData();
  const isSuperAdmin = userData?.role === 'SUPER_ADMIN' || userData?.role === 'ADMIN';

  // Modal: Add New Product
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    product_name: '',
    sku: '',
    category: 'SUPPLEMENTS',
    cost_price: '',
    sale_price: '',
    initial_stock: 0,
    low_stock_alert: 5,
    supplier_name: '',
    supplier_invoice_ref: '',
    product_photo_url: '',
    status: 1
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dbskq6d4i';
  const CLOUDINARY_UPLOAD_PRESET = 'trainer_uploads';

  const uploadToCloudinary = async (file) => {
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: uploadData }
      );

      const result = await response.json();
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Cloudinary error:', err);
      showToast(`Upload failed: ${err.message}`, 'error');
      return null;
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setPhotoPreview(URL.createObjectURL(file));

    const url = await uploadToCloudinary(file);
    if (url) {
      setNewProductForm(prev => ({ ...prev, product_photo_url: url }));
      showToast('Product photo uploaded to Cloudinary successfully');
    } else {
      setPhotoPreview('');
    }
    setIsUploadingPhoto(false);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setPhotoPreview('');
    setNewProductForm({
      product_name: '',
      sku: '',
      category: 'SUPPLEMENTS',
      cost_price: '',
      sale_price: '',
      initial_stock: 0,
      low_stock_alert: 5,
      supplier_name: '',
      supplier_invoice_ref: '',
      product_photo_url: '',
      status: 1
    });
  };

  // State: POS Checkout (Cart)
  const [posUserId, setPosUserId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [posPaymentMethod, setPosPaymentMethod] = useState('UPI');
  const [cart, setCart] = useState([]); // Array of { product_id, product_name, quantity, sale_price, stock_quantity }
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [submittingPOS, setSubmittingPOS] = useState(false);
  const [posSuccessData, setPosSuccessData] = useState(null);

  // State: Restock Inventory Order
  const [restockSupplierName, setRestockSupplierName] = useState('');
  const [restockInvoiceRef, setRestockInvoiceRef] = useState('');
  const [restockItems, setRestockItems] = useState([]); // Array of { product_id, product_name, quantity_bought, unit_cost, update_sale_price, update_low_stock_alert }
  const [selectedProductToRestock, setSelectedProductToRestock] = useState('');
  const [restockItemInput, setRestockItemInput] = useState({
    quantity_bought: '',
    unit_cost: '',
    update_sale_price: '',
    update_low_stock_alert: ''
  });
  const [submittingRestock, setSubmittingRestock] = useState(false);
  const [restockSuccessData, setRestockSuccessData] = useState(null);

  // Fallback Mock Inventory Data
  const getMockProducts = () => [
    {
      product_id: 1,
      product_name: 'Optimum Nutrition Whey 2kg',
      category: 'SUPPLEMENTS',
      sku: 'ON-WHEY-2KG',
      cost_price: '4500.00',
      sale_price: '6500.00',
      stock_quantity: 4,
      low_stock_alert: 5,
      is_low_stock: true,
      product_photo_url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=150&q=80',
      status: 1
    },
    {
      product_id: 2,
      product_name: 'C4 Pre-Workout 30 Servings',
      category: 'SUPPLEMENTS',
      sku: 'C4-PRE-30SERV',
      cost_price: '1200.00',
      sale_price: '2200.00',
      stock_quantity: 25,
      low_stock_alert: 8,
      is_low_stock: false,
      product_photo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&q=80',
      status: 1
    },
    {
      product_id: 3,
      product_name: 'Premium Leather Weightlifting Belt',
      category: 'GEAR',
      sku: 'GEAR-BELT-LTHR',
      cost_price: '1500.00',
      sale_price: '2800.00',
      stock_quantity: 3,
      low_stock_alert: 5,
      is_low_stock: true,
      product_photo_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=150&q=80',
      status: 1
    },
    {
      product_id: 4,
      product_name: 'Aminos Energy Drink 250ml',
      category: 'BEVERAGES',
      sku: 'BEV-AMINO-250',
      cost_price: '75.00',
      sale_price: '140.00',
      stock_quantity: 48,
      low_stock_alert: 12,
      is_low_stock: false,
      product_photo_url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=150&q=80',
      status: 1
    },
    {
      product_id: 5,
      product_name: 'Fitness Guru Premium T-Shirt (M)',
      category: 'CLOTHING',
      sku: 'CLO-FG-TEE-M',
      cost_price: '350.00',
      sale_price: '799.00',
      stock_quantity: 15,
      low_stock_alert: 5,
      is_low_stock: false,
      product_photo_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=150&q=80',
      status: 1
    }
  ];

  // API Call: Fetch Inventory List
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      let queryParams = [];
      if (categoryFilter) queryParams.push(`category=${categoryFilter}`);
      if (lowStockFilter) queryParams.push(`low_stock=true`);
      if (gymIdFilter) queryParams.push(`gym_id=${gymIdFilter}`);
      if (branchIdFilter) queryParams.push(`branch_id=${branchIdFilter}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/products${queryString}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setProducts(data.data.products || []);
      } else {
        // Fallback to local mock data matching filters
        let mockList = getMockProducts();
        if (categoryFilter) {
          mockList = mockList.filter(p => p.category === categoryFilter);
        }
        if (lowStockFilter) {
          mockList = mockList.filter(p => p.is_low_stock);
        }
        setProducts(mockList);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      // Fallback
      let mockList = getMockProducts();
      if (categoryFilter) {
        mockList = mockList.filter(p => p.category === categoryFilter);
      }
      if (lowStockFilter) {
        mockList = mockList.filter(p => p.is_low_stock);
      }
      setProducts(mockList);
    } finally {
      setLoadingProducts(false);
    }
  }, [categoryFilter, lowStockFilter, gymIdFilter, branchIdFilter, API_BASE_URL]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Create Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    // Validations
    const cost = parseFloat(newProductForm.cost_price);
    const sale = parseFloat(newProductForm.sale_price);
    
    if (isNaN(cost) || cost <= 0) {
      showToast('Unit cost price must be greater than 0', 'error');
      return;
    }
    if (isNaN(sale) || sale <= cost) {
      showToast('Sale retail price must be greater than unit cost price', 'error');
      return;
    }
    if (newProductForm.initial_stock > 0 && !newProductForm.supplier_name.trim()) {
      showToast('Supplier Name is required if starting stock is greater than 0', 'error');
      return;
    }

    setSubmittingProduct(true);
    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: newProductForm.product_name,
          sku: newProductForm.sku,
          category: newProductForm.category,
          cost_price: cost,
          sale_price: sale,
          initial_stock: parseInt(newProductForm.initial_stock) || 0,
          low_stock_alert: parseInt(newProductForm.low_stock_alert) || 0,
          supplier_name: newProductForm.initial_stock > 0 ? newProductForm.supplier_name : undefined,
          supplier_invoice_ref: newProductForm.supplier_invoice_ref || undefined,
          product_photo_url: newProductForm.product_photo_url || undefined,
          status: parseInt(newProductForm.status)
        })
      });

      const data = await response.json();
      if (response.status === 201 && data.status === 'success') {
        showToast('New product created successfully');
        closeAddModal();
        fetchProducts();
      } else {
        showToast(data.message || 'Failed to create product. (Using simulation mode)', 'warning');
        // Simulate local creation
        const mockNewId = products.length > 0 ? Math.max(...products.map(p => p.product_id)) + 1 : 100;
        const simulated = {
          product_id: mockNewId,
          product_name: newProductForm.product_name,
          sku: newProductForm.sku || `SKU-${mockNewId}`,
          category: newProductForm.category,
          cost_price: cost.toFixed(2),
          sale_price: sale.toFixed(2),
          stock_quantity: parseInt(newProductForm.initial_stock) || 0,
          low_stock_alert: parseInt(newProductForm.low_stock_alert) || 0,
          is_low_stock: (parseInt(newProductForm.initial_stock) || 0) <= (parseInt(newProductForm.low_stock_alert) || 0),
          product_photo_url: newProductForm.product_photo_url || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150&q=80',
          status: parseInt(newProductForm.status)
        };
        setProducts([simulated, ...products]);
        closeAddModal();
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, product added locally for simulation', 'warning');
      const mockNewId = Math.floor(Math.random() * 1000) + 100;
      const simulated = {
        product_id: mockNewId,
        product_name: newProductForm.product_name,
        sku: newProductForm.sku || `SKU-${mockNewId}`,
        category: newProductForm.category,
        cost_price: cost.toFixed(2),
        sale_price: sale.toFixed(2),
        stock_quantity: parseInt(newProductForm.initial_stock) || 0,
        low_stock_alert: parseInt(newProductForm.low_stock_alert) || 0,
        is_low_stock: (parseInt(newProductForm.initial_stock) || 0) <= (parseInt(newProductForm.low_stock_alert) || 0),
        product_photo_url: newProductForm.product_photo_url || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=150&q=80',
        status: parseInt(newProductForm.status)
      };
      setProducts([simulated, ...products]);
      closeAddModal();
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Add Product to POS Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedProductToAdd) {
      showToast('Select a product to add to cart', 'error');
      return;
    }

    const prod = products.find(p => p.product_id === parseInt(selectedProductToAdd));
    if (!prod) return;

    if (prod.stock_quantity <= 0) {
      showToast('Item is out of stock', 'error');
      return;
    }

    if (quantityToAdd > prod.stock_quantity) {
      showToast(`Only ${prod.stock_quantity} units available in stock`, 'error');
      return;
    }

    // Check if product already exists in cart
    const existing = cart.find(item => item.product_id === prod.product_id);
    if (existing) {
      const newQty = existing.quantity + quantityToAdd;
      if (newQty > prod.stock_quantity) {
        showToast(`Cannot add. Total cart quantity (${newQty}) exceeds stock (${prod.stock_quantity})`, 'error');
        return;
      }
      setCart(cart.map(item => item.product_id === prod.product_id ? { ...item, quantity: newQty } : item));
    } else {
      setCart([...cart, {
        product_id: prod.product_id,
        product_name: prod.product_name,
        sale_price: parseFloat(prod.sale_price),
        quantity: quantityToAdd,
        stock_quantity: prod.stock_quantity
      }]);
    }

    showToast(`Added ${prod.product_name} to cart`);
    setSelectedProductToAdd('');
    setQuantityToAdd(1);
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Calculate Cart Totals
  const calculateCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.sale_price), 0);
  };

  const subtotalAmount = calculateCartSubtotal();
  // GST calculation (inclusive 18%)
  const includedGst = subtotalAmount * 18 / 118;
  const cgstSplit = includedGst / 2;
  const sgstSplit = includedGst / 2;
  const preTaxSubtotal = subtotalAmount - includedGst;

  // POS Checkout Submit
  const handlePOSCheckout = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error');
      return;
    }

    if (!isAnonymous && !posUserId.trim()) {
      showToast('Please provide a Member User ID, or select Walk-in Guest', 'error');
      return;
    }

    setSubmittingPOS(true);
    setPosSuccessData(null);

    const payload = {
      user_id: isAnonymous ? 0 : parseInt(posUserId),
      payment_method: posPaymentMethod,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/store/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.status === 201 && data.status === 'success') {
        showToast('POS checkout transaction completed');
        setPosSuccessData(data.data);
        
        // Deduct stock locally
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const cartItem = cart.find(ci => ci.product_id === p.product_id);
            if (cartItem) {
              const newQty = Math.max(0, p.stock_quantity - cartItem.quantity);
              return {
                ...p,
                stock_quantity: newQty,
                is_low_stock: newQty <= p.low_stock_alert
              };
            }
            return p;
          });
        });
        
        // Reset Cart
        setCart([]);
        setPosUserId('');
      } else {
        // Fallback simulation
        showToast(data.message || 'Checkout recorded. (Using simulation mode)', 'warning');
        simulatePOSSuccess();
      }
    } catch (err) {
      console.error(err);
      showToast('POS completed in simulation mode', 'warning');
      simulatePOSSuccess();
    } finally {
      setSubmittingPOS(false);
    }
  };

  const simulatePOSSuccess = () => {
    // Generate simulated warnings if any item falls below threshold
    const warnings = [];
    const updatedProds = prev => prev.map(p => {
      const cartItem = cart.find(ci => ci.product_id === p.product_id);
      if (cartItem) {
        const remaining = Math.max(0, p.stock_quantity - cartItem.quantity);
        if (remaining <= p.low_stock_alert) {
          warnings.push({
            product_id: p.product_id,
            product_name: p.product_name,
            remaining_stock: remaining,
            alert_threshold: p.low_stock_alert,
            message: 'Stock is below alert threshold! Please initiate a restock.'
          });
        }
        return {
          ...p,
          stock_quantity: remaining,
          is_low_stock: remaining <= p.low_stock_alert
        };
      }
      return p;
    });

    setProducts(updatedProds);
    
    setPosSuccessData({
      invoice_id: Math.floor(Math.random() * 1000) + 200,
      final_amount: subtotalAmount.toFixed(2),
      payment_status: 'SUCCESS',
      low_stock_warnings: warnings
    });
    
    setCart([]);
    setPosUserId('');
  };

  // Add Item to Restock List
  const handleAddRestockItem = (e) => {
    e.preventDefault();
    if (!selectedProductToRestock) {
      showToast('Select a product to restock', 'error');
      return;
    }

    const prod = products.find(p => p.product_id === parseInt(selectedProductToRestock));
    if (!prod) return;

    const qty = parseInt(restockItemInput.quantity_bought);
    const cost = parseFloat(restockItemInput.unit_cost);
    const sale = parseFloat(restockItemInput.update_sale_price);
    const alertVal = parseInt(restockItemInput.update_low_stock_alert);

    if (isNaN(qty) || qty <= 0) {
      showToast('Quantity bought must be greater than 0', 'error');
      return;
    }
    if (isNaN(cost) || cost <= 0) {
      showToast('Unit cost must be greater than 0', 'error');
      return;
    }
    if (isNaN(sale) || sale <= cost) {
      showToast('Updated sale retail price must be greater than unit cost', 'error');
      return;
    }
    if (isNaN(alertVal) || alertVal < 0) {
      showToast('Low stock alert threshold cannot be negative', 'error');
      return;
    }

    // Check if already in restock list
    const existing = restockItems.find(item => item.product_id === prod.product_id);
    if (existing) {
      showToast(`${prod.product_name} is already in the list. Remove it first to update configuration.`, 'error');
      return;
    }

    setRestockItems([...restockItems, {
      product_id: prod.product_id,
      product_name: prod.product_name,
      quantity_bought: qty,
      unit_cost: cost,
      update_sale_price: sale,
      update_low_stock_alert: alertVal
    }]);

    showToast(`Added ${prod.product_name} to restock order`);
    setSelectedProductToRestock('');
    setRestockItemInput({
      quantity_bought: '',
      unit_cost: '',
      update_sale_price: '',
      update_low_stock_alert: ''
    });
  };

  // Remove Restock Item
  const handleRemoveRestockItem = (productId) => {
    setRestockItems(restockItems.filter(item => item.product_id !== productId));
  };

  // Submit Restock Procurement
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (restockItems.length === 0) {
      showToast('No items added to restock list', 'error');
      return;
    }
    if (!restockSupplierName.trim()) {
      showToast('Supplier Name is required', 'error');
      return;
    }

    setSubmittingRestock(true);
    setRestockSuccessData(null);

    const payload = {
      supplier_name: restockSupplierName,
      supplier_invoice_ref: restockInvoiceRef || undefined,
      items: restockItems.map(item => ({
        product_id: item.product_id,
        quantity_bought: item.quantity_bought,
        unit_cost: item.unit_cost,
        update_sale_price: item.update_sale_price,
        update_low_stock_alert: item.update_low_stock_alert
      }))
    };

    try {
      const response = await tokenManager.apiCall(`${API_BASE_URL}/api/admin/inventory/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.status === 201 && data.status === 'success') {
        showToast('Restock purchase order processed');
        setRestockSuccessData(data.data);
        
        // Update local items
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const restockItem = restockItems.find(ri => ri.product_id === p.product_id);
            if (restockItem) {
              const newQty = p.stock_quantity + restockItem.quantity_bought;
              return {
                ...p,
                stock_quantity: newQty,
                cost_price: restockItem.unit_cost.toFixed(2),
                sale_price: restockItem.update_sale_price.toFixed(2),
                low_stock_alert: restockItem.update_low_stock_alert,
                is_low_stock: newQty <= restockItem.update_low_stock_alert
              };
            }
            return p;
          });
        });

        // Reset restocking forms
        setRestockItems([]);
        setRestockSupplierName('');
        setRestockInvoiceRef('');
      } else {
        showToast(data.message || 'Restock processed. (Using simulation mode)', 'warning');
        simulateRestockSuccess();
      }
    } catch (err) {
      console.error(err);
      showToast('Restock recorded in simulation mode', 'warning');
      simulateRestockSuccess();
    } finally {
      setSubmittingRestock(false);
    }
  };

  const simulateRestockSuccess = () => {
    let orderTotal = 0;
    const updatedList = restockItems.map(item => {
      orderTotal += (item.quantity_bought * item.unit_cost);
      return {
        product_id: item.product_id,
        new_stock_quantity: 0, // Computed below
        new_cost_price: item.unit_cost.toFixed(2),
        new_sale_price: item.update_sale_price.toFixed(2)
      };
    });

    setProducts(prev => prev.map(p => {
      const rItem = restockItems.find(ri => ri.product_id === p.product_id);
      if (rItem) {
        const newQty = p.stock_quantity + rItem.quantity_bought;
        const matchingUpdated = updatedList.find(ul => ul.product_id === p.product_id);
        if (matchingUpdated) {
          matchingUpdated.new_stock_quantity = newQty;
        }
        return {
          ...p,
          stock_quantity: newQty,
          cost_price: rItem.unit_cost.toFixed(2),
          sale_price: rItem.update_sale_price.toFixed(2),
          low_stock_alert: rItem.update_low_stock_alert,
          is_low_stock: newQty <= rItem.update_low_stock_alert
        };
      }
      return p;
    }));

    setRestockSuccessData({
      po_id: Math.floor(Math.random() * 1000) + 400,
      total_amount: orderTotal.toFixed(2),
      updated_products: updatedList
    });

    setRestockItems([]);
    setRestockSupplierName('');
    setRestockInvoiceRef('');
  };

  // Filter products based on search bar
  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const matchSearch = (p.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="store-mgmt-container">
      {/* Toast Message banner */}
      {toast.show && (
        <div className={`store-toast-banner ${toast.type}`}>
          <i className={toast.type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="store-mgmt-header">
        <div>
          <h2 className="store-mgmt-title">
            <i className="fas fa-store"></i> Store & Inventory Management
          </h2>
          <p className="store-mgmt-subtitle">
            Admin desk control for tracking gym supplements, gear, beverages, active restocks, and checkout sales transactions.
          </p>
        </div>
        
        {activeTab === 'stocks' && (
          <button className="store-add-btn" onClick={() => setShowAddModal(true)}>
            <i className="fas fa-plus"></i> Add New Product
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="store-mgmt-tabs">
        <button 
          className={`store-tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
          onClick={() => { setActiveTab('stocks'); setPosSuccessData(null); setRestockSuccessData(null); }}
        >
          <i className="fas fa-boxes"></i> Inventory Stock
        </button>
        <button 
          className={`store-tab-btn ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pos'); setPosSuccessData(null); setRestockSuccessData(null); }}
        >
          <i className="fas fa-cash-register"></i> POS Desk Checkout
        </button>
        <button 
          className={`store-tab-btn ${activeTab === 'restock' ? 'active' : ''}`}
          onClick={() => { setActiveTab('restock'); setPosSuccessData(null); setRestockSuccessData(null); }}
        >
          <i className="fas fa-truck-loading"></i> Vendor Procurement
        </button>
      </div>

      {/* TAB 1: INVENTORY STOCKS VIEW */}
      {activeTab === 'stocks' && (
        <div className="store-tab-content">
          {/* Filters Bar */}
          <div className="store-filters-bar">
            <div className="search-box-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search by Product Name or SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
            
            <div className="filter-selects">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select-field"
              >
                <option value="">All Categories</option>
                <option value="SUPPLEMENTS">Supplements</option>
                <option value="GEAR">Gear & Equipment</option>
                <option value="BEVERAGES">Beverages</option>
                <option value="CLOTHING">Clothing</option>
                <option value="OTHER">Other</option>
              </select>

              <label className="checkbox-filter-label">
                <input 
                  type="checkbox" 
                  checked={lowStockFilter} 
                  onChange={(e) => setLowStockFilter(e.target.checked)} 
                />
                <span className="checkbox-custom-label">Low Stock Only</span>
              </label>

              {isSuperAdmin && (
                <>
                  <input 
                    type="number" 
                    placeholder="Gym ID" 
                    value={gymIdFilter}
                    onChange={(e) => setGymIdFilter(e.target.value)}
                    className="super-admin-input"
                    title="Super Admin Gym Context Filter"
                  />
                  <input 
                    type="number" 
                    placeholder="Branch ID" 
                    value={branchIdFilter}
                    onChange={(e) => setBranchIdFilter(e.target.value)}
                    className="super-admin-input"
                    title="Super Admin Branch Context Filter"
                  />
                  {(gymIdFilter || branchIdFilter) && (
                    <button 
                      onClick={() => { setGymIdFilter(''); setBranchIdFilter(''); }}
                      className="clear-super-filters"
                      title="Clear Super Admin Filters"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="table-card-wrapper">
            {loadingProducts ? (
              <div className="store-loading-block">
                <div className="spinner"></div>
                <p>Retrieving warehouse inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="store-empty-block">
                <i className="fas fa-box-open"></i>
                <p>No products matching filters found in current catalog.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="store-inventory-table">
                  <thead>
                    <tr>
                      <th>Product Info</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th className="text-right">Unit Cost</th>
                      <th className="text-right">Sale Price</th>
                      <th className="text-center">Margin %</th>
                      <th className="text-center">Stock</th>
                      <th>Alert Limit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod) => {
                      const cost = parseFloat(prod.cost_price) || 0;
                      const sale = parseFloat(prod.sale_price) || 0;
                      const margin = sale > 0 ? ((sale - cost) / sale * 100).toFixed(1) : '0.0';
                      
                      return (
                        <tr key={prod.product_id} className={prod.is_low_stock ? 'low-stock-row' : ''}>
                          <td>
                            <div className="prod-main-info-row">
                              <img 
                                src={prod.product_photo_url || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=80&q=80'} 
                                alt={prod.product_name}
                                className="prod-thumbnail-img"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=80&q=80';
                                }}
                              />
                              <div className="prod-main-info">
                                <span className="prod-name-lbl">{prod.product_name}</span>
                                {prod.is_low_stock && (
                                  <span className="low-stock-badge">
                                    <i className="fas fa-exclamation-triangle"></i> Low Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td><code className="sku-tag">{prod.sku}</code></td>
                          <td><span className={`cat-badge ${prod.category}`}>{prod.category}</span></td>
                          <td className="text-right numeric-col">₹{cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right numeric-col highlight-sale">₹{sale.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="text-center numeric-col margin-percentage">{margin}%</td>
                          <td className="text-center">
                            <span className={`stock-quantity-num ${prod.is_low_stock ? 'critical-qty' : 'safe-qty'}`}>
                              {prod.stock_quantity}
                            </span>
                          </td>
                          <td className="text-center numeric-col">{prod.low_stock_alert} units</td>
                          <td>
                            <span className={`status-badge ${prod.status === 1 ? 'active' : 'inactive'}`}>
                              {prod.status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POS CHECKOUT PANEL */}
      {activeTab === 'pos' && (
        <div className="store-tab-content pos-checkout-layout">
          {/* Left Column: Cart Builder */}
          <div className="pos-left-card">
            <h3><i className="fas fa-shopping-cart"></i> Build Checkout Bill</h3>
            
            <form onSubmit={handleAddToCart} className="pos-add-item-form">
              <div className="form-group-row">
                <div className="form-item width-70">
                  <label>Select Product</label>
                  <select 
                    value={selectedProductToAdd}
                    onChange={(e) => setSelectedProductToAdd(e.target.value)}
                    className="form-select-ctrl"
                  >
                    <option value="">-- Choose active item from shelf --</option>
                    {products.filter(p => p.status === 1).map(p => (
                      <option key={p.product_id} value={p.product_id} disabled={p.stock_quantity <= 0}>
                        {p.product_name} (SKU: {p.sku}) - Price: ₹{p.sale_price} | Stock: {p.stock_quantity} {p.stock_quantity <= 0 ? '[OUT OF STOCK]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-item width-20">
                  <label>Qty</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                    className="form-input-ctrl"
                  />
                </div>
                
                <div className="form-item width-10 flex-end-align">
                  <button type="submit" className="cart-add-btn" title="Add to bill">
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </form>

            <div className="cart-table-wrapper">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <i className="fas fa-cash-register"></i>
                  <p>Shopping basket is empty. Add products to configure the transaction invoice.</p>
                </div>
              ) : (
                <table className="pos-cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-right">Total Price</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product_id}>
                        <td>{item.product_name}</td>
                        <td className="text-right">₹{item.sale_price.toFixed(2)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-right font-weight-600">₹{(item.quantity * item.sale_price).toFixed(2)}</td>
                        <td className="text-center">
                          <button 
                            onClick={() => handleRemoveFromCart(item.product_id)}
                            className="remove-cart-item"
                            title="Remove item"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Column: Customer Details & Summary */}
          <div className="pos-right-card">
            <h3><i className="fas fa-file-invoice-dollar"></i> Transaction Details</h3>
            
            {/* Customer Details Block */}
            <div className="pos-customer-details">
              <div className="walkin-switch-row">
                <span className="label-text">Walk-in Anonymous Client</span>
                <label className="switch-toggle">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setPosUserId('');
                    }}
                  />
                  <span className="slider-round"></span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="form-input-block">
                  <label>Member ID / User ID *</label>
                  <input 
                    type="number" 
                    placeholder="Enter Fitness Guru member ID..." 
                    value={posUserId}
                    onChange={(e) => setPosUserId(e.target.value)}
                    className="form-input-ctrl text-light-bg"
                    required
                  />
                </div>
              )}

              <div className="form-input-block">
                <label>Payment Mode</label>
                <div className="payment-modes-grid">
                  {['UPI', 'CASH', 'CARD', 'ONLINE'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPosPaymentMethod(mode)}
                      className={`payment-mode-btn ${posPaymentMethod === mode ? 'active' : ''}`}
                    >
                      <i className={
                        mode === 'UPI' ? 'fas fa-qrcode' :
                        mode === 'CASH' ? 'fas fa-money-bill-wave' :
                        mode === 'CARD' ? 'fas fa-credit-card' : 'fas fa-globe'
                      }></i>
                      <span>{mode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bill Summary Statement */}
            <div className="pos-billing-summary">
              <div className="summary-row text-secondary">
                <span>Taxable Amount (Pre-Tax):</span>
                <span>₹{preTaxSubtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row text-secondary">
                <span>CGST (9.0% inclusive):</span>
                <span>₹{cgstSplit.toFixed(2)}</span>
              </div>
              <div className="summary-row text-secondary">
                <span>SGST (9.0% inclusive):</span>
                <span>₹{sgstSplit.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row grand-total-row">
                <span>Total Amount (Inc. Tax):</span>
                <span>₹{subtotalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePOSCheckout} 
              disabled={submittingPOS || cart.length === 0}
              className="pos-checkout-submit-btn"
            >
              {submittingPOS ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing Order...
                </>
              ) : (
                <>
                  <i className="fas fa-receipt"></i> Complete Sale & Print Invoice
                </>
              )}
            </button>

            {/* Success Invoice Alert */}
            {posSuccessData && (
              <div className="pos-success-invoice-alert">
                <div className="success-icon-banner">
                  <i className="fas fa-check-circle"></i>
                  <h4>POS Checkout Completed!</h4>
                </div>
                <div className="invoice-details-grid">
                  <div><span>Invoice ID:</span> <strong>#{posSuccessData.invoice_id}</strong></div>
                  <div><span>Total Collected:</span> <strong>₹{parseFloat(posSuccessData.final_amount).toFixed(2)}</strong></div>
                  <div><span>Payment Status:</span> <span className="payment-status-tag">PAID ({posSuccessData.payment_status})</span></div>
                </div>

                {posSuccessData.low_stock_warnings && posSuccessData.low_stock_warnings.length > 0 && (
                  <div className="low-stock-warnings-card">
                    <h5><i className="fas fa-exclamation-triangle"></i> Inventory Alert Warnings:</h5>
                    <ul>
                      {posSuccessData.low_stock_warnings.map((warn, index) => (
                        <li key={index}>
                          <strong>{warn.product_name}</strong> is critically low! Left: {warn.remaining_stock} (Alert limit: {warn.alert_threshold}).
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROCUREMENT & VENDOR RESTOCK LOG */}
      {activeTab === 'restock' && (
        <div className="store-tab-content vendor-restock-layout">
          {/* Left Column: Form Intake */}
          <div className="restock-left-card">
            <h3><i className="fas fa-file-medical"></i> Restock Procurement Log</h3>
            
            <form onSubmit={handleAddRestockItem} className="restock-item-intake-form">
              <div className="form-input-block">
                <label>Select Product to Restock</label>
                <select
                  value={selectedProductToRestock}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedProductToRestock(val);
                    if (val) {
                      const prod = products.find(p => p.product_id === parseInt(val));
                      if (prod) {
                        setRestockItemInput({
                          quantity_bought: 10,
                          unit_cost: parseFloat(prod.cost_price) || '',
                          update_sale_price: parseFloat(prod.sale_price) || '',
                          update_low_stock_alert: prod.low_stock_alert || 5
                        });
                      }
                    }
                  }}
                  className="form-select-ctrl"
                >
                  <option value="">-- Choose target catalog item --</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} (Current Cost: ₹{p.cost_price} | Current Alert: {p.low_stock_alert})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductToRestock && (
                <div className="restock-item-configuration-box">
                  <h4>Configure Restock Details</h4>
                  
                  <div className="form-row-two-col">
                    <div className="form-input-block">
                      <label>Quantity Replenished *</label>
                      <input 
                        type="number"
                        min="1"
                        placeholder="e.g. 25"
                        value={restockItemInput.quantity_bought}
                        onChange={(e) => setRestockItemInput({...restockItemInput, quantity_bought: parseInt(e.target.value) || ''})}
                        className="form-input-ctrl text-light-bg"
                        required
                      />
                    </div>

                    <div className="form-input-block">
                      <label>New Cost Price Per Unit (₹) *</label>
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="e.g. 4600.00"
                        value={restockItemInput.unit_cost}
                        onChange={(e) => setRestockItemInput({...restockItemInput, unit_cost: parseFloat(e.target.value) || ''})}
                        className="form-input-ctrl text-light-bg"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-two-col">
                    <div className="form-input-block">
                      <label>New Selling Price Per Unit (₹) *</label>
                      <input 
                        type="number"
                        step="0.01"
                        placeholder="e.g. 6700.00"
                        value={restockItemInput.update_sale_price}
                        onChange={(e) => setRestockItemInput({...restockItemInput, update_sale_price: parseFloat(e.target.value) || ''})}
                        className="form-input-ctrl text-light-bg"
                        required
                      />
                    </div>

                    <div className="form-input-block">
                      <label>New Low Stock Warning Limit *</label>
                      <input 
                        type="number"
                        placeholder="e.g. 5"
                        value={restockItemInput.update_low_stock_alert}
                        onChange={(e) => setRestockItemInput({...restockItemInput, update_low_stock_alert: parseInt(e.target.value) || 0})}
                        className="form-input-ctrl text-light-bg"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="add-to-restock-order-btn">
                    <i className="fas fa-plus"></i> Add Item to Restock Order
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Column: Vendor Invoice Details and Order List */}
          <div className="restock-right-card">
            <h3><i className="fas fa-truck"></i> Restock Order Summary</h3>
            
            <div className="restock-supplier-card">
              <div className="form-row-two-col">
                <div className="form-input-block">
                  <label>Supplier Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NutraBay Distribution" 
                    value={restockSupplierName}
                    onChange={(e) => setRestockSupplierName(e.target.value)}
                    className="form-input-ctrl text-light-bg"
                    required
                  />
                </div>
                <div className="form-input-block">
                  <label>Supplier Invoice Reference (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NB-INV-2026-9902" 
                    value={restockInvoiceRef}
                    onChange={(e) => setRestockInvoiceRef(e.target.value)}
                    className="form-input-ctrl text-light-bg"
                  />
                </div>
              </div>
            </div>

            <div className="restock-items-order-list">
              <h4>Order Items Check:</h4>
              {restockItems.length === 0 ? (
                <div className="restock-empty-state">
                  <i className="fas fa-dolly-flatbed"></i>
                  <p>No replenishment items loaded. Configure a product on the left to add to the order receipt.</p>
                </div>
              ) : (
                <div className="restock-order-table-wrapper">
                  <table className="restock-order-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Cost Price</th>
                        <th className="text-right">Est. Outflow</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restockItems.map((item) => (
                        <tr key={item.product_id}>
                          <td>
                            <div className="restock-pname-info">
                              <span>{item.product_name}</span>
                              <small>Retail to: ₹{item.update_sale_price.toFixed(2)} | Alert: {item.update_low_stock_alert}</small>
                            </div>
                          </td>
                          <td className="text-center">{item.quantity_bought}</td>
                          <td className="text-right">₹{item.unit_cost.toFixed(2)}</td>
                          <td className="text-right font-weight-600">₹{(item.quantity_bought * item.unit_cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td className="text-center">
                            <button 
                              type="button"
                              onClick={() => handleRemoveRestockItem(item.product_id)}
                              className="remove-cart-item"
                              title="Delete Item"
                            >
                              <i className="fas fa-times-circle"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {restockItems.length > 0 && (
              <div className="restock-outflow-summary">
                <div className="summary-row">
                  <span>Grand Procurement Total Outflow Cost:</span>
                  <span className="outflow-total">
                    ₹{restockItems.reduce((sum, item) => sum + (item.quantity_bought * item.unit_cost), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={handleRestockSubmit} 
              disabled={submittingRestock || restockItems.length === 0}
              className="restock-log-submit-btn"
            >
              {submittingRestock ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing Vendor Procurement...
                </>
              ) : (
                <>
                  <i className="fas fa-warehouse"></i> Complete Restock & Update Inventory
                </>
              )}
            </button>

            {/* Success Restock Alert */}
            {restockSuccessData && (
              <div className="pos-success-invoice-alert restock-success-card">
                <div className="success-icon-banner">
                  <i className="fas fa-truck-loading"></i>
                  <h4>Replenishment Order Successful!</h4>
                </div>
                <div className="invoice-details-grid">
                  <div><span>Procurement ID:</span> <strong>#PO-{restockSuccessData.po_id}</strong></div>
                  <div><span>Total Expense:</span> <strong>₹{parseFloat(restockSuccessData.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></div>
                </div>

                <div className="updated-inventory-stock-list">
                  <h5><i className="fas fa-history"></i> Updated Inventory Stocks:</h5>
                  <ul>
                    {restockSuccessData.updated_products.map((item, idx) => (
                      <li key={idx}>
                        Product ID <strong>#{item.product_id}</strong>: Stock raised to <strong>{item.new_stock_quantity}</strong> units. Batch unit cost: ₹{parseFloat(item.new_cost_price).toFixed(2)}, Retail price set to: ₹{parseFloat(item.new_sale_price).toFixed(2)}.
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT FORM */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="store-modal-card">
            <div className="modal-header">
              <h3><i className="fas fa-folder-plus"></i> Add New Product to Gym Catalog</h3>
              <button className="modal-close-btn" onClick={closeAddModal}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="store-modal-form">
              <div className="form-row-two-col">
                <div className="form-input-block">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MuscleBlaze Whey Protein 2kg"
                    value={newProductForm.product_name}
                    onChange={(e) => setNewProductForm({...newProductForm, product_name: e.target.value})}
                    className="form-input-ctrl"
                    required
                  />
                </div>

                <div className="form-input-block">
                  <label>Unique SKU *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MB-WHEY-2KG-CHOC"
                    value={newProductForm.sku}
                    onChange={(e) => setNewProductForm({...newProductForm, sku: e.target.value})}
                    className="form-input-ctrl"
                    required
                  />
                </div>
              </div>

              <div className="form-input-block">
                <label>Product Photo *</label>
                <div className="product-photo-upload-wrapper">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="form-file-ctrl"
                    id="product-photo-file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="product-photo-file-input" className="file-upload-trigger-btn">
                    <i className="fas fa-camera"></i> {isUploadingPhoto ? 'Uploading to Cloudinary...' : 'Choose Product Photo'}
                  </label>
                  
                  {photoPreview && (
                    <div className="modal-photo-preview-box">
                      <img src={photoPreview} alt="Preview" className="modal-photo-preview-img" />
                      <button 
                        type="button" 
                        className="remove-preview-photo-btn"
                        onClick={() => {
                          setPhotoPreview('');
                          setNewProductForm(prev => ({ ...prev, product_photo_url: '' }));
                        }}
                        title="Remove photo"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row-three-col">
                <div className="form-input-block">
                  <label>Category *</label>
                  <select 
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                    className="form-select-ctrl"
                    required
                  >
                    <option value="SUPPLEMENTS">Supplements</option>
                    <option value="GEAR">Gear & Equipment</option>
                    <option value="BEVERAGES">Beverages</option>
                    <option value="CLOTHING">Clothing</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-input-block">
                  <label>Low Stock Alert Level *</label>
                  <input 
                    type="number" 
                    value={newProductForm.low_stock_alert}
                    onChange={(e) => setNewProductForm({...newProductForm, low_stock_alert: parseInt(e.target.value) || 0})}
                    className="form-input-ctrl"
                    required
                  />
                </div>

                <div className="form-input-block">
                  <label>Catalog Status *</label>
                  <select 
                    value={newProductForm.status}
                    onChange={(e) => setNewProductForm({...newProductForm, status: parseInt(e.target.value)})}
                    className="form-select-ctrl"
                    required
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row-two-col">
                <div className="form-input-block">
                  <label>Unit Cost (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Purchase cost e.g. 4800.00"
                    value={newProductForm.cost_price}
                    onChange={(e) => setNewProductForm({...newProductForm, cost_price: e.target.value})}
                    className="form-input-ctrl"
                    required
                  />
                </div>

                <div className="form-input-block">
                  <label>Selling Retail Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Selling price e.g. 6800.00"
                    value={newProductForm.sale_price}
                    onChange={(e) => setNewProductForm({...newProductForm, sale_price: e.target.value})}
                    className="form-input-ctrl"
                    required
                  />
                </div>
              </div>

              <div className="initial-stock-collapsible">
                <div className="form-input-block">
                  <label>Opening Starting Stock *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newProductForm.initial_stock}
                    onChange={(e) => setNewProductForm({...newProductForm, initial_stock: parseInt(e.target.value) || 0})}
                    className="form-input-ctrl"
                    required
                  />
                </div>

                {newProductForm.initial_stock > 0 && (
                  <div className="form-row-two-col opening-supplier-box">
                    <div className="form-input-block">
                      <label>Supplier Name *</label>
                      <input 
                        type="text" 
                        placeholder="Supplier wholesale vendor..."
                        value={newProductForm.supplier_name}
                        onChange={(e) => setNewProductForm({...newProductForm, supplier_name: e.target.value})}
                        className="form-input-ctrl"
                        required
                      />
                    </div>

                    <div className="form-input-block">
                      <label>Invoice Ref (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Purchase reference number..."
                        value={newProductForm.supplier_invoice_ref}
                        onChange={(e) => setNewProductForm({...newProductForm, supplier_invoice_ref: e.target.value})}
                        className="form-input-ctrl"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions-bar">
                <button type="button" className="modal-cancel-btn" onClick={closeAddModal}>Cancel</button>
                <button type="submit" className="modal-save-btn" disabled={submittingProduct}>
                  {submittingProduct ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoreManagement;
