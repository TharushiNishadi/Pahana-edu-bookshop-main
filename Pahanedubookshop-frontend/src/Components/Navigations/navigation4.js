import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../CSS/Navigation2.css';
import defaultProfilePic from '../../Image/logo4.png';

const FrtNavigation = () => {

    const [user, setUser] = useState({
        username: '',
        userEmail: '',
        profilePicture: defaultProfilePic
    });
    
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.userId);
        }
    }, []);

    const fetchUserData = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const userData = response.data;
            setUser({
                username: userData.username || 'User',
                userEmail: userData.userEmail || 'admin@pahana.com',
                profilePicture: userData.profilePicture ? userData.profilePicture : defaultProfilePic
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Set default values if fetch fails
            setUser({
                username: 'User',
                userEmail: 'admin@pahana.com',
                profilePicture: defaultProfilePic
            });
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const closeDropdown = () => {
        setShowDropdown(false);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-transparent">
                <div className="container-fluid">
                    <div className="navbar-brand" to="/">
                        <span className="navbar-brand-text">Pahana Edu Bookshop</span>
                    </div>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className="profile-container d-flex align-items-center">
                        {/* Profile Picture */}
                        <div className="profile-pic-container">
                            <img 
                                src={`/images/${user.profilePicture}`} 
                                alt="Profile" 
                                className="profile-pic" 
                                onError={(e) => {
                                    e.target.src = defaultProfilePic;
                                }}
                            />
                        </div>
                        
                        {/* Profile Info */}
                        <div className="profile-info ms-3">
                            <div className="username">{user.username}</div>
                            <div className="email">{user.userEmail}</div>
                        </div>
                        
                        {/* Settings Dropdown */}
                        <div className="settings-dropdown ms-3">
                            <button
                                className="settings-button"
                                onClick={toggleDropdown}
                                onBlur={() => setTimeout(closeDropdown, 200)}
                            >
                                <i className="bi bi-gear-fill"></i>
                                <i className="bi bi-chevron-down"></i>
                            </button>
                            
                            {showDropdown && (
                                <div className="dropdown-menu show">
                                    <Link className="dropdown-item" to="/profile" onClick={closeDropdown}>
                                        <i className="bi bi-person"></i> My Profile
                                    </Link>
                                    <Link className="dropdown-item" to="/change-profile" onClick={closeDropdown}>
                                        <i className="bi bi-pencil"></i> Edit Profile
                                    </Link>
                                    <Link className="dropdown-item" to="/change-password" onClick={closeDropdown}>
                                        <i className="bi bi-key"></i> Change Password
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default FrtNavigation;
