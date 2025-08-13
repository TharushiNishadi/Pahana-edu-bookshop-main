import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../CSS/Navigation2.css';
import defaultProfilePic from '../../Image/logo4.png';

const FrtNavigation = () => {

    const [user, setUser] = useState({
        username: '',
        userEmail: '',
        profilePicture: defaultProfilePic
    });
    

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
                username: userData.username,
                userEmail: userData.userEmail,
                profilePicture: userData.profilePicture ? userData.profilePicture : defaultProfilePic
            });
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
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
                    <img src={`/images/${user.profilePicture}`}alt="Profile" className="profile-pic" />
                        <div className="profile-info ms-2">
                            <span className="username">{user.username}</span>
                            <br />
                            <span className="email">{user.userEmail}</span>
                        </div>
                        
                        <div className="dropdown ms-3">
                            <button
                                className="btn btn-secondary dropdown-toggle"
                                type="button"
                                id="dropdownMenuButton"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-gear"></i>
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <li><Link className="dropdown-item" to="/change-profile">Change Profile</Link></li>
                                <li><Link className="dropdown-item" to="/change-password">Change Password</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default FrtNavigation;
