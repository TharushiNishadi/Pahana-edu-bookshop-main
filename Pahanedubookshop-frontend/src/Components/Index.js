import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Footer from '../Components/footer';
import Navigation from '../Components/Navigations/navigation';
import '../CSS/Home.css';

const Index = () => {
    useEffect(() => {
        AOS.init({ duration: 2000 });
    }, []);

    const [feedback, setFeedback] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // Added loading state

    const validate = () => {
        const errors = {};
        if (!feedback.name) errors.name = "Name is required";
        if (!feedback.email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(feedback.email)) {
            errors.email = "Email is invalid";
        }
        if (!feedback.phoneNumber) {
            errors.phoneNumber = "Phone number is required";
        } else if (!/^\d+$/.test(feedback.phoneNumber)) {
            errors.phoneNumber = "Phone number must be digits only";
        }
        if (!feedback.subject) errors.subject = "Subject is required";
        if (!feedback.message) errors.message = "Message is required";
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback({ ...feedback, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setLoading(true); // Set loading to true
            axios.post('/feedback', feedback)
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Feedback submitted successfully!',
                        icon: 'success',
                        timer: 2500,
                        showConfirmButton: false
                    });
                    setFeedback({
                        name: '',
                        email: '',
                        phoneNumber: '',
                        subject: '',
                        message: ''
                    });
                    setErrors({});
                })
                .catch(error => {
                    console.error('Error submitting feedback:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error submitting feedback',
                        icon: 'error',
                        timer: 2500,
                        showConfirmButton: false
                    });
                })
                .finally(() => {
                    setLoading(false); // Set loading to false after request completes
                });
        }
    };

    return (
        <>
            <div className="index-container">
                <Navigation />
                <div className="content">
                    <h2 className="authentic-taste" data-aos="fade-up">
                        <span className="authentic">PAHANA EDU</span> <span className="taste">BOOKSHOP</span>
                    </h2>
                    <h4 className="subHeading" data-aos="fade-up">Bringing you the authentic Sri Lankan culinary experience by Phana Edu Bookshop.</h4>

                    <div className="button-container" data-aos="fade-up">
                        <Link to="/menu" className="btn btn-gold-sub">Menu</Link>
                    </div>
                </div>
            </div>

            <div className="mid-container" data-aos="fade-up">
                <h4 className="mid-head">What is the Pahana Edu Bookshop</h4>
                <div className="col-md-8 col-sm-10">
                    <p className="mid-para">Pahana Edu Bookshop is truly a proper combination of the tradition and the modernity that brings the future to the present. Over the last five decades it has emerged as a prestigious and the foremost network of bookshops in Sri Lanka, with rapid development and expansion of it’s business activities both in terms of quality and quantity.</p>
                </div>
            </div>

            <div className="container mt-5" data-aos="fade-up">
                <h1 className="form-head">SEND US YOUR FEEDBACK</h1>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Sending your feedback. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 row">
                            <label htmlFor="name" className="col-sm-2 col-form-label">Your Name</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={feedback.name}
                                    onChange={handleChange}
                                    placeholder="Enter your Name"
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="email" className="col-sm-2 col-form-label">Your Email</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    name="email"
                                    value={feedback.email}
                                    onChange={handleChange}
                                    placeholder="Enter your Email"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="phoneNumber" className="col-sm-2 col-form-label">Phone Number</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={feedback.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your Contact Number"
                                />
                                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="subject" className="col-sm-2 col-form-label">Subject</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                    id="subject"
                                    name="subject"
                                    value={feedback.subject}
                                    onChange={handleChange}
                                    placeholder="Enter Subject"
                                />
                                {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="message" className="col-sm-2 col-form-label">Enter your Message</label>
                            <div className="col-sm-10">
                                <textarea
                                    className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                    id="message"
                                    name="message"
                                    value={feedback.message}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Enter your message..."
                                ></textarea>
                                {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary-submit" id='submitFeedback'>Submit your Feedback</button>
                    </form>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Index;
