import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const UpdateCategoryModal = ({ show, handleClose, category, onUpdate }) => {
  const [categoryName, setCategoryName] = useState(category?.categoryName || '');
  const [categoryDescription, setCategoryDescription] = useState(category?.categoryDescription || '');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName || '');
      setCategoryDescription(category.categoryDescription || '');
      setCategoryImage(null);
      setImagePreview(category.categoryImage ? `${API_BASE_URL}/images/${category.categoryImage}` : '');
    }
  }, [category, API_BASE_URL]);

  const handleFileChange = (e) => {
    console.log('File change event triggered:', e.target.files[0]);
    const file = e.target.files[0];
    setCategoryImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submit event triggered');

    setErrors({});

    if (!category?.categoryId) {
      console.error('Category ID is undefined');
      return;
    }

    if (!categoryName || !categoryDescription) {
      Swal.fire({
        title: 'Error! ❌',
        text: 'Please fill all required fields.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('categoryDescription', categoryDescription);

      if (categoryImage instanceof File) {
        formData.append('categoryImage', categoryImage);
      }

      console.log('Sending update request to:', `${API_BASE_URL}/category/${category.categoryId}`);
      console.log('Form data:', {
        categoryName,
        categoryDescription,
        categoryImage: categoryImage ? 'File selected' : 'No file'
      });

      await axios.put(`${API_BASE_URL}/category/${category.categoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success notification
      Swal.fire({
        title: 'Success! ',
        text: `Category "${categoryName}" updated successfully!`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        showClass: { 
          popup: 'animate__animated animate__fadeInDown' 
        },
        hideClass: { 
          popup: 'animate__animated animate__fadeOutUp' 
        }
      });

      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating category', error);
      
      // Show detailed error information with SweetAlert2
      let errorMessage = 'Failed to update category. ';
      if (error.response) {
        // Backend responded with error
        const backendError = error.response.data;
        if (backendError.error) {
          errorMessage += backendError.error;
        } else if (backendError.message) {
          errorMessage += backendError.message;
        } else {
          errorMessage += `Status: ${error.response.status}`;
        }
        console.error('Backend error details:', backendError);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server. Please check if backend is running.';
        console.error('No response received:', error.request);
      } else {
        // Something else happened
        errorMessage += error.message || 'Unknown error occurred.';
        console.error('Request setup error:', error.message);
      }
      
      Swal.fire({
        title: 'Error! ❌',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    console.log('Close modal event triggered');
    handleClose();
  };



  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop-blur" onClick={handleCloseModal}></div>
      <div className="modal show" style={{ display: 'block', zIndex: 1050 }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Category - {categoryName}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                style={{ cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formCategoryName">
                  <Form.Label>Category Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={categoryName}
                    onChange={(e) => {
                      console.log('Category name changed:', e.target.value);
                      setCategoryName(e.target.value);
                    }}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formCategoryDescription">
                  <Form.Label>Category Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={categoryDescription}
                    onChange={(e) => {
                      console.log('Category description changed:', e.target.value);
                      setCategoryDescription(e.target.value);
                    }}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formCategoryImage" className="mb-3">
                  <Form.Label>Category Image</Form.Label><br />
                  <div className="image-preview-container">
                    <input 
                      type="file" 
                      id="categoryImage" 
                      name="categoryImage" 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="categoryImage" 
                      className={`custom-file-upload ${errors.categoryImage ? 'is-invalid' : ''}`}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => {
                        console.log('Change Image label clicked');
                        document.getElementById('categoryImage').click();
                      }}
                    >
                      Change Image
                    </label>
                    {imagePreview && (
                      <div className="image-preview mt-3">
                        <img src={imagePreview} alt="Category Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                      </div>
                    )}
                    {errors.categoryImage && <div className="invalid-feedback">{errors.categoryImage}</div>}
                  </div>
                </Form.Group>
              </Form>
            </div>
            <div className="modal-footer" style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', borderTop: '1px solid #dee2e6', padding: '15px' }}>
              <Button 
                variant="secondary" 
                onClick={handleCloseModal} 
                className="btn btn-secondary"
                style={{ cursor: 'pointer', backgroundColor: '#6c757d', borderColor: '#6c757d', color: 'white' }}
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                className="btn btn-warning" 
                disabled={loading}
                style={{ 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  backgroundColor: '#ffc107',
                  borderColor: '#ffc107',
                  color: 'white'
                }}
                onClick={handleSubmit}
              >
                {loading ? 'Updating...' : 'Update'}
              </Button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateCategoryModal;
