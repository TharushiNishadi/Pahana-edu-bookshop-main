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
        // categoryImage: null, // Temporarily removed until multipart parsing is fixed
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    // const [imagePreview, setImagePreview] = useState(''); // Temporarily removed
    const navigate = useNavigate();

    // Get the API base URL from environment or use default
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

    // Temporarily disabled until multipart parsing is fixed
    // const handleFileChange = (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         setFormData(prevData => ({ ...prevData, categoryImage: file }));
    //         const objectUrl = URL.createObjectURL(file);
    //         setImagePreview(objectUrl);

    //         return () => URL.revokeObjectURL(objectUrl);
    //     }
    // };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.categoryName) {
            newErrors.categoryName = 'Category Name is required';
        }

        // Temporarily disabled image validation until multipart parsing is fixed
        // if (!formData.categoryImage) {
        //     newErrors.categoryImage = 'Category Image is required';
        // }

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

            // Send JSON data instead of multipart form data (temporary fix)
            const jsonData = {
                categoryName: formData.categoryName,
                categoryDescription: formData.categoryDescription
                // categoryImage: formData.categoryImage // Temporarily disabled
            };

            console.log('Sending category creation request to:', `${API_BASE_URL}/category`);
            console.log('JSON data being sent:', jsonData);

            axios.post(`${API_BASE_URL}/category`, jsonData, {
                headers: {
                    'Content-Type': 'application/json'
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
                    // categoryImage: null, // Temporarily removed
                });
                // setImagePreview(''); // Temporarily removed
            })
            .catch(error => {
                console.error('Error adding category:', error);
                console.error('Error response:', error.response);
                console.error('Error request:', error.request);
                
                let errorMsg = 'Failed to add category';
                if (error.response) {
                    // Backend responded with error
                    const backendError = error.response.data;
                    if (backendError.error) {
                        errorMsg = backendError.error;
                    } else if (backendError.message) {
                        errorMsg = backendError.message;
                    } else {
                        errorMsg = `Status: ${error.response.status}`;
                    }
                    console.error('Backend error details:', backendError);
                } else if (error.request) {
                    // Request was made but no response received
                    errorMsg = 'No response from server. Please check if backend is running.';
                    console.error('No response received:', error.request);
                } else {
                    // Something else happened
                    errorMsg = error.message || 'Unknown error occurred.';
                    console.error('Request setup error:', error.message);
                }
                
                Swal.fire({
                    title: 'Error! ❌',
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonText: 'OK'
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
                    <form onSubmit={handleSubmit}>
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
