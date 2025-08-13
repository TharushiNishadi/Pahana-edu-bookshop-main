import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Profile.css';
import FrtNavigation from '../Navigations/navigation4';
import SideNavigation from '../Navigations/navigation5';
import UserUpdateModal from '../auth/UserEditModal';
import SecFooter from '../footer2';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('/user')
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to fetch users');
        setLoading(false);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm) ||
    user.userEmail.toLowerCase().includes(searchTerm) ||
    user.userId.toLowerCase().includes(searchTerm)
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleUpdateUser = () => {
    axios
      .get('/user')
      .then((response) => {
        setUsers(response.data);
        setShowModal(false);
      })
      .catch((error) => {
        setError('Failed to fetch updated users');
      });
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    axios
      .delete(`/user/${userToDelete}`)
      .then(() => {
        setUsers(prevUsers => prevUsers.filter(user => user.userId !== userToDelete));
        setShowDeleteModal(false);
      })
      .catch((error) => {
        setError('Failed to delete user');
      });
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
  };

  const handleAddUser = () => {
    navigate('/add-user');
  };

  return (
    <div>
      <FrtNavigation />
      <div className="gallery-container">
        <SideNavigation />
        <div className="admin-dashboard-content">
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
                  placeholder="Search Users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className='button-container'>
                <button className="btn-gold-add" onClick={handleAddUser}>
                  Add User
                </button>
              </div>
            </div>

            <div className='user-table-container'>
              <div className="gallery-content">

                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>User Type</th>
                        <th>Profile Picture</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.userId}>
                          <td>{user.userId}</td>
                          <td>{user.username} <br /> {user.branch}</td>
                          <td>{user.userEmail}</td>
                          <td>{user.phoneNumber}</td>
                          <td>{user.userType}</td>
                          <td>
                            <img
                              src={`/images/${user.profilePicture}`}
                              alt="Profile"
                              className="profile-pic-user"
                            />
                          </td>
                          <td>
                            {user.userType !== 'Customer' && (
                              <>
                                <button
                                  className="btn-confirm"
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit User
                                </button>
                                <button
                                  className="btn-deny"
                                  onClick={() => handleDeleteUser(user.userId)}
                                >
                                  Delete User
                                </button>
                              </>
                            )}
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
      <SecFooter />

      {selectedUser && (
        <UserUpdateModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          user={selectedUser}
          onUpdate={handleUpdateUser}
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
                    onClick={cancelDeleteUser}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelDeleteUser}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteUser}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
