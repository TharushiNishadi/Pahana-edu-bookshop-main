import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css'; // Assuming you have a CSS file for styling
import FrtNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';

const AddImage = () => {
    const [formData, setFormData] = useState({
        pictureType: '',
        picturePath: null, // This will be a file input
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const navigate = useNavigate();

    // Preview the image when a file is selected
    useEffect(() => {
        if (formData.picturePath) {
            const objectUrl = URL.createObjectURL(formData.picturePath);
            setImagePreview(objectUrl);

            // Clean up the preview URL when component is unmounted or image changes
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [formData.picturePath]);

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        if (!formData.pictureType) {
            newErrors.pictureType = 'Picture Type is required';
        }

        if (!formData.picturePath) {
            newErrors.picturePath = 'Picture file is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({ ...prevData, picturePath: file }));
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);

            const data = new FormData();
            data.append('pictureType', formData.pictureType);
            data.append('picturePath', formData.picturePath);

            axios.post('/gallery', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Image added successfully!',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/view-gallery');
                });
                setFormData({
                    pictureType: '',
                    picturePath: null,
                });
                setImagePreview('');
            })
            .catch(error => {
                console.error('Error adding image:', error);
                const errorMsg = error.response?.data?.message || 'Failed to add image';
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
                    <div className='back-arrow' onClick={() => navigate('/view-gallery')}>
                        <i className="bi bi-caret-left-fill"></i>
                    </div>
                    Add New Image
                </h1>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding image. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="mb-3 row">
                            <label htmlFor="pictureType" className="col-sm-2 col-form-label">Picture Type *</label>
                            <div className="col-sm-10">
                                <div className="form-select-wrapper">
                                    <select
                                        className={`form-select ${errors.pictureType ? 'is-invalid' : ''}`}
                                        id="pictureType"
                                        name="pictureType"
                                        value={formData.pictureType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Picture type</option>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Non-Fictions">Non-Fiction</option>
                                        <option value="Childrens Book">Childrens Book</option>
                                        <option value="Educational Books">Educational Books</option>
                                        <option value="others">Others</option>
                                    </select>
                                    {errors.pictureType && <div className="invalid-feedback">{errors.pictureType}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="picturePath" className="col-sm-2 col-form-label">Picture File *</label>
                            <div className="col-sm-10">
                                <div className="image-preview-container">
                                    <input
                                        type="file"
                                        id="picturePath"
                                        name="picturePath"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />

                                    <label htmlFor="picturePath" className={`custom-file-upload ${errors.picturePath ? 'is-invalid' : ''}`}>
                                        Choose Image
                                    </label>

                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Image Preview" />
                                        </div>
                                    )}
                                    {errors.picturePath && <div className="invalid-feedback">{errors.picturePath}</div>}
                                </div>
                            </div>
                        </div>

                        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

                        <button type="submit" className="btn btn-primary-submit">Add Image</button>
                    </form>
                )}
            </div>
<SecFooter/>

        </>
    );
};

export default AddImage;
