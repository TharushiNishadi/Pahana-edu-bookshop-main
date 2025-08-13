import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const UserUpdateModal = ({ show, handleClose, user, onUpdate }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [userEmail, setUserEmail] = useState(user?.userEmail || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [userType, setUserType] = useState(user?.userType || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [branches, setBranches] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    if (userType === 'Staff') {
      const fetchBranches = async () => {
        try {
          const response = await axios.get('/branch');
          console.log('Branches fetched:', response.data);
          setBranches(response.data);
        } catch (error) {
          console.error('Error fetching branches:', error);
        }
      };

      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [userType]);

  useEffect(() => {
    setUsername(user?.username || '');
    setUserEmail(user?.userEmail || '');
    setPhoneNumber(user?.phoneNumber || '');
    setUserType(user?.userType || '');
    setBranch(user?.branch || '');
    setProfilePicture(null);
  }, [user]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.userId) {
      console.error('User ID is undefined');
      return;
    }

    if (!username || !userEmail || !phoneNumber) {
      alert('Please fill all required fields.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(userEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('userEmail', userEmail);
    formData.append('phoneNumber', phoneNumber);
    formData.append('userType', userType);
    formData.append('branch', userType === 'Staff' ? branch : '');
    
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    console.log('Form Data to be submitted:', formData);

    try {
      await axios.put(`/user/profile/${user.userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating user', error);
      alert('Failed to update user. Please try again.');
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
              <h5 className="modal-title">Update User - {username}</h5>
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
                <Form.Group controlId="formUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <br></br>
                <Form.Group controlId="formUserEmail">
                  <Form.Label>User Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                  <br></br>
                </Form.Group>
                <Form.Group controlId="formPhoneNumber">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </Form.Group>
                <br></br>

                {userType === 'Staff' && (
                  <Form.Group controlId="formBranch" className="mb-3 form-select-wrapper">
                    <Form.Label>Branch</Form.Label>
                    <Form.Control
                      as="select"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    >
                      <option value="" disabled>Select a branch</option>
                      {branches.map((branchOption) => (
                        <option key={branchOption.branchName} value={branchOption.branchName}>
                          {branchOption.branchName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                )}

                <div className="modal-footer">
                  <Button variant="secondary" onClick={handleClose}className="btn btn-secondary">Close</Button>
                  <Button variant="primary" type="submit" className="btn btn-danger">Update</Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserUpdateModal;
