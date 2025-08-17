import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const UpdateOfferModal = ({ show, handleClose, offer, onUpdate }) => {
  const [offerName, setOfferName] = useState(offer?.offerName || '');
  const [offerDescription, setOfferDescription] = useState(offer?.offerDescription || '');
  const [offerValue, setOfferValue] = useState(offer?.offerValue || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offer) {
      setOfferName(offer.offerName);
      setOfferDescription(offer.offerDescription);
      setOfferValue(offer.offerValue);
    }
  }, [offer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!offer?.offerId) {
      console.error('Offer ID is undefined');
      return;
    }

    if (!offerName || !offerDescription || !offerValue) {
      alert('Please fill all required fields.');
      return;
    }

    setLoading(true);

    // Debug logging
    console.log('=== DEBUG OFFER UPDATE ===');
    console.log('Offer object:', offer);
    console.log('Offer ID being sent:', offer.offerId);
    console.log('Form data being sent:', { offerName, offerDescription, offerValue });

    try {
      await axios.put(`/offer/${offer.offerId}`, {
        offerName,
        offerDescription,
        offerValue,
      });
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating offer', error);
      
      // Show detailed error information
      let errorMessage = 'Failed to update offer. ';
      if (error.response) {
        // Backend responded with error
        const backendError = error.response.data;
        if (backendError.error) {
          errorMessage += backendError.error;
        } else if (backendError.message) {
          errorMessage += backendError.message;
        } else {
          errorMessage += `Status: ${error.response.status}`;
        }
        console.error('Backend error details:', backendError);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server. Please check if backend is running.';
        console.error('No response received:', error.request);
      } else {
        // Something else happened
        errorMessage += error.message || 'Unknown error occurred.';
        console.error('Request setup error:', error.message);
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop-blur"></div>
      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Offer - {offerName}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formOfferName">
                  <Form.Label>Offer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formOfferDescription">
                  <Form.Label>Offer Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formOfferValue">
                  <Form.Label>Offer Value</Form.Label>
                  <Form.Control
                    type="number"
                    value={offerValue}
                    onChange={(e) => setOfferValue(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <div className="modal-footer">
                  <Button variant="secondary" onClick={handleClose} className="btn btn-secondary">Close</Button>
                  <Button variant="primary" type="submit" className="btn btn-danger" disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateOfferModal;
