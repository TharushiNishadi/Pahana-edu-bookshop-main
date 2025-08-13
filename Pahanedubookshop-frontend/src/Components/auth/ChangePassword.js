import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Form.css';
import SecFooter from '../footer2';
import SecNavigation from '../Navigations/navigation2';
import TrdNavigation from '../Navigations/navigation3';
import FrtNavigation from '../Navigations/navigation4';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserType(decodedToken.userType);
    }
  }, []);

  const handleCurrentPasswordChange = (event) => {
    setCurrentPassword(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleConfirmNewPasswordChange = (event) => {
    setConfirmNewPassword(event.target.value);
  };

  const toggleCurrentPasswordVisibility = () => {
    setCurrentPasswordVisible(!currentPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const toggleConfirmNewPasswordVisibility = () => {
    setConfirmNewPasswordVisible(!confirmNewPasswordVisible);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'All fields are required.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Swal.fire({
        title: 'Error!',
        text: 'New passwords do not match.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        title: 'Error!',
        text: 'Token is missing or expired.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      setLoading(false);
      return;
    }

    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    try {
      const response = await axios.post(
        '/user/verify-and-change-password',
        { userId, currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        Swal.fire({
          title: 'Success!',
          text: 'Password changed successfully.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        }).then(() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to change password.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while changing password.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {userType === 'Customer' && <SecNavigation />}
      {userType === 'Staff' && <TrdNavigation />}
      {userType === 'Admin' && <FrtNavigation />}

      <div className="email-container">
        <form onSubmit={handleSubmit} className="login-form">
          
          
          <h1 className="form-head">
          {userType === 'Admin' && (
            <div className="back-arrow">
              <span className="back-arrow-one" onClick={() => navigate('/admin-dashboard')}>
                <i className="bi bi-caret-left-fill"></i>
              </span>
            </div>
          )}
            Change Password</h1>
          <h2 className="sub-head">
            Enter your current password and a new password for security
          </h2>

          {loading ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ blockSize: '30vh' }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>
                Processing your request. Please wait...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 row password-wrapper">
                <label htmlFor="currentPassword" className="col-sm-2 col-form-label">
                  Current Password
                </label>
                <div className="col-sm-10">
                  <input
                    type={currentPasswordVisible ? 'text' : 'password'}
                    className={`form-control`}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={handleCurrentPasswordChange}
                    placeholder="Enter your current password"
                  />
                  <span className="eye-icon" onClick={toggleCurrentPasswordVisibility}>
                    {currentPasswordVisible ? (
                      <i className="bi bi-eye-slash"></i>
                    ) : (
                      <i className="bi bi-eye"></i>
                    )}
                  </span>
                </div>
              </div>

              <div className="mb-3 row password-wrapper">
                <label htmlFor="newPassword" className="col-sm-2 col-form-label">
                  New Password
                </label>
                <div className="col-sm-10">
                  <input
                    type={newPasswordVisible ? 'text' : 'password'}
                    className={`form-control`}
                    id="newPassword"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="Enter your new password"
                  />
                  <span className="eye-icon" onClick={toggleNewPasswordVisibility}>
                    {newPasswordVisible ? (
                      <i className="bi bi-eye-slash"></i>
                    ) : (
                      <i className="bi bi-eye"></i>
                    )}
                  </span>
                </div>
              </div>

              <div className="mb-3 row password-wrapper">
                <label htmlFor="confirmNewPassword" className="col-sm-2 col-form-label">
                  Confirm New Password
                </label>
                <div className="col-sm-10">
                  <input
                    type={confirmNewPasswordVisible ? 'text' : 'password'}
                    className={`form-control`}
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={handleConfirmNewPasswordChange}
                    placeholder="Confirm your new password"
                  />
                  <span className="eye-icon" onClick={toggleConfirmNewPasswordVisibility}>
                    {confirmNewPasswordVisible ? (
                      <i className="bi bi-eye-slash"></i>
                    ) : (
                      <i className="bi bi-eye"></i>
                    )}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <button type="submit" className="btn btn-primary-submit" disabled={loading}>
                  Change Password
                </button>
              </div>
            </>
          )}
        </form>
      </div>
      <SecFooter />
    </>
  );
};

export default ChangePassword;
