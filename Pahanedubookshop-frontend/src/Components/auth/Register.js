import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import '../../CSS/Form.css';
import Footer from "../footer";
import Navigation from "../Navigations/navigation";

const Register = () => {
    const [register, setRegister] = useState({
        userEmail: '',
        username: '',
        password: '',
        confirmPassword: '',
        phoneNumber: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    
    const navigate = useNavigate();

    const validate = () => {
        const errors = {};
        if (!register.userEmail) errors.userEmail = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(register.userEmail)) errors.userEmail = "Email is invalid";

        if (!register.username) errors.username = "Name is required";

        if (!register.password) errors.password = "Password is required";
        else if (register.password.length <= 6) errors.password = "Password must be longer than 6 characters";
        else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(register.password)) errors.password = "Password must contain both letters and numbers";

        if (!register.confirmPassword) errors.confirmPassword = "Confirm Password is required";
        else if (register.password !== register.confirmPassword) errors.confirmPassword = "Passwords do not match";

        if (!register.phoneNumber) errors.phoneNumber = "Contact number is required";
        else if (!/^\d+$/.test(register.phoneNumber)) errors.phoneNumber = "Contact number is invalid";

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegister({ ...register, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setLoading(true);

            axios.post('user/register', { ...register, userType: 'Customer' })
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Registration successful! Redirecting to login...',
                        icon: 'success',
                        timer: 2500,
                        showConfirmButton: false
                    }).then(() => {
                        navigate('/login');
                    });
                    setRegister({
                        userEmail: '',
                        username: '',
                        password: '',
                        confirmPassword: '',
                        phoneNumber: ''
                    });
                    setErrors({});
                })
                .catch(error => {
                    console.error('Error registering:', error);
                    const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
                    Swal.fire({
                        title: 'Error!',
                        text: errorMessage,
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

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordVisible(!confirmPasswordVisible);
    };

    return (
        <>
            <Navigation />

            <div className="login-container">
                <h1 className="form-head">Sign up to Account</h1>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Registering now. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="mb-3 row">
                            <label htmlFor="userEmail" className="col-sm-2 col-form-label">Email </label>
                            <div className="col-sm-10">
                                <input
                                    type="email"
                                    className={`form-control ${errors.userEmail ? 'is-invalid' : ''}`}
                                    id="userEmail"
                                    name="userEmail"
                                    value={register.userEmail}
                                    onChange={handleChange}
                                    placeholder="Enter your Email"
                                />
                                {errors.userEmail && <div className="invalid-feedback">{errors.userEmail}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="username" className="col-sm-2 col-form-label">Name</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                    id="username"
                                    name="username"
                                    value={register.username}
                                    onChange={handleChange}
                                    placeholder="Enter your Name"
                                />
                                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row password-wrapper">
                            <label htmlFor="password" className="col-sm-2 col-form-label">Password </label>
                            <div className="col-sm-10">
                                <input
                                    type={passwordVisible ? 'text' : 'password'}
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    id="password"
                                    name="password"
                                    value={register.password}
                                    onChange={handleChange}
                                    placeholder="Enter your Password"
                                />
                                <span className="eye-icon" onClick={togglePasswordVisibility}>
                                    {passwordVisible ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row password-wrapper">
                            <label htmlFor="confirmPassword" className="col-sm-2 col-form-label">Confirm Password </label>
                            <div className="col-sm-10">
                                <input
                                    type={confirmPasswordVisible ? 'text' : 'password'}
                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={register.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Enter your Password again"
                                />
                                <span className="eye-icon" onClick={toggleConfirmPasswordVisibility}>
                                    {confirmPasswordVisible ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                </span>
                                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="phoneNumber" className="col-sm-2 col-form-label">Contact Number </label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={register.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your contact number"
                                />
                                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button type="submit" className="btn btn-primary-submit" id='register' disabled={loading}>CREATE ACCOUNT</button>
                        </div>

                        <p className="mt-3 text-center">
                            Already have an Account? <Link to="/login" className="forget-password-link">Sign in</Link>
                        </p>
                    </form>
                )}
            </div>
            <Footer />
        </>
    );
}

export default Register;
