import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FrtNavigation from "../Navigations/navigation4";
import SideNavigation from "../Navigations/navigation5";
import SecFooter from '../footer2';

const AdminReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/reservation', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const sortedReservations = sortReservations(response.data);
        setReservations(sortedReservations);
        setFilteredReservations(sortedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchReservations();
  }, []);

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

      const updatedReservations = reservations.map((reservation) =>
        reservation.reservationId === currentReservationId
          ? { ...reservation, status: statusToUpdate }
          : reservation
      );

      setReservations(sortReservations(updatedReservations));
      setFilteredReservations(sortReservations(updatedReservations));
      setShowModal(false);
    } catch (error) {
      console.error(`Error updating reservation status to ${statusToUpdate}:`, error);
    }
  };

  const sortReservations = (reservations) => {
    return reservations.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB - dateA;
    });
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    const filtered = reservations.filter((reservation) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const reservationId = typeof reservation.reservationId === 'string' ? reservation.reservationId.toLowerCase() : '';
      const name = typeof reservation.name === 'string' ? reservation.name.toLowerCase() : '';
      const email = typeof reservation.email === 'string' ? reservation.email.toLowerCase() : '';
      const phoneNumber = typeof reservation.phoneNumber === 'string' ? reservation.phoneNumber.toLowerCase() : '';

      return reservationId.includes(lowerCaseSearchTerm) ||
             name.includes(lowerCaseSearchTerm) ||
             email.includes(lowerCaseSearchTerm) ||
             phoneNumber.includes(lowerCaseSearchTerm);
    });

    setFilteredReservations(sortReservations(filtered));
  };

  return (
    <>
      <FrtNavigation />
      <div className="gallery-container">
        <SideNavigation />
        <div className="add-user-container">
          <div className="search-container-one">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search Reservations..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

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
      </div>

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
      <SecFooter/>
    </>
  );
};

export default AdminReservation;
