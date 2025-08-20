import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import TrdNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    userType: '',
    password: '',
    profilePicture: 'default.jpg'
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    if (!formData.userType) {
      newErrors.userType = 'User type is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain both letters and numbers';
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
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        Swal.fire({
          title: 'Timeout Error! ⏰',
          text: 'Request took too long. Please try again or check your connection.',
          icon: 'warning',
          timer: 5000,
          showConfirmButton: true
        });
      }, 30000); // 30 seconds timeout
      
      // Log the form data being sent
      console.log('=== SUBMITTING USER FORM ===');
      console.log('Form data:', formData);
      
      const userData = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        userType: formData.userType,
        profilePicture: formData.profilePicture,
      };
      
      console.log('Data being sent to backend:', userData);

      axios
        .post(`${API_BASE_URL}/users`, userData)
        .then(response => {
          clearTimeout(timeoutId); // Clear timeout on success
          console.log('User created successfully:', response.data);
          console.log('About to show success notification...');
          setLoading(false); // Reset loading immediately on success
          
          // Set success message in state
          setSuccess(`User "${formData.username}" added successfully!`);
          
          // Show success notification
          try {
            Swal.fire({
              title: 'Success! ✅',
              text: `User "${formData.username}" added successfully!`,
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
              toast: true,
              position: 'top-end',
              showClass: { 
                popup: 'animate__animated animate__fadeInDown' 
              },
              hideClass: { 
                popup: 'animate__animated animate__fadeOutUp' 
              }
            }).then(() => {
              console.log('Success notification shown, navigating to dashboard...');
              navigate('/admin-dashboard');
            }).catch(error => {
              console.error('Error showing success notification:', error);
              // Fallback to alert if SweetAlert2 fails
              alert(`✅ User "${formData.username}" added successfully!`);
              navigate('/admin-dashboard');
            });
          } catch (error) {
            console.error('Error with SweetAlert2:', error);
            // Fallback to alert if SweetAlert2 fails
            alert(`✅ User "${formData.username}" added successfully!`);
            navigate('/admin-dashboard');
          }
          
          // Reset form data
          setFormData({
            username: '',
            email: '',
            phoneNumber: '',
            userType: '',
            password: '',
            profilePicture: 'default.jpg'
          });
          
          console.log('Form reset completed');
        })
        .catch(error => {
          clearTimeout(timeoutId); // Clear timeout on error
          console.error('Error adding user:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error message:', error.message);
          
          // Reset loading state immediately on error
          setLoading(false);
          
          let errorMsg = 'Failed to add user';
          
          if (error.response) {
            // Backend responded with error
            const backendError = error.response.data;
            if (backendError.error) {
              errorMsg = backendError.error;
            } else if (backendError.message) {
              errorMsg = backendError.message;
            } else {
              errorMsg = `Server error: ${error.response.status}`;
            }
          } else if (error.request) {
            // Request was made but no response received
            errorMsg = 'No response from server. Please check if backend is running.';
          } else {
            // Something else happened
            errorMsg = error.message || 'Unknown error occurred';
          }
          
          // Show error message
          Swal.fire({
            title: 'Error! ❌',
            text: errorMsg,
            icon: 'error',
            timer: 5000,
            showConfirmButton: true
          });
        });
    } else {
      console.log('Form validation failed:', errors);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  return (
    <>
      <TrdNavigation />
      <div className="add-user-container">
        <h1 className="form-head">
          <div className='back-arrow' onClick={() => navigate('/admin-dashboard')}>
            <i className="bi bi-caret-left-fill"></i>
          </div>
          Add New User
        </h1>
        
        {/* Success Message Display */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <strong>✅ Success!</strong> {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {loading ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding user. Please wait...</p>
            <button 
              type="button" 
              className="btn btn-warning mt-3"
              onClick={() => {
                setLoading(false);
                Swal.fire({
                  title: 'Loading Cancelled',
                  text: 'You can try adding the user again.',
                  icon: 'info',
                  timer: 3000,
                  showConfirmButton: false
                });
              }}
            >
              Cancel & Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3 row">
              <label htmlFor="email" className="col-sm-2 col-form-label">Email *</label>
              <div className="col-sm-10">
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="username" className="col-sm-2 col-form-label">Username *</label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="phoneNumber" className="col-sm-2 col-form-label">Phone Number *</label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="userType" className="col-sm-2 col-form-label">User Type *</label>
              <div className="col-sm-10">
                <div className="form-select-wrapper">
                  <select
                    className={`form-select ${errors.userType ? 'is-invalid' : ''}`}
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select User type</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                  {errors.userType && <div className="invalid-feedback">{errors.userType}</div>}
                </div>
              </div>
            </div>

            {/* {formData.userType === 'Staff' && (
              <div className="mb-3 row">
                <label htmlFor="branch" className="col-sm-2 col-form-label">Branch *</label>
                <div className="col-sm-10">
                  <div className="form-select-wrapper">
                    <select
                      className={`form-select ${errors.branch ? 'is-invalid' : ''}`}
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select a branch</option>
                      {branches.map(branch => (
                        <option key={branch.branchName} value={branch.branchName}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                    {errors.branch && <div className="invalid-feedback">{errors.branch}</div>}
                  </div>
                </div>
              </div>
            )} */}

            <div className="mb-3 row password-wrapper">
              <label htmlFor="password" className="col-sm-2 col-form-label">Password *</label>
              <div className="col-sm-10 position-relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
                <span className="eye-icon" onClick={togglePasswordVisibility}>
                  <i className={`bi ${passwordVisible ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button type="submit" className="btn btn-primary-submit" disabled={loading}>
              {loading ? 'Adding User...' : 'Add User'}
            </button>
          </form>
        )}
      </div>
      <SecFooter/>
    </>
  );
};

export default AddUser;
