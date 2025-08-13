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
  const [success] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be numeric';
    }

    if (!formData.userType) {
      newErrors.userType = 'User type is required';
    }

    if (formData.userType === 'Staff' && !formData.branch) {
      newErrors.branch = 'Branch is required for Staff';
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

      axios
        .post('/user/userAdd', {
          username: formData.username,
          userEmail: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          userType: formData.userType,
          profilePicture: formData.profilePicture,
        })
        .then(response => {
          Swal.fire({
            title: 'Success!',
            text: 'User added successfully!',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          }).then(() => {
            navigate('/admin-dashboard');
          });
          setFormData({
            username: '',
            email: '',
            phoneNumber: '',
            userType: '',
            password: '',
            profilePicture: 'default.jpg'
          });
        })
        .catch(error => {
          console.error('Error adding user:', error);
          const errorMsg = error.response?.data?.message || 'Failed to add user';
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

        {loading ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding user. Please wait...</p>
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

            <button type="submit" className="btn btn-primary-submit">Add User</button>
          </form>
        )}
      </div>
      <SecFooter/>
    </>
  );
};

export default AddUser;
