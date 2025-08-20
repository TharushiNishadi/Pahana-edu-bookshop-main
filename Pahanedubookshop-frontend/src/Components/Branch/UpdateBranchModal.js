import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const UpdateBranchModal = ({ show, handleClose, branch, onUpdate }) => {
  const [branchName, setBranchName] = useState(branch?.branchName || '');
  const [branchAddress, setBranchAddress] = useState(branch?.branchAddress || '');
  const [branchPhone, setBranchPhone] = useState(branch?.branchPhone || '');
  const [branchEmail, setBranchEmail] = useState(branch?.branchEmail || '');
  const [loading, setLoading] = useState(false);
  
  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  useEffect(() => {
    if (branch) {
      setBranchName(branch.branchName);
      setBranchAddress(branch.branchAddress);
      setBranchPhone(branch.branchPhone || '');
      setBranchEmail(branch.branchEmail || '');
    }
  }, [branch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!branch?.branchId) {
      console.error('Branch ID is undefined');
      return;
    }

    if (!branchName || !branchAddress) {
      alert('Please fill all required fields.');
      return;
    }

    // Validate phone number if provided
    if (branchPhone && !/^\d{10}$/.test(branchPhone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    // Validate email if provided
    if (branchEmail && !/\S+@\S+\.\S+/.test(branchEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await axios.put(`${API_BASE_URL}/branch/${branch.branchId}`, {
        branchName,
        branchAddress,
        branchPhone,
        branchEmail,
      });
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating branch', error);
      alert('Failed to update branch. Please try again.');
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
              <h5 className="modal-title">Update Branch - {branchName}</h5>
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
                <Form.Group controlId="formBranchName">
                  <Form.Label>Branch Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formBranchAddress">
                  <Form.Label>Branch Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formBranchPhone">
                  <Form.Label>Branch Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
                <br />
                <Form.Group controlId="formBranchEmail">
                  <Form.Label>Branch Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={branchEmail}
                    onChange={(e) => setBranchEmail(e.target.value)}
                    placeholder="Enter email address"
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

export default UpdateBranchModal;
