import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const UpdateCategoryModal = ({ show, handleClose, category, onUpdate }) => {
  const [categoryName, setCategoryName] = useState(category?.categoryName || '');
  const [categoryDescription, setCategoryDescription] = useState(category?.categoryDescription || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName || '');
      setCategoryDescription(category.categoryDescription || '');
    }
  }, [category]);

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
      // Send JSON data for category update
      const jsonData = {
        categoryName: categoryName,
        categoryDescription: categoryDescription
      };

      console.log('Sending update request to:', `${API_BASE_URL}/category/${category.categoryId}`);
      console.log('JSON data:', jsonData);

      await axios.put(`${API_BASE_URL}/category/${category.categoryId}`, jsonData, {
        headers: {
          'Content-Type': 'application/json'
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
                {/* Image upload section removed - will be re-added when multipart parsing is fixed */}
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
