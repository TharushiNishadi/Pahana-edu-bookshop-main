import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../CSS/Navigation.css';
import logo from '../../Image/logo4.png';

const Navigation = () => {
    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-transparent">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img src={logo} alt="Logo" className="navbar-logo" />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`} to="/menu">Menu</Link>
                        </li>
                        {/* <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/reservation' ? 'active' : ''}`} to="/reservation">Reservation</Link>
                        </li> */}
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`} to="/gallery">Gallery</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} to="/about">About Us</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} to="/contact">Contact</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`btn btn-gold nav-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">Sign in</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
