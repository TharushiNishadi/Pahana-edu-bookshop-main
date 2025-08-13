import Aos from "aos";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import '../../CSS/Form.css';
import Footer from "../footer";
import Navigation from "../Navigations/navigation";

const Reservation = () => {
    useEffect(() => {
        Aos.init({ duration: 2000 });
    }, []);

    const [reservation, setReservation] = useState({
        name: '',
        email: '',
        branch: '',
        phoneNumber: '',
        date: '',
        time: '',
        persons: '',
        request: ''
    });

    const [errors, setErrors] = useState({});
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get('/branch')
            .then(response => {
                console.log('Branches fetched:', response.data);
                setBranches(response.data);
            })
            .catch(error => {
                console.error('Error fetching branches:', error);
            });
    }, []);

    const validate = () => {
        const errors = {};
        if (!reservation.name) errors.name = "Name is required";
        if (!reservation.email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(reservation.email)) {
            errors.email = "Email is invalid";
        }
        if (!reservation.phoneNumber) {
            errors.phoneNumber = "Phone number is required";
        } else if (!/^\d+$/.test(reservation.phoneNumber)) {
            errors.phoneNumber = "Phone number must be digits only";
        }
        if (!reservation.branch) errors.branch = "Branch is required";
        if (!reservation.date) errors.date = "Date is required";
        if (!reservation.time) errors.time = "Time is required";
        if (!reservation.persons) errors.persons = "Number of persons is required";
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReservation({ ...reservation, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setLoading(true);

            const reservationWithStatus = { ...reservation, status: "Pending" };

            axios.post('/reservation', reservationWithStatus)
                .then(response => {
                    Swal.fire({
                        title: 'Success!',
                        text: 'Reservation submitted successfully!',
                        icon: 'success',
                        timer: 2500,
                        showConfirmButton: false
                    });
                    setReservation({
                        name: '',
                        email: '',
                        branch: '',
                        phoneNumber: '',
                        date: '',
                        time: '',
                        persons: '',
                        request: ''
                    });
                    setErrors({});
                })
                .catch(error => {
                    console.error('Error submitting reservation:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error submitting reservation',
                        icon: 'error',
                        timer: 2500,
                        showConfirmButton: false
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    return (
        <>
            <Navigation />

            <div className="menu-container">
                <div className="menu-header">
                    <h1 className="menu-heading">
                        <span className="menu-heading-tasty">Make</span> <span className="menu-heading-dishes">your</span> <span className="menu-heading-tasty">Reservation</span>
                    </h1>
                </div>
            </div>

            <div className="container mt-5" data-aos="fade-up">
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Sending your Reservation. Please wait...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 row">
                            <label htmlFor="name" className="col-sm-2 col-form-label">Your Name *</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={reservation.name}
                                    onChange={handleChange}
                                    placeholder="Enter your Name"
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="email" className="col-sm-2 col-form-label">Your Email *</label>
                            <div className="col-sm-10">
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    id="email"
                                    name="email"
                                    value={reservation.email}
                                    onChange={handleChange}
                                    placeholder="Enter your Email"
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="phoneNumber" className="col-sm-2 col-form-label">Phone Number *</label>
                            <div className="col-sm-10">
                                <input
                                    type="text"
                                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={reservation.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your Contact Number"
                                />
                                {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="branch" className="col-sm-2 col-form-label">Nearest Branch *</label>
                            <div className="col-sm-10">
                                <div className="form-select-wrapper">
                                    <select
                                        className={`form-select ${errors.branch ? 'is-invalid' : ''}`}
                                        id="branch"
                                        name="branch"
                                        value={reservation.branch}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select a branch</option>
                                        {branches.map(branch => (
                                            <option key={branch.branchName} value={branch.branchName}>
                                                {branch.branchName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.branch && <div className="invalid-feedback">{errors.branch}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="date" className="col-sm-2 col-form-label">Date *</label>
                            <div className="col-sm-10">
                                <input
                                    type="date"
                                    className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                                    id="date"
                                    name="date"
                                    value={reservation.date}
                                    onChange={handleChange}
                                />
                                {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="time" className="col-sm-2 col-form-label">Time *</label>
                            <div className="col-sm-10">
                                <input
                                    type="time"
                                    className={`form-control ${errors.time ? 'is-invalid' : ''}`}
                                    id="time"
                                    name="time"
                                    value={reservation.time}
                                    onChange={handleChange}
                                />
                                {errors.time && <div className="invalid-feedback">{errors.time}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="persons" className="col-sm-2 col-form-label">Seats *</label>
                            <div className="col-sm-10">
                                <input
                                    type="number"
                                    className={`form-control ${errors.persons ? 'is-invalid' : ''}`}
                                    id="persons"
                                    name="persons"
                                    value={reservation.persons}
                                    onChange={handleChange}
                                    placeholder="Enter Number of Persons"
                                />
                                {errors.persons && <div className="invalid-feedback">{errors.persons}</div>}
                            </div>
                        </div>

                        <div className="mb-3 row">
                            <label htmlFor="request" className="col-sm-2 col-form-label">Request (optional)</label>
                            <div className="col-sm-10">
                                <textarea
                                    className={`form-control ${errors.request ? 'is-invalid' : ''}`}
                                    id="request"
                                    name="request"
                                    value={reservation.request}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Enter your request..."
                                ></textarea>
                                {errors.request && <div className="invalid-feedback">{errors.request}</div>}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button
                                type="submit"
                                className="btn btn-primary-submit"
                                id="submitReservation"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>
                                        <i className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></i> Submitting...
                                    </span>
                                ) : (
                                    'Submit Reservation'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <Footer />
        </>
    );
};

export default Reservation;
