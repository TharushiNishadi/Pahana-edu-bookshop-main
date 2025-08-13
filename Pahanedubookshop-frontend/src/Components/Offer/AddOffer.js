import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import TrdNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';

const AddOffer = () => {
    const [formData, setFormData] = useState({
        offerName: '',
        offerDescription: '',
        offerValue: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.offerName) {
            newErrors.offerName = 'Offer Name is required';
        }

        if (!formData.offerDescription) {
            newErrors.offerDescription = 'Offer Description is required';
        }

        if (!formData.offerValue) {
            newErrors.offerValue = 'Offer Value is required';
        } else if (isNaN(formData.offerValue)) {
            newErrors.offerValue = 'Offer Value must be a number';
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

            axios
                .post('/offer', {
                    offerName: formData.offerName,
                    offerDescription: formData.offerDescription,
                    offerValue: formData.offerValue,
                })
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Offer added successfully!',
                        icon: 'success',
                        timer: 2500,
                        showConfirmButton: false
                    }).then(() => {
                        navigate('/view-offer');
                    });
                    setFormData({
                        offerName: '',
                        offerDescription: '',
                        offerValue: '',
                    });
                })
                .catch(error => {
                    console.error('Error adding offer:', error);
                    const errorMsg = error.response?.data?.message || 'Failed to add offer';
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
            <TrdNavigation />
            <div className="add-user-container">
                <h1 className="form-head">
                    <div className='back-arrow' onClick={() => navigate('/view-offer')}>
                        <i className="bi bi-caret-left-fill"></i>
                    </div>
                    Add New Offer
                </h1>

                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding offer. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 row">
                            <label htmlFor="offerName" className="col-sm-2 col-form-label">Offer Name *</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.offerName ? 'is-invalid' : ''}`}
                                    id="offerName"
                                    name="offerName"
                                    value={formData.offerName}
                                    onChange={handleChange}
                                    placeholder="Enter offer name"
                                    required
                                />
                                {errors.offerName && <div className="invalid-feedback">{errors.offerName}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="offerDescription" className="col-sm-2 col-form-label">Offer Description *</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.offerDescription ? 'is-invalid' : ''}`}
                                    id="offerDescription"
                                    name="offerDescription"
                                    value={formData.offerDescription}
                                    onChange={handleChange}
                                    placeholder="Enter offer description"
                                    required
                                />
                                {errors.offerDescription && <div className="invalid-feedback">{errors.offerDescription}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="offerValue" className="col-sm-2 col-form-label">Offer Value *</label>
                            <div className="col-sm-10">
                                <input
                                    type="number"
                                    className={`form-control ${errors.offerValue ? 'is-invalid' : ''}`}
                                    id="offerValue"
                                    name="offerValue"
                                    value={formData.offerValue}
                                    onChange={handleChange}
                                    placeholder="Enter offer value"
                                    required
                                />
                                {errors.offerValue && <div className="invalid-feedback">{errors.offerValue}</div>}
                            </div>
                        </div>

                        {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
                        
                        <button type="submit" className="btn btn-primary-submit">Add Offer</button>
                    </form>
                )}
            </div>
            <SecFooter/>
        </>
    );
};

export default AddOffer;
