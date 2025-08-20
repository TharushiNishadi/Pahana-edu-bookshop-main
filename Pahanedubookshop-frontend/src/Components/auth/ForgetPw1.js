import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import SecFooter from '../footer2';

const ForgetPw1 = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Get the API base URL from environment or use default
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (!email) {
            errors.email = 'Email is required.';
        } else if (!validateEmail(email)) {
            errors.email = 'Invalid email format.';
        }

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }

        setLoading(true);
    
        try {
            const response = await axios.post(`${API_BASE_URL}/api/password/request`, {
                email: email
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 200) {
                localStorage.setItem('resetEmail', email);
    
                Swal.fire({
                    title: 'Success!',
                    text: 'Password reset email sent.',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/forget-password-2');
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Error sending password reset email.',
                    icon: 'error',
                    timer: 2500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
        
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || `No account associated with ${email}`,
                icon: 'error',
                timer: 2500,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    };

    return (<>
        <div className="email-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h1 className="form-head">
                    <div className='back-arrow'>
                        <span className="back-arrow" onClick={() => navigate('/login')}>
                            <i className="bi bi-caret-left-fill"></i>
                        </span>
                    </div>
                    Enter email address
                </h1>
                <h2 className="sub-head">
                    Enter the email associated with the account you want to reset the password for
                </h2>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '30vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Processing your email. Please wait...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 row">
                            <label htmlFor="userEmail" className="col-sm-2 col-form-label">Your Email</label>
                            <div className="col-sm-10">
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="userEmail"
                                    name="userEmail"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="Enter your Email"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button type="submit" className="btn btn-primary-submit" disabled={loading}>Next</button>
                        </div>

                        {errors.apiError && <div className="alert alert-danger">{errors.apiError}</div>}
                    </>
                )}
            </form>
            
        </div>
        <SecFooter/>
        </>
    );
};

export default ForgetPw1;
