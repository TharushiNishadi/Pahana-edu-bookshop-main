import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Profile.css';
import SecFooter from '../footer2';
import FrtNavigation from "../Navigations/navigation4";
import SideNavigation from "../Navigations/navigation5";
import UpdateCategoryModal from './UpdateCategoryModal';

const ViewCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const navigate = useNavigate();

  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  useEffect(() => {
    axios.get(`${API_BASE_URL}/category`)
      .then(response => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setError('Failed to fetch categories');
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddCategory = () => {
    navigate('/add-category');
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      axios.delete(`${API_BASE_URL}/category/${categoryToDelete.categoryId}`)
        .then(() => {
          setCategories(prevCategories => prevCategories.filter(category => category.categoryId !== categoryToDelete.categoryId));
          setShowDeleteModal(false);
        })
        .catch((error) => {
          console.error('Error deleting category:', error);
          setError('Failed to delete category');
        });
    }
  };

  const handleModalUpdate = () => {
    axios.get(`${API_BASE_URL}/category`)
      .then(response => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error('Error refreshing categories:', error);
        setError('Failed to fetch categories');
      });
  };

  const filteredCategories = categories.filter(category =>
    category.categoryId.toLowerCase().includes(searchTerm) ||
    category.categoryName.toLowerCase().includes(searchTerm)
  );

  return (
    <>
      <FrtNavigation />
      <div className="gallery-container">
        <SideNavigation />
        <div className="add-user-container">
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
                    placeholder="Search Categories..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="button-container">
                  <button className="btn-gold-add" onClick={handleAddCategory}>
                    Add Category
                  </button>
                </div>
              </div>

              <div className='user-table-container'>
                <div className="gallery-content">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Category ID</th>
                        <th>Category Name</th>
                        <th>Description</th>
                        <th>Category Image</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map(category => (
                        <tr key={category.id}>
                          <td>{category.categoryId}</td>
                          <td>{category.categoryName}</td>
                          <td>{category.categoryDescription}</td>
                          <td>
                            <img src={`/images/${category.categoryImage}`} alt={category.categoryName} className="product-pic-admin" />
                          </td>
                          <td>
                            <button
                              className="btn-confirm"
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit Category
                            </button>
                            <button
                              className="btn-deny"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Delete Category
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

      {showModal && (
        <UpdateCategoryModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          category={selectedCategory}
          onUpdate={handleModalUpdate}
        />
      )}

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
                    onClick={() => setShowDeleteModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this category? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteCategory}>Delete</button>
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

export default ViewCategory;
