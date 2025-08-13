
import React, { useEffect, useState } from 'react';
import '../CSS/Form.css';
import Footer from './footer';
import Navigation from './Navigations/navigation';

const Contact = () => {
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('/branch');
                const data = await response.json();
                setBranches(data);
            } catch (error) {
                console.error('Error fetching branch data:', error);
            }
        };

        fetchBranches();
    }, []);

    return (
        <>
            <Navigation />

            <div className="menu-container">
                <div className="menu-header">
                    <h1 className="menu-heading">
                        <span className="menu-heading-tasty">Contact</span> <span className="menu-heading-dishes">Pahana Edu Bookshop</span>
                    </h1>
                </div>
            </div>

            <div className="contact-container">
                <div className="contact-sections">
                    <div className="contact-section">
                        <h2 className="section-heading">OPENING HOURS</h2>
                        <p>MONDAY - FRIDAY</p>
                        <p>08.30 AM - 06.00 PM</p>
                        <br />
                        <p>SATURDAY - SUNDAY</p>
                        <p>08.30 AM - 01.30 PM</p>
                    </div>

                    <div className="contact-section">
                        <h2 className="section-heading">EMAIL & PHONE</h2>
                        <div className="contact-info">
                            <p><i className="bi bi-envelope-fill contact-icon"></i> bookshop000@gmail.com</p>
                        </div>
                        <div className="contact-info">
                            <p><i className="bi bi-telephone-fill contact-icon"></i> +1 156 644 44</p>
                        </div>
                        <div className="contact-info">
                            <p><i className="bi bi-whatsapp contact-icon"></i> (+94) 71 111 0433</p>
                        </div>
                    </div>

                    {/* <div className="contact-section">
                        <h2 className="section-heading">BRANCHES & ADDRESS</h2>
                        {branches.length > 0 ? (
                            branches.map(branch => (
                                <div key={branch.id} className="branch-info">
                                    <p>{branch.branchName} - {branch.branchAddress}</p>
                                    
                                </div>
                            ))
                        ) : (
                            <p>No branch information available.</p>
                        )}
                    </div> */}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default Contact;
