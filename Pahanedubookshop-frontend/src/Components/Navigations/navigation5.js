import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SideNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
        

    const [showModal, setShowModal] = useState(false);

    

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
        }, 1000);
    };

    return (
        <>
            <div className="gallery-sidebar">
                <ul className="nav flex-column">

                
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/admin-dashboard' ? 'active' : ''}`} to="/admin-dashboard">User</Link>
                    </li>
                    {/* <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/view-branch' ? 'active' : ''}`} to="/view-branch">Branch</Link>
                    </li> */}
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/view-product' ? 'active' : ''}`} to="/view-product">Products</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/view-category' ? 'active' : ''}`} to="/view-category">Category</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`} to="/reports">Reports</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/view-offer' ? 'active' : ''}`} to="/view-offer">Offers</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/view-gallery' ? 'active' : ''}`} to="/view-gallery">Gallery</Link>
                    </li>
                    {/* <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/admin-reservation' ? 'active' : ''}`} to="/admin-reservation">Reservation</Link>
                    </li> */}
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/admin-feedback' ? 'active' : ''}`} to="/admin-feedback">Feedbacks</Link>
                    </li>
                    <li className="nav-item">
                        <Link className={`nav-link ${location.pathname === '/admin-order' ? 'active' : ''}`} to="/admin-order">Orders</Link>
                    </li>
                    <li className="nav-item">
                        <button className="btn-gold-add" onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
            </div>
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

export default SideNavigation;
