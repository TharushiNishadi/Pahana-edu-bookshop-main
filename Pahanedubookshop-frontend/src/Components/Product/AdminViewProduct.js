import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Profile.css';
import SecFooter from '../footer2';
import FrtNavigation from "../Navigations/navigation4";
import SideNavigation from "../Navigations/navigation5";
import UpdateProductModal from './UpdateProductModal';

const AdminViewProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/product')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch products');
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      axios.delete(`/product/${productToDelete.productId}`)
        .then(() => {
          setProducts(prevProducts => prevProducts.filter(product => product.productId !== productToDelete.productId));
          setProductToDelete(null);
          setShowDeleteModal(false);
        })
        .catch(() => {
          setError('Failed to delete product');
          setProductToDelete(null);
          setShowDeleteModal(false);
        });
    }
  };

  const cancelDeleteProduct = () => {
    setProductToDelete(null);
    setShowDeleteModal(false);
  };

  const handleModalUpdate = () => {
    axios.get('/product')
      .then(response => {
        setProducts(response.data);
      })
      .catch(() => {
        setError('Failed to fetch products');
      });
  };

  const filteredProducts = products.filter(product =>
    product.productId.toLowerCase().includes(searchTerm) ||
    product.productName.toLowerCase().includes(searchTerm) ||
    product.categoryName.toLowerCase().includes(searchTerm)
  );

  return (
    <>
      <FrtNavigation />
      <div className="gallery-container">
        <SideNavigation />
        <div className="add-user-container">
          <h1 className="form-head">Product Management</h1>
          
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <div className="header-container">
                <div className="search-container-one">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search Products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="button-container">
                  <button className="btn-gold-add" onClick={handleAddProduct}>
                    Add Product
                  </button>
                </div>
              </div>

              <div className='user-table-container'>
                <div className="gallery-content">
                  <table className="custom-table">
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
                      {filteredProducts.map(product => (
                        <tr key={product.productId}>
                          <td>{product.productId}</td>
                          <td>{product.productName}</td>
                          <td>{product.categoryName}</td>
                          <td>Rs. {product.productPrice.toFixed(2)}</td>
                          <td>{product.productDescription}</td>
                          <td>
                            <img  src={`/images/${product.productImage}`} alt={product.productName} className="product-pic-admin" />
                          </td>
                          <td>
                            <button
                              className="btn-confirm"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit Product
                            </button>
                            <button
                              className="btn-deny"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              Delete Product
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <UpdateProductModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        product={selectedProduct}
        onUpdate={handleModalUpdate}
      />

      {showDeleteModal && (
        <div className="modal-backdrop-blur">
          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={cancelDeleteProduct}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this Product? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelDeleteProduct}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteProduct}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <SecFooter/>
    </>
  );
};

export default AdminViewProduct;
