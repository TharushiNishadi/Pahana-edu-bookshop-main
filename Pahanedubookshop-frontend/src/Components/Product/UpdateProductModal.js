import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const UpdateProductModal = ({ show, handleClose, product, onUpdate }) => {
  const [productName, setProductName] = useState(product?.productName || '');
  const [categoryName, setCategoryName] = useState(product?.categoryName || '');
  const [productPrice, setProductPrice] = useState(product?.productPrice || '');
  const [productDescription, setProductDescription] = useState(product?.productDescription || '');
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.productImage ? `/images/${product?.productImage}` : '');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('/category')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    if (product) {
      setProductName(product.productName);
      setCategoryName(product.categoryName);
      setProductPrice(product.productPrice);
      setProductDescription(product.productDescription);
      setProductImage(null);
      setImagePreview(product.productImage ? `/images/${product.productImage}` : '');
    }
  }, [product]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProductImage(file);

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

    if (!product?.productId) {
      console.error('Product ID is undefined');
      return;
    }

    if (!productName || !categoryName || !productPrice || !productDescription) {
      alert('Please fill all required fields.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('productName', productName);
      formData.append('categoryName', categoryName);
      formData.append('productPrice', parseFloat(productPrice));
      formData.append('productDescription', productDescription);

      if (productImage instanceof File) {
        formData.append('productImage', productImage);
      }

      await axios.put(`/product/${product.productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating product', error);
      alert('Failed to update product. Please try again.');
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
              <h5 className="modal-title">Update Product - {productName}</h5>
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
                <Form.Group controlId="formProductName">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formCategoryName" className="mb-3 form-select-wrapper">
                  <Form.Label>Category Name</Form.Label>
                  <Form.Control
                    as="select"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(category => (
                      <option key={category.categoryName} value={category.categoryName}>
                        {category.categoryName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <br />
                <Form.Group controlId="formProductPrice">
                  <Form.Label>Product Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formProductDescription">
                  <Form.Label>Product Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formProductImage" className="mb-3">
                  <Form.Label>Product Image</Form.Label><br />
                  <div className="image-preview-container">
                    <input type="file" id="productImage" name="productImage" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    <label htmlFor="productImage" className={`custom-file-upload ${errors.productImage ? 'is-invalid' : ''}`}>
                      Change Image
                    </label>
                    {imagePreview && (
                      <div className="image-preview mt-3">
                        <img src={imagePreview} alt="Product Preview" style={{ inlineSize: '200px' }} />
                      </div>
                    )}
                    {errors.productImage && <div className="invalid-feedback">{errors.productImage}</div>}
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

export default UpdateProductModal;
