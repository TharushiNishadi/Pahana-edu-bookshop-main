import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const UpdateCategoryModal = ({ show, handleClose, category, onUpdate }) => {
  const [categoryName, setCategoryName] = useState(category?.categoryName || '');
  const [categoryDescription, setCategoryDescription] = useState(category?.categoryDescription || '');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(category?.categoryImage ? `/images/${category?.categoryImage}` : '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName);
      setCategoryDescription(category.categoryDescription);
      setCategoryImage(null);
      setImagePreview(category.categoryImage ? `/images/${category.categoryImage}` : '');
    }
  }, [category]);

  const handleFileChange = (e) => {
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

    setErrors({});

    if (!category?.categoryId) {
      console.error('Category ID is undefined');
      return;
    }

    if (!categoryName || !categoryDescription) {
      alert('Please fill all required fields.');
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

      await axios.put(`/category/${category.categoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating category', error);
      alert('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop-blur"></div>
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Category - {categoryName}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
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
                    onChange={(e) => setCategoryName(e.target.value)}
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
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formCategoryImage" className="mb-3">
                  <Form.Label>Category Image</Form.Label><br />
                  <div className="image-preview-container">
                    <input type="file" id="categoryImage" name="categoryImage" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    <label htmlFor="categoryImage" className={`custom-file-upload ${errors.categoryImage ? 'is-invalid' : ''}`}>
                      Change Image
                    </label>
                    {imagePreview && (
                      <div className="image-preview mt-3">
                        <img src={imagePreview} alt="Category Preview" style={{ inlineSize: '200px' }} />
                      </div>
                    )}
                    {errors.categoryImage && <div className="invalid-feedback">{errors.categoryImage}</div>}
                  </div>
                </Form.Group>
                <br />
                <div className="modal-footer">
                  <Button variant="secondary" onClick={handleClose} className="btn btn-secondary">Close</Button>
                  <Button variant="primary" type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateCategoryModal;
