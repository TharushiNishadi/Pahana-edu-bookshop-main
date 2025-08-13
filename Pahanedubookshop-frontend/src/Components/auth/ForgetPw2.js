import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import SecFooter from '../footer2';

const ForgetPw2 = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ code: '', apiError: '' });
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
    const navigate = useNavigate();

    useEffect(() => {
        const email = localStorage.getItem('resetEmail');

        if (!email) {
            navigate('/forget-password-1');
            return;
        }

        const timerInterval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [navigate]);

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const validateCode = (code) => {
        if (!code) return 'Verification code is required.';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const codeError = validateCode(code);
        if (codeError) {
            setErrors({ code: codeError, apiError: '' });
            return;
        }

        setLoading(true);

        try {
            const email = localStorage.getItem('resetEmail');

            const response = await axios.post('/api/password/verify', new URLSearchParams({
                email: email,
                code: code,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.status === 200) {
                localStorage.setItem('resetCode', code);

                Swal.fire({
                    title: 'Success!',
                    text: 'Verification code is correct.',
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/reset-pw');
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Invalid or expired verification code.',
                    icon: 'error',
                    timer: 2500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error during verification request:', error);

            Swal.fire({
                title: 'Error!',
                text: 'Your Verification code is Expired or Invalid . Please try again...',
                icon: 'error',
                confirmButtonText: false
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (<>
        <div className="email-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h1 className="form-head">
                    <div className='back-arrow'>
                        <span className="back-arrow" onClick={() => navigate('/forget-password-1')}>
                            <i className="bi bi-caret-left-fill"></i>
                        </span>
                    </div>
                    Enter Verification Code
                </h1>
                <h2 className="sub-head">
                    Enter the verification code sent to your email
                </h2>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '30vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Processing your verification code. Please wait...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 row">
                            <label htmlFor="verificationCode" className="col-sm-2 col-form-label">Verification Code</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                    id="verificationCode"
                                    name="verificationCode"
                                    value={code}
                                    onChange={handleCodeChange}
                                    placeholder="Enter your verification code"
                                />
                                {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button type="submit" className="btn btn-primary-submit" disabled={loading}>VERIFY CODE</button>
                        </div>

                        <div className="countdown-container">
                            <p className="countdown">Time remaining: {formatTime(timeLeft)}</p>
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

export default ForgetPw2;
