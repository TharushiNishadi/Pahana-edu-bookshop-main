import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import SecFooter from '../footer2';

const ResetPw = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem('resetEmail');
        const storedCode = localStorage.getItem('resetCode');
        
        if (storedEmail && storedCode) {
            setEmail(storedEmail);
            setCode(storedCode);
        } else {
            navigate('/forget-password-1');
        }
    }, [navigate]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    const validatePassword = (password) => {
        const minLength = 6;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!password) return 'Password is required.';
        if (password.length < minLength) return `Password must be at least ${minLength} characters long.`;
        if (!hasLetter || !hasNumber) return 'Password must contain both letters and numbers.';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const passwordError = validatePassword(password);
        const confirmPasswordError = password !== confirmPassword ? 'Passwords do not match' : '';

        if (passwordError || confirmPasswordError) {
            setErrors({
                password: passwordError,
                confirmPassword: confirmPasswordError,
            });
            setLoading(false);
            return;
        }

        if (!email || !code) {
            Swal.fire({
                title: 'Error!',
                text: 'Email or verification code is missing.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/password/reset', new URLSearchParams({
                email,
                code,
                newPassword: password
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Password has been reset successfully.',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    localStorage.removeItem('resetEmail');
                    localStorage.removeItem('resetCode');
                    navigate('/login');
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Error resetting password.',
                    icon: 'error',
                    timer: 2500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error during password reset:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to reset password. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK'
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
                        <span className="back-arrow" onClick={() => navigate(-1)}>
                            <i className="bi bi-caret-left-fill"></i>
                        </span>
                    </div>
                    Create New Password
                </h1>
                <h2 className="sub-head">Enter a brand-new password for added security</h2>
                
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '30vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Processing your request. Please wait...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 row password-wrapper">
                            <label htmlFor="password" className="col-sm-2 col-form-label">New Password</label>
                            <div className="col-sm-10">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter your new password"
                                />
                                <span className="eye-icon" onClick={togglePasswordVisibility}>
                                    {passwordVisible ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row password-wrapper">
                            <label htmlFor="confirmPassword" className="col-sm-2 col-form-label">Confirm Password</label>
                            <div className="col-sm-10">
                                <input
                                    type={confirmPasswordVisible ? 'text' : 'password'}
                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    placeholder="Confirm your new password"
                                />
                                <span className="eye-icon" onClick={toggleConfirmPasswordVisibility}>
                                    {confirmPasswordVisible ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button type="submit" className="btn btn-primary-submit" disabled={loading}>Reset Password</button>
                        </div>
                    </>
                )}
            </form>
        </div>
        <SecFooter/>
        </>
    );
};

export default ResetPw;
