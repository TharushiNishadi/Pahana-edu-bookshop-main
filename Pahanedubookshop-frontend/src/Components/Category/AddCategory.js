import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import FrtNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';

const AddCategory = () => {
    const [formData, setFormData] = useState({
        categoryName: '',
        categoryDescription: '',
        categoryImage: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({ ...prevData, categoryImage: file }));
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.categoryName) {
            newErrors.categoryName = 'Category Name is required';
        }

        if (!formData.categoryImage) {
            newErrors.categoryImage = 'Category Image is required';
        }

        if (!formData.categoryDescription) {
            newErrors.categoryDescription = 'Category Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);

            const data = new FormData();
            data.append('categoryName', formData.categoryName);
            data.append('categoryImage', formData.categoryImage);
            data.append('categoryDescription', formData.categoryDescription);

            axios.post('/category', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Category added successfully!',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/view-category');
                });
                setFormData({
                    categoryName: '',
                    categoryDescription: '',
                    categoryImage: null,
                });
                setImagePreview('');
            })
            .catch(error => {
                console.error('Error adding category:', error);
                const errorMsg = error.response?.data?.message || 'Failed to add category';
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
                    <div className='back-arrow' onClick={() => navigate('/view-category')}>
                        <i className="bi bi-caret-left-fill"></i>
                    </div>
                    Add New Category
                </h1>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding category. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-3 row">
                            <label htmlFor="categoryName" className="col-sm-2 col-form-label">Category Name *</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.categoryName ? 'is-invalid' : ''}`}
                                    id="categoryName"
                                    name="categoryName"
                                    value={formData.categoryName}
                                    onChange={handleChange}
                                    placeholder="Enter category name"
                                    required
                                />
                                {errors.categoryName && <div className="invalid-feedback">{errors.categoryName}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="categoryImage" className="col-sm-2 col-form-label">Category Image *</label>
                            <div className="col-sm-10">
                                <div className="image-preview-container">
                                    <input
                                        type="file"
                                        id="categoryImage"
                                        name="categoryImage"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="categoryImage" className={`custom-file-upload ${errors.categoryImage ? 'is-invalid' : ''}`}>
                                        Choose Image
                                    </label>
                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Category Preview" />
                                        </div>
                                    )}
                                    {errors.categoryImage && <div className="invalid-feedback">{errors.categoryImage}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="categoryDescription" className="col-sm-2 col-form-label">Category Description *</label>
                            <div className="col-sm-10">
                                <textarea
                                    className={`form-control ${errors.categoryDescription ? 'is-invalid' : ''}`}
                                    id="categoryDescription"
                                    name="categoryDescription"
                                    value={formData.categoryDescription}
                                    onChange={handleChange}
                                    placeholder="Enter category description"
                                    rows="4"
                                    required
                                />
                                {errors.categoryDescription && <div className="invalid-feedback">{errors.categoryDescription}</div>}
                            </div>
                        </div>

                        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

                        <button type="submit" className="btn btn-primary-submit">Add Category</button>
                    </form>
                )}
            </div>
            <SecFooter/>
        </>
    );
};

export default AddCategory;
