import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../Services/apiService';
import Swal from 'sweetalert2';
import FrtNavigation from '../Navigations/navigation4';
import SecFooter from '../footer2';
import '../../CSS/UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        // Filter users based on search term
        const filtered = users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userType.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            console.log('Fetching users...');
            const response = await usersAPI.getAll();
            console.log('Users response:', response);
            console.log('Users data:', response.data);
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error details:', error.response?.data);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load users',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete user "${username}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await usersAPI.deleteUser(userId);
                Swal.fire({
                    title: 'Deleted!',
                    text: `User "${username}" has been deleted.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchUsers(); // Refresh the list
            } catch (error) {
                console.error('Error deleting user:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete user',
                    icon: 'error',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        }
    };

    const handleEditUser = (userId) => {
        navigate(`/edit-user/${userId}`);
    };

    const handleAddUser = () => {
        navigate('/add-user');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    if (loading) {
        return (
            <>
                <FrtNavigation />
                <div className="user-management-page">
                    <div className="loading-container">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading users...</p>
                    </div>
                </div>
                <SecFooter />
            </>
        );
    }

    return (
        <>
            <FrtNavigation />
            <div className="user-management-page">
                <div className="user-management-container">
                    <div className="page-header">
                        <h1>User Management</h1>
                        <p>Manage all users in the system</p>
                    </div>

                    <div className="actions-section">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search Users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <i className="bi bi-search search-icon"></i>
                        </div>
                        <button className="add-user-btn" onClick={handleAddUser}>
                            <i className="bi bi-plus-circle"></i>
                            Add User
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                    <th>User Type</th>
                                    <th>Profile Picture</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">
                                            {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.userId} className="user-row">
                                            <td className="user-id">{user.userId}</td>
                                            <td className="username">{user.username}</td>
                                            <td className="email">{user.userEmail}</td>
                                            <td className="phone">{user.phoneNumber || 'N/A'}</td>
                                            <td className="user-type">
                                                <span className={`user-type-badge ${user.userType.toLowerCase()}`}>
                                                    {user.userType}
                                                </span>
                                            </td>
                                            <td className="profile-pic">
                                                <img
                                                    src={`/images/${user.profilePicture || 'default.jpg'}`}
                                                    alt="Profile"
                                                    className="user-avatar"
                                                    onError={(e) => {
                                                        e.target.src = '/images/default.jpg/';
                                                    }}
                                                />
                                            </td>
                                            <td className="created-at">{formatDate(user.createdAt)}</td>
                                            <td className="actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditUser(user.userId)}
                                                    title="Edit User"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                    Edit User
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteUser(user.userId, user.username)}
                                                    title="Delete User"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                    Delete User
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer">
                        <div className="user-count">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>
                </div>
            </div>
            <SecFooter />
        </>
    );
};

export default UserManagement;
