import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../CSS/Footer.css';
import logo from '../Image/logo4.png';

const Footer = () => {
    const location = useLocation();

    return (
        <div>
            <footer className="footer">
                <div></div>
                <div className="footer-logo">
                    <img src={logo} alt="Logo" />
                </div>

                <div className="footer-nav">
                    <div className="foot-head">QUICK ACCESS</div>
                    <ul>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/' ? 'active-link' : ''}`} to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/menu' ? 'active-link' : ''}`} to="/menu">Menu</Link>
                        </li>
                        {/* <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/reservation' ? 'active-link' : ''}`} to="/reservation">Reservation</Link>
                        </li> */}
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/gallery' ? 'active-link' : ''}`} to="/gallery">Gallery</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/about' ? 'active-link' : ''}`} to="/about">About Us</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/contact' ? 'active-link' : ''}`} to="/contact">Contact</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${location.pathname === '/login' ? 'active-link' : ''}`} to="/login">Sign in</Link>
                        </li>
                    </ul>
                </div>

                <div className="footer-social">
                    <div className="foot-head">FOLLOW US</div>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-facebook"></i> Facebook
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-twitter"></i> Twitter
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-instagram"></i> Instagram
                    </a>
                </div>

                <div className="footer-contact">
                    <div className="foot-head">CONTACT US</div>
                    <p>
                        MONDAY – FRIDAY<br />
                        08.30 – 6.30 PM<br /><br />
                        SATURDAY – SUNDAY<br />
                        08.30 – 1.30 PM<br /><br />
                    </p>
                </div>
            </footer>
            <div className="footer-copyright">
                &copy; {new Date().getFullYear()} Pahana Edu Bookshop. All Rights Reserved.
            </div>
        </div>
    );
};

export default Footer;

