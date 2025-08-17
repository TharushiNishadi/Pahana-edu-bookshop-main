import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Swal from 'sweetalert2';
import FrtNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';
import '../../CSS/Profile.css';

const Profile = () => {
    const [user, setUser] = useState({
        username: '',
        userEmail: '',
        phoneNumber: '',
        userType: '',
        profilePicture: 'default.jpg',
        createdAt: ''
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const decoded = jwtDecode(token);
            const response = await axios.get(`/user/${decoded.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const userData = response.data;
            setUser({
                username: userData.username || 'User',
                userEmail: userData.userEmail || 'user@example.com',
                phoneNumber: userData.phoneNumber || 'N/A',
                userType: userData.userType || 'Customer',
                profilePicture: userData.profilePicture || 'default.jpg',
                createdAt: userData.createdAt || new Date().toISOString()
            });

            if (userData.profilePicture) {
                setImagePreview(`/images/${userData.profilePicture}`);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load profile information',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const decoded = jwtDecode(token);
            
            const updateData = {
                username: user.username,
                phoneNumber: user.phoneNumber,
                userType: user.userType
            };

            const response = await axios.put(`/user/${decoded.userId}`, updateData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile updated successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update profile',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    return (
        <>
            <FrtNavigation />
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-header">
                        <h1>My Profile</h1>
                        <p>Manage your account information and preferences</p>
                    </div>

                    <div className="profile-content">
                        <div className="profile-section">
                            <div className="profile-picture-section">
                                <div className="profile-picture-container">
                                    <img 
                                        src={imagePreview || `/images/${user.profilePicture}`} 
                                        alt="Profile" 
                                        className="profile-picture"
                                        onError={(e) => {
                                            e.target.src = '/images/default.jpg';
                                        }}
                                    />
                                    {isEditing && (
                                        <div className="image-upload-overlay">
                                            <label htmlFor="profile-image" className="upload-button">
                                                <i className="bi bi-camera"></i>
                                                Change Photo
                                            </label>
                                            <input
                                                id="profile-image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="profile-details">
                                <div className="detail-group">
                                    <label>Username</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={user.username}
                                            onChange={(e) => setUser({...user, username: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <span className="detail-value">{user.username}</span>
                                    )}
                                </div>

                                <div className="detail-group">
                                    <label>Email</label>
                                    <span className="detail-value email-value">{user.userEmail}</span>
                                    <small className="email-note">Email cannot be changed</small>
                                </div>

                                <div className="detail-group">
                                    <label>Phone Number</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={user.phoneNumber}
                                            onChange={(e) => setUser({...user, phoneNumber: e.target.value})}
                                            className="edit-input"
                                        />
                                    ) : (
                                        <span className="detail-value">{user.phoneNumber}</span>
                                    )}
                                </div>

                                <div className="detail-group">
                                    <label>User Type</label>
                                    {isEditing ? (
                                        <select
                                            value={user.userType}
                                            onChange={(e) => setUser({...user, userType: e.target.value})}
                                            className="edit-select"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Staff">Staff</option>
                                            <option value="Customer">Customer</option>
                                        </select>
                                    ) : (
                                        <span className="detail-value user-type-badge">{user.userType}</span>
                                    )}
                                </div>

                                <div className="detail-group">
                                    <label>Member Since</label>
                                    <span className="detail-value">{formatDate(user.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            {isEditing ? (
                                <>
                                    <button 
                                        className="btn btn-primary save-btn" 
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button 
                                        className="btn btn-secondary cancel-btn" 
                                        onClick={() => setIsEditing(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="btn btn-primary edit-btn" 
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="bi bi-pencil"></i> Edit Profile
                                    </button>
                                    <button 
                                        className="btn btn-outline-primary change-password-btn" 
                                        onClick={() => navigate('/change-password')}
                                    >
                                        <i className="bi bi-key"></i> Change Password
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <SecFooter />
        </>
    );
};

export default Profile;
