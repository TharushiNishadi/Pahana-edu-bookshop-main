import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import '../../CSS/Profile.css';
import SecFooter from '../footer2';
import TrdNavigation from '../Navigations/navigation3';

const StaffDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [userBranch, setUserBranch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserBranch = async () => {
      try {
        const token = localStorage.getItem('token');
        const decoded = jwtDecode(token);
        const response = await axios.get(`/user/${decoded.userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUserBranch(response.data.branch.trim());
      } catch (error) {
        console.error('Error fetching user branch:', error);
      }
    };

    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/reservation', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log(response.data);

        const filteredReservations = response.data.filter(
          (reservation) => reservation.branch.trim() === userBranch
        );

        const sortedReservations = filteredReservations.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB - dateA;
        });

        setReservations(sortedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchUserBranch().then(fetchReservations);
  }, [userBranch]);

  const handleConfirmClick = (reservationId, status) => {
    setCurrentReservationId(reservationId);
    setStatusToUpdate(status);
    setShowModal(true);
  };

  const updateReservationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/reservation/${currentReservationId}/status`, null, {
        params: { status: statusToUpdate },
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setReservations((prevReservations) =>
        prevReservations
          .map((reservation) =>
            reservation.reservationId === currentReservationId
              ? { ...reservation, status: statusToUpdate }
              : reservation
          )
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA;
          })
      );
      setShowModal(false);
    } catch (error) {
      console.error(`Error updating reservation status to ${statusToUpdate}:`, error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredReservations = reservations.filter((reservation) => {
    
    const reservationId = typeof reservation.reservationId === 'string' ? reservation.reservationId.toLowerCase() : '';
    const name = typeof reservation.name === 'string' ? reservation.name.toLowerCase() : '';
    const email = typeof reservation.email === 'string' ? reservation.email.toLowerCase() : '';
    const phoneNumber = typeof reservation.phoneNumber === 'string' ? reservation.phoneNumber.toLowerCase() : '';

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return reservationId.includes(lowerCaseSearchTerm) ||
          name.includes(lowerCaseSearchTerm) ||
          email.includes(lowerCaseSearchTerm) ||
          phoneNumber.includes(lowerCaseSearchTerm);
  });

  return (
    <div>
      <TrdNavigation />
      <h1 className="form-head-one">
        <span>{userBranch} Reservations</span>
      </h1>
      
      <div className="search-container-one">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search Reservations..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="gallery-container">
        <div className="gallery-content">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Date</th>
                <th>Time</th>
                <th>Persons</th>
                <th>Request</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <tr key={reservation.reservationId}>
                    <td>{reservation.reservationId}</td>
                    <td>{reservation.name}</td>
                    <td>{reservation.email}</td>
                    <td>{reservation.phoneNumber}</td>
                    <td>{reservation.date}</td>
                    <td>{reservation.time}</td>
                    <td>{reservation.persons}</td>
                    <td>{reservation.request}</td>
                    <td>{reservation.status}</td>
                    <td>
                      {reservation.status === 'Pending' ? (
                        <>
                          <button
                            className="btn-confirm"
                            onClick={() =>
                              handleConfirmClick(reservation.reservationId, 'Confirmed')
                            }
                          >
                            Confirm
                          </button>
                          <button
                            className="btn-deny"
                            onClick={() =>
                              handleConfirmClick(reservation.reservationId, 'Denied')
                            }
                          >
                            Deny
                          </button>
                        </>
                      ) : reservation.status === 'Confirmed' ? (
                        <i className="bi bi-check-circle-fill text-success"></i>
                      ) : (
                        <i className="bi bi-x-circle-fill text-danger"></i>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No reservations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for confirmation */}
      {showModal && (
        <>
          <div className="modal-backdrop-blur"></div>

          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reservation Confirmation</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to {statusToUpdate} this reservation?</p>
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
                    onClick={updateReservationStatus}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <SecFooter />
    </div>
  );
};

export default StaffDashboard;
