import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Profile.css';
import SecFooter from "../footer2";
import FrtNavigation from "../Navigations/navigation4";
import SideNavigation from "../Navigations/navigation5";
import UpdateOfferModal from './UpdateOfferModal';

const ViewOffer = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/offer')
      .then(response => {
        setOffers(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch offers');
        setLoading(false);
      });
  }, []);

  const handleAddOffer = () => {
    navigate('/add-offer');
  };

  const handleEditOffer = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleDeleteOffer = (offerId) => {
    setOfferToDelete(offerId);
    setShowDeleteModal(true);
  };

  const confirmDeleteOffer = () => {
    if (!offerToDelete) return;

    axios.delete(`/offer/${offerToDelete}`)
      .then(() => {
        setOffers(prevOffers => prevOffers.filter(offer => offer.offerId !== offerToDelete));
        setShowDeleteModal(false);
      })
      .catch(() => {
        setError('Failed to delete offer');
      });
  };

  const cancelDeleteOffer = () => {
    setShowDeleteModal(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredOffers = offers.filter(offer =>
    offer.offerId.toLowerCase().includes(searchTerm) ||
    offer.offerName.toLowerCase().includes(searchTerm) ||
    offer.offerDescription.toLowerCase().includes(searchTerm)
  );

  const handleUpdateOffer = () => {
    axios
      .get('/offer')
      .then((response) => {
        setOffers(response.data);
        setShowModal(false);
      })
      .catch(() => {
        setError('Failed to fetch updated offers');
      });
  };

  return (
    <>
      <FrtNavigation />
      <div className="gallery-container">
        <SideNavigation />
        <div className="add-user-container">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <>
              <div className="header-container">
                <div className="search-container-one">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search Offers..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="button-container">
                  <button className="btn-gold-add" onClick={handleAddOffer}>
                    Add Offer
                  </button>
                </div>
              </div>

              <div className='user-table-container'>
                <div className="gallery-content">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Offer ID</th>
                        <th>Offer Name</th>
                        <th>Offer Description</th>
                        <th>Offer Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOffers.map(offer => (
                        <tr key={offer.offerId}>
                          <td>{offer.offerId}</td>
                          <td>{offer.offerName}</td>
                          <td>{offer.offerDescription}</td>
                          <td>{offer.offerValue}</td>
                          <td>
                            <button
                              className="btn-confirm"
                              onClick={() => handleEditOffer(offer)}
                            >
                              Edit Offer
                            </button>
                            <button
                              className="btn-deny"
                              onClick={() => handleDeleteOffer(offer.offerId)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedOffer && (
        <UpdateOfferModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          offer={selectedOffer}
          onUpdate={handleUpdateOffer}
        />
      )}

      {showDeleteModal && (
        <div className="modal-backdrop-blur">
          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={cancelDeleteOffer}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this offer? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelDeleteOffer}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteOffer}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <SecFooter/>
    </>
  );
};

export default ViewOffer;
