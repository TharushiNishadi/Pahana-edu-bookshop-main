import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import Footer from '../footer';
import Navigation from '../Navigations/navigation';

const Login = () => {
    const [loginData, setLoginData] = useState({
        userEmail: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const errors = {};
        if (!loginData.userEmail) errors.userEmail = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(loginData.userEmail)) errors.userEmail = "Email is invalid";

        if (!loginData.password) errors.password = "Password is required";
        else if (loginData.password.length <= 6) errors.password = "Password must be longer than 6 characters";
        
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            const errorMessages = Object.values(validationErrors).join(' ');
            Swal.fire({
                title: 'Validation Error!',
                text: errorMessages,
                icon: 'error',
                timer: 2500,
                showConfirmButton: false
            });
        } else {
            setLoading(true);
            try {
                console.log('Sending login request with data:', loginData);
                const response = await axios.post('/user/login', loginData);
                console.log('Login response:', response.data);
                const { token, user } = response.data;

                console.log('JWT Token:', token);

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                Swal.fire({
                    title: 'Success!',
                    text: `Login successful! Now you are logged in as a ${user.userType}.`,
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false,
                    id:'successLogin'
                
                });

                setLoading(false);

                switch (user.userType) {
                    case 'Admin':
                        navigate('/admin-dashboard');
                        break;
                    case 'Staff':
                        navigate('/staff-dashboard');
                        break;
                    case 'Customer':
                        navigate('/customer-dashboard');
                        break;
                    default:
                        navigate('/');
                        break;
                }

                setLoginData({ userEmail: '', password: '' });
            } catch (error) {
                console.error('Error logging in:', error.response ? error.response.data : error.message);
                Swal.fire({
                    title: 'Error!',
                    text: 'Invalid Email or Password...Try Again',
                    icon: 'error',
                    timer: 2500,
                    showConfirmButton: false,
                    id:'errorLogin'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <Navigation />

            <div className="login-container">
                <h1 className="form-head">Sign in to Account</h1>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Checking your login Credentials. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="mb-3 row">
                            <label htmlFor="userEmail" className="col-sm-2 col-form-label">Your Email</label>
                            <div className="col-sm-10">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="userEmail"
                                    name="userEmail"
                                    value={loginData.userEmail}
                                    onChange={handleChange}
                                    placeholder="Enter your Email"
                                />
                            </div>
                        </div>

                        <div className="mb-3 row password-wrapper">
                            <label htmlFor="password" className="col-sm-2 col-form-label">Password</label>
                            <div className="col-sm-10">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your Password"
                                />
                                <span className="eye-icon" onClick={togglePasswordVisibility}>
                                    {passwordVisible ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                            </div>
                        </div>

                        <div className="forget-password-link-main">
                            <Link to="/forget-password-1" className="forget-password-link">Forget Password?</Link>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button type="submit" className="btn btn-primary-submit" id='submitLogin' disabled={loading}>SIGN IN</button>
                        </div>

                        <p className="mt-3 text-center">
                            Don't have an Account? <Link to="/register" className="forget-password-link">Sign up</Link>
                        </p>
                    </form>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Login;
