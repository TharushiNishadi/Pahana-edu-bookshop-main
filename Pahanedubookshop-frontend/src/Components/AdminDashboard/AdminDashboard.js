import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import '../../CSS/AdminDashboard.css';
import FrtNavigation from '../Navigations/navigation4';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState({
    users: [],
    products: [],
    categories: [],
    offers: [],
    gallery: [],
    orders: [],
    feedbacks: []
  });

  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, productsRes, categoriesRes, offersRes, galleryRes, ordersRes, feedbacksRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`),
        axios.get(`${API_BASE_URL}/product`),
        axios.get(`${API_BASE_URL}/category`),
        axios.get(`${API_BASE_URL}/offer`),
        axios.get(`${API_BASE_URL}/gallery`),
        axios.get(`${API_BASE_URL}/orders`),
        axios.get(`${API_BASE_URL}/feedback`)
      ]);

      const newData = {
        users: usersRes.data || [],
        products: productsRes.data || [],
        categories: categoriesRes.data || [],
        offers: offersRes.data || [],
        gallery: galleryRes.data || [],
        orders: ordersRes.data || [],
        feedbacks: feedbacksRes.data || []
      };

      setData(newData);

      toast.success('All data loaded successfully!');
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load some data. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchAllData();
  };

  const generateSalesReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      // Send dates in YYYY-MM-DD format as the backend expects
      const response = await axios.get(`${API_BASE_URL}/orders/sales-report?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data) {
        toast.success('Sales report generated successfully!');
        // You can add logic here to download or display the report
        console.log('Sales Report:', response.data);
      }
    } catch (error) {
      console.error('Error generating sales report:', error);
      toast.error('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      setLoading(true);
      // Send dates in YYYY-MM-DD format as the backend expects
      const response = await axios.get(`${API_BASE_URL}/orders/financial-report?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data) {
        toast.success('Financial report generated successfully!');
        // You can add logic here to download or display the report
        console.log('Financial Report:', response.data);
      }
    } catch (error) {
      console.error('Error generating financial report:', error);
      toast.error('Failed to generate financial report');
    } finally {
      setLoading(false);
    }
  };

  // Delete handler functions
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${userId}`);
        toast.success('User deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/product/${productId}`);
        toast.success('Product deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/category/${categoryId}`);
        toast.success('Category deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleDeleteOffer = async (offerId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/offer/${offerId}`);
        toast.success('Offer deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error('Failed to delete offer');
      }
    }
  };

  const handleDeleteGallery = async (galleryId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/gallery/${galleryId}`);
        toast.success('Gallery item deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        toast.error('Failed to delete gallery item');
      }
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`);
        toast.success('Feedback deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/order/${orderId}`);
        toast.success('Order deleted successfully!');
        refreshData();
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffd700',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear any stored tokens or user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        toast.success('Logged out successfully!');
        
        // Redirect to login page
        navigate('/login');
      }
    });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const getFilteredProducts = () => {
    if (!searchTerm) return data.products;
    return data.products.filter(product => 
      (product.productName || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.categoryName || product.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.productDescription || product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderOverview = () => (
    <div className="overview-section">
      <h2>📊 Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card users">
          <h3>👥 Users</h3>
          <div className="stat-number">{data.users.length}</div>
          <div className="stat-label">Total Registered Users</div>
        </div>
        <div className="stat-card products">
          <h3>📚 Products</h3>
          <div className="stat-number">{data.products.length}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card categories">
          <h3>🏷️ Categories</h3>
          <div className="stat-number">{data.categories.length}</div>
          <div className="stat-label">Total Categories</div>
        </div>
        <div className="stat-card offers">
          <h3>🎯 Offers</h3>
          <div className="stat-number">{data.offers.length}</div>
          <div className="stat-label">Active Offers</div>
        </div>
        <div className="stat-card gallery">
          <h3>🖼️ Gallery</h3>
          <div className="stat-number">{data.gallery.length}</div>
          <div className="stat-label">Gallery Items</div>
        </div>
        <div className="stat-card total">
          <h3>📈 Total</h3>
          <div className="stat-number">{data.users.length + data.products.length + data.categories.length + data.offers.length + data.gallery.length}</div>
          <div className="stat-label">Total Items</div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>👥 Users Management</h2>
        <div className="header-actions">
          <button onClick={refreshData} className="btn-refresh">🔄 Refresh</button>
          <button className="btn-add-product" onClick={() => navigate('/add-user')}>Add User</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>User Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.userId || user.id}>
                  <td>{user.userId || user.id}</td>
                  <td>{user.username || user.name || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`badge ${(user.userType || 'customer').toLowerCase()}`}>
                      {user.userType || 'Customer'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'Active' ? 'active' : 'inactive'}`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => navigate(`/add-user`)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteUser(user.userId || user.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>📚 Products Management</h2>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Products..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="btn-add-product" onClick={() => navigate('/add-product')}>Add Product</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Description</th>
                <th>Product Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredProducts().map((product) => (
                <tr key={product.productId || product.id}>
                  <td className="product-id">{product.productId || product.id}</td>
                  <td className="product-name">{product.productName || product.name || 'N/A'}</td>
                  <td className="product-category">{product.categoryName || product.category || 'N/A'}</td>
                  <td className="product-price">Rs. {product.productPrice || product.price || '0.00'}</td>
                  <td className="product-description">{product.productDescription || product.description || 'N/A'}</td>
                  <td className="product-image-cell">
                    <div className="image-placeholder">
                      <img 
                        src={`/images/${product.productImage || product.image || 'default-product.jpg'}`} 
                        alt={product.productName}
                        className="gallery-thumbnail"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="placeholder-icon" style={{ display: 'none' }}>
                        📚
                      </div>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => navigate(`/view-product`)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteProduct(product.productId || product.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>🏷️ Categories Management</h2>
        <div className="header-actions">
          <button onClick={refreshData} className="btn-refresh">🔄 Refresh</button>
          <button className="btn-add-product" onClick={() => navigate('/add-category')}>Add Category</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.categories.map((category) => (
                <tr key={category.categoryId || category.id}>
                  <td>{category.categoryId || category.id}</td>
                  <td>
                    <img 
                      src={`/images/${category.categoryImage || category.image || 'default-category.jpg'}`} 
                      alt={category.categoryName}
                      className="category-thumbnail"
                      onError={(e) => {
                        e.target.src = '/images/default-category.jpg';
                        e.target.alt = 'Default Image';
                      }}
                    />
                  </td>
                  <td>{category.categoryName || category.name || 'N/A'}</td>
                  <td>{category.categoryDescription || category.description || 'N/A'}</td>
                  <td>
                    <span className={`badge ${category.status === 'Active' ? 'active' : 'inactive'}`}>
                      {category.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => navigate(`/view-category`)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteCategory(category.categoryId || category.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOffers = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>🎯 Offers Management</h2>
        <div className="header-actions">
          <button onClick={refreshData} className="btn-refresh">🔄 Refresh</button>
          <button className="btn-add-product" onClick={() => navigate('/add-offer')}>Add Offer</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading offers...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Offer ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.offers.map((offer) => (
                <tr key={offer.offerId || offer.id}>
                  <td>{offer.offerId || offer.id}</td>
                  <td>
                    <img 
                      src={`/images/${offer.offerImage || offer.image || 'default-offer.jpg'}`} 
                      alt={offer.offerTitle}
                      className="offer-thumbnail"
                      onError={(e) => {
                        e.target.src = '/images/default-offer.jpg';
                        e.target.alt = 'Default Image';
                      }}
                    />
                  </td>
                  <td>{offer.offerTitle || offer.title || 'N/A'}</td>
                  <td>{offer.offerDescription || offer.description || 'N/A'}</td>
                  <td>{offer.discountPercentage || offer.discount || '0'}%</td>
                  <td>
                    <span className={`badge ${offer.status === 'Active' ? 'active' : 'inactive'}`}>
                      {offer.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => navigate(`/view-offer`)}>✏️ Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteOffer(offer.offerId || offer.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderGallery = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>🖼️ Gallery Management</h2>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search Images..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button className="btn-add-image" onClick={() => navigate('/add-image')}>Add Image</button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading gallery...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Picture ID</th>
                <th>Picture Type</th>
                <th>Picture Path</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.gallery.map((item) => (
                <tr key={item.pictureId || item.id}>
                  <td>{item.pictureId || item.id || 'N/A'}</td>
                  <td>{item.pictureType || item.type || 'N/A'}</td>
                  <td>
                    <div className="image-placeholder">
                      <img 
                        src={`http://localhost:12345/images/${item.pictureImage || item.picturePath || 'default-gallery.jpg'}`} 
                        alt={item.pictureName || item.name || 'Gallery Image'}
                        className="gallery-thumbnail"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <div className="placeholder-icon" style={{ display: 'none' }}>
                        📷
                      </div>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => navigate(`/view-gallery`)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDeleteGallery(item.pictureId || item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>📊 Reports & Analytics</h2>
        <button onClick={refreshData} className="btn-refresh">🔄 Refresh</button>
      </div>
      
      {loading ? (
        <div className="loading">Loading reports...</div>
      ) : (
        <div className="reports-container">
          {/* Report Generation Section */}
          <div className="report-generation-section">
            <h3>Generate Reports</h3>
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  className="date-input"
                  placeholder="mm/dd/yyyy"
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  className="date-input"
                  placeholder="mm/dd/yyyy"
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="report-buttons">
              <button className="btn-generate-report sales" onClick={generateSalesReport}>
                📊 Generate Sales Report
              </button>
              <button className="btn-generate-report financial" onClick={generateFinancialReport}>
                📈 Generate Financial Report
              </button>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="reports-grid">
            <div className="report-card">
              <h3>📈 Sales Overview</h3>
              <div className="report-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Orders:</span>
                  <span className="stat-value">{data.orders?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Revenue:</span>
                  <span className="stat-value">Rs. {(data.orders?.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0) || 0).toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Products Sold:</span>
                  <span className="stat-value">{data.products?.length || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="report-card">
              <h3>👥 User Statistics</h3>
              <div className="report-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Users:</span>
                  <span className="stat-value">{data.users?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Admin Users:</span>
                  <span className="stat-value">{data.users?.filter(user => user.userType === 'Admin').length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Staff Users:</span>
                  <span className="stat-value">{data.users?.filter(user => user.userType === 'Staff').length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Customers:</span>
                  <span className="stat-value">{data.users?.filter(user => user.userType === 'Customer').length || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="report-card">
              <h3>📚 Inventory Status</h3>
              <div className="report-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Products:</span>
                  <span className="stat-value">{data.products?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Categories:</span>
                  <span className="stat-value">{data.categories?.length || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active Offers:</span>
                  <span className="stat-value">{data.offers?.filter(offer => offer.status === 'Active').length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeedbacks = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>💬 Feedback Management</h2>
        <button onClick={refreshData} className="btn-refresh">🔄 Refresh</button>
      </div>
      
      {loading ? (
        <div className="loading">Loading feedbacks...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feedback ID</th>
                <th>User</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.feedbacks?.map((feedback) => (
                <tr key={feedback.feedbackId || feedback.id}>
                  <td>{feedback.feedbackId || feedback.id}</td>
                  <td>{feedback.userName || feedback.user || 'N/A'}</td>
                  <td>{feedback.subject || feedback.title || 'N/A'}</td>
                  <td className="feedback-message">
                    {feedback.message || feedback.description || 'N/A'}
                  </td>
                  <td>
                    <div className="rating-display">
                      {[...Array(5)].map((_, index) => (
                        <span key={index} className={`star ${index < (feedback.rating || 0) ? 'filled' : 'empty'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${feedback.status === 'Resolved' ? 'active' : 'inactive'}`}>
                      {feedback.status || 'Pending'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => navigate(`/admin-feedback`)}>✏️ Respond</button>
                    <button className="btn-delete" onClick={() => handleDeleteFeedback(feedback.feedbackId || feedback.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#cccccc' }}>
                    No feedback data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>📦 Order Management</h2>
        <button onClick={refreshData} className="btn-refresh">🔄 Refresh</button>
      </div>
      
      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.orders?.map((order) => (
                <tr key={order.orderId || order.id}>
                  <td className="order-id">{order.orderId || order.id}</td>
                  <td>{order.customerName || order.userName || 'N/A'}</td>
                  <td className="order-products">
                    {order.products?.map((product, index) => (
                      <span key={index} className="product-tag">
                        {product.productName || product.name || 'Unknown Product'}
                      </span>
                    )) || 'N/A'}
                  </td>
                  <td className="order-amount">Rs. {order.totalAmount || order.amount || '0.00'}</td>
                  <td>{new Date(order.orderDate || order.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${order.status === 'Completed' ? 'active' : order.status === 'Pending' ? 'inactive' : 'admin'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => navigate(`/admin-order`)}>✏️ Update</button>
                    <button className="btn-delete" onClick={() => handleDeleteOrder(order.orderId || order.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#cccccc' }}>
                    No order data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'products':
        return renderProducts();
      case 'categories':
        return renderCategories();
      case 'offers':
        return renderOffers();
      case 'gallery':
        return renderGallery();
      case 'reports':
        return renderReports();
      case 'feedbacks':
        return renderFeedbacks();
      case 'orders':
        return renderOrders();
      default:
        return renderOverview();
    }
  };

  return (
    <>
      <FrtNavigation />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>🏢 Admin Dashboard</h1>
          <p>Manage all your website data in one place</p>
        </div>

        <div className="dashboard-container">
          <div className="sidebar">
            <nav className="nav-tabs">
              <button 
                className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                📊 Overview
              </button>
              <button 
                className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Users ({data.users.length})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                📚 Products ({data.products.length})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                🏷️ Categories ({data.categories.length})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'offers' ? 'active' : ''}`}
                onClick={() => setActiveTab('offers')}
              >
                🎯 Offers ({data.offers.length})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                🖼️ Gallery ({data.gallery.length})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
              >
                📊 Reports ({data.orders?.length || 0})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'feedbacks' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedbacks')}
              >
                💬 Feedbacks ({data.feedbacks?.length || 0})
              </button>
              <button 
                className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                📦 Orders ({data.orders?.length || 0})
              </button>
              <button 
                className="btn-logout"
                onClick={handleLogout}
              >
                👋 Logout
              </button>
            </nav>
          </div>

          <div className="main-content">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
