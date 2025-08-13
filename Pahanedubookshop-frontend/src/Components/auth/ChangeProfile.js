import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Profile.css';
import SecFooter from '../footer2';
import SecNavigation from '../Navigations/navigation2';
import TrdNavigation from '../Navigations/navigation3';
import FrtNavigation from '../Navigations/navigation4';

const ChangeProfile = () => {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  const baseImageUrl = 'http://localhost:8080/images/';


  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token is missing or expired');

      const decodedToken = jwtDecode(token);
      const { userId, userType } = decodedToken;
      setUserType(userType);

      const response = await axios.get(`/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const userData = response.data;

      setUsername(userData.username);
      setPhoneNumber(userData.phoneNumber);
      setProfilePictureUrl(userData.profilePicture ? `${baseImageUrl}${userData.profilePicture}` : 'path/to/default/profile/picture.jpg');
      setUserId(userData.userId);
      setUserEmail(userData.userEmail);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage('Failed to fetch user data.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePhoneNumberChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePictureUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !phoneNumber) {
      setMessage('Username and phone number are required.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Token is missing');
      return;
    }

    const decodedToken = jwtDecode(token);
    const { userId } = decodedToken;

    const formData = new FormData();
    formData.append('username', username);
    formData.append('phoneNumber', phoneNumber);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      await axios.put(`/user/profile/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessage('Profile Updated Successfully');
      fetchUserData();
      setUsername('');
      setPhoneNumber('');
      setProfilePicture(null);
      setProfilePictureUrl('');
      window.location.reload();
      setTimeout(() => {
        setMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  const renderNavigation = () => {
    switch (userType) {
      case 'Customer':
        return <SecNavigation />;
      case 'Staff':
        return <TrdNavigation />;
      case 'Admin':
        return <FrtNavigation />;
      default:
        return null;
    }
  };

  return (
    <>
      {renderNavigation()}
      
      <h1 className="form-head-one">
      {userType === 'Admin' && (
            <div className="back-arrow">
              <span className="back-arrow-one" onClick={() => navigate('/admin-dashboard')}>
                <i className="bi bi-caret-left-fill"></i>
              </span>
            </div>
          )}
        <span>Change Profile</span>
      </h1>
      <div className="change-profile-container">
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3 row">
            <div className="col-md-4">
              <div className="profile-picture-section">
                <img
                  src={profilePictureUrl || 'path/to/default/profile/picture.jpg'}
                  alt="Profile"
                  className="img-thumbnail"
                />
                <div>
                  <label className="file-input-button">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                    Select Profile Picture
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="mb-3 row">
                <label htmlFor="userId" className="col-sm-4 col-form-label">User ID</label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className="form-control"
                    id="userId"
                    value={userId}
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="userEmail" className="col-sm-4 col-form-label">Email</label>
                <div className="col-sm-8">
                  <input
                    type="email"
                    className="form-control"
                    id="userEmail"
                    value={userEmail}
                    readOnly
                  />
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="username" className="col-sm-4 col-form-label">Username *</label>
                <div className="col-sm-8">
                  <input
                    type="text"
                    className={`form-control ${message.includes('required') ? 'is-invalid' : ''}`}
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your Username"
                    required
                  />
                  {message.includes('required') && <div className="invalid-feedback">{message}</div>}
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="phoneNumber" className="col-sm-4 col-form-label">Phone Number *</label>
                <div className="col-sm-8">
                  <input
                    type="tel"
                    className={`form-control ${message.includes('required') ? 'is-invalid' : ''}`}
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Enter your Phone Number"
                    required
                  />
                  {message.includes('required') && <div className="invalid-feedback">{message}</div>}
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary-submit" id='updateProfile'>Update Profile</button>
        </form>
      </div>
      <SecFooter/>
    </>
  );
};

export default ChangeProfile;
