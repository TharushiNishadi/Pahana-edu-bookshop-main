import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import FrtNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        productName: '',
        categoryName: '',
        productPrice: '',
        productImage: null,
        productDescription: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imagePreview, setImagePreview] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Use the correct backend URL for API calls
        const BACKEND_URL = 'http://localhost:12345';
        
        axios.get(`${BACKEND_URL}/category`)
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, []);

    useEffect(() => {
        if (formData.productImage) {
            const objectUrl = URL.createObjectURL(formData.productImage);
            setImagePreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [formData.productImage]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.productName) {
            newErrors.productName = 'Product Name is required';
        }

        if (!formData.categoryName) {
            newErrors.categoryName = 'Category Name is required';
        }

        if (!formData.productPrice || isNaN(formData.productPrice) || formData.productPrice <= 0) {
            newErrors.productPrice = 'Valid Product Price is required';
        }

        if (!formData.productImage) {
            newErrors.productImage = 'Product Image is required';
        }

        if (!formData.productDescription) {
            newErrors.productDescription = 'Product Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({ ...prevData, productImage: file }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);

            const data = new FormData();
            data.append('productName', formData.productName);
            data.append('categoryName', formData.categoryName);
            data.append('productPrice', formData.productPrice);
            data.append('productImage', formData.productImage);
            data.append('productDescription', formData.productDescription);

            // Use the correct backend URL for image uploads
            const BACKEND_URL = 'http://localhost:12345';
            
            axios.post(`${BACKEND_URL}/product`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Product added successfully!',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/view-product');
                });
                setFormData({
                    productName: '',
                    categoryName: '',
                    productPrice: '',
                    productImage: null,
                    productDescription: '',
                });
            })
            .catch(error => {
                console.error('Error adding product:', error);
                const errorMsg = error.response?.data?.message || 'Failed to add product';
                Swal.fire({
                    title: 'Error!',
                    text: errorMsg,
                    icon: 'error',
                    timer: 2500,
                    showConfirmButton: false
                });
            })
            .finally(() => {
                setLoading(false);
            });
        }
    };

    return (
        <>
            <FrtNavigation />
            <div className="add-user-container">
                <h1 className="form-head">
                    <div className='back-arrow' onClick={() => navigate('/view-product')}>
                        <i className="bi bi-caret-left-fill"></i>
                    </div>
                    Add New Product
                </h1>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding product. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-3 row">
                            <label htmlFor="productName" className="col-sm-2 col-form-label">Product Name *</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.productName ? 'is-invalid' : ''}`}
                                    id="productName"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    required
                                />
                                {errors.productName && <div className="invalid-feedback">{errors.productName}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="categoryName" className="col-sm-2 col-form-label">Category *</label>
                            <div className="col-sm-10">
                                <div className="form-select-wrapper">
                                    <select
                                        className={`form-select ${errors.categoryName ? 'is-invalid' : ''}`}
                                        id="categoryName"
                                        name="categoryName"
                                        value={formData.categoryName}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.categoryName} value={category.categoryName}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.categoryName && <div className="invalid-feedback">{errors.categoryName}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="productPrice" className="col-sm-2 col-form-label">Product Price *</label>
                            <div className="col-sm-10">
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.productPrice ? 'is-invalid' : ''}`}
                                    id="productPrice"
                                    name="productPrice"
                                    value={formData.productPrice}
                                    onChange={handleChange}
                                    placeholder="Enter product price"
                                    required
                                />
                                {errors.productPrice && <div className="invalid-feedback">{errors.productPrice}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="productImage" className="col-sm-2 col-form-label">Product Image *</label>
                            <div className="col-sm-10">
                                <div className="image-preview-container">
                                    <input
                                        type="file"
                                        id="productImage"
                                        name="productImage"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />

                                    <label htmlFor="productImage" className={`custom-file-upload ${errors.productImage ? 'is-invalid' : ''}`}>
                                    Choose Image
                                    </label>
                                    
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Product Preview" />
                                        </div>
                                    )}
                                    {errors.productImage && <div className="invalid-feedback">{errors.productImage}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="productDescription" className="col-sm-2 col-form-label">Product Description *</label>
                            <div className="col-sm-10">
                                <textarea
                                    className={`form-control ${errors.productDescription ? 'is-invalid' : ''}`}
                                    id="productDescription"
                                    name="productDescription"
                                    value={formData.productDescription}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="4"
                                    required
                                />
                                {errors.productDescription && <div className="invalid-feedback">{errors.productDescription}</div>}
                            </div>
                        </div>

                        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

                        <button type="submit" className="btn btn-primary-submit">Add Product</button>
                    </form>
                )}
            </div>
            <SecFooter/>
        </>
    );
};

export default AddProduct;
