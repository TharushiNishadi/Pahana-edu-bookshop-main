import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Navigation2.css';
import defaultProfilePic from '../../Image/logo4.png';

const TrdNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        userEmail: '',
        profilePicture: defaultProfilePic
    });
    const [showModal, setShowModal] = useState(false);

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

    const handleLogout = () => {
        setShowModal(true);
    };

    const handleConfirmLogout = () => {
        Swal.fire({
            title: 'Logging out...',
            text: 'Please wait',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        setTimeout(() => {
            localStorage.clear();
            Swal.fire({
                icon: 'success',
                title: 'Logged Out',
                text: 'You have been logged out successfully!',
                timer: 2500,
                showConfirmButton: false
            }).then(() => {
                navigate('/login');
            });
        }, 0);
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
                    <div className="collapse navbar-collapse flex-grow-1 justify-content-center" id="navbarNavDropdown">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/order-staff' ? 'active' : ''}`} to="/order-staff">Orders</Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/feedback-response' ? 'active' : ''}`} to="/feedback-response">Feedbacks</Link>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-gold nav-link" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>
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

            {showModal && (
                <>
                    <div className="modal-backdrop-blur"></div>

                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Logout Confirmation</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to Logout?</p>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        No
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleConfirmLogout}
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default TrdNavigation;
