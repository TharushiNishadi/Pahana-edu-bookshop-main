import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Profile.css';
import SecFooter from '../footer2';
import FrtNavigation from "../Navigations/navigation4";
import SideNavigation from "../Navigations/navigation5";
import UpdateBranchModal from './UpdateBranchModal';

const ViewBranch = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const navigate = useNavigate();

  // Get the API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = () => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/branch`)
      .then(response => {
        setBranches(response.data);
        setLoading(false);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching branches:', err);
        setError('Failed to fetch branches');
        setLoading(false);
      });
  };

  const handleAddBranch = () => {
    navigate('/add-branch');
  };

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setShowModal(true);
  };

  const handleDeleteBranch = (branchId) => {
    setBranchToDelete(branchId);
    setShowDeleteModal(true);
  };

  const confirmDeleteBranch = () => {
    if (!branchToDelete) return;

    const branchToDeleteData = branches.find(b => b.branchId === branchToDelete);
    const branchName = branchToDeleteData ? branchToDeleteData.branchName : 'Unknown';

    axios.delete(`${API_BASE_URL}/branch/${branchToDelete}`)
      .then(() => {
        setBranches(prevBranches => prevBranches.filter(branch => branch.branchId !== branchToDelete));
        setShowDeleteModal(false);
        setBranchToDelete(null);
        
        // Show success notification
        Swal.fire({
          title: 'Success! 🗑️',
          text: `Branch "${branchName}" deleted successfully!`,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      })
      .catch((err) => {
        console.error('Error deleting branch:', err);
        const errorMsg = err.response?.data?.error || 'Failed to delete branch';
        setError(errorMsg);
        
        // Show error notification
        Swal.fire({
          title: 'Error! ❌',
          text: errorMsg,
          icon: 'error',
          timer: 4000,
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      });
  };

  const cancelDeleteBranch = () => {
    setShowDeleteModal(false);
    setBranchToDelete(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredBranches = branches.filter(branch =>
    branch.branchId.toLowerCase().includes(searchTerm) ||
    branch.branchName.toLowerCase().includes(searchTerm) ||
    branch.branchAddress.toLowerCase().includes(searchTerm)
  );

  const handleUpdateBranch = () => {
    axios
      .get(`${API_BASE_URL}/branch`)
      .then((response) => {
        setBranches(response.data);
        setShowModal(false);
        
        // Show success notification
        Swal.fire({
          title: 'Success! ✏️',
          text: 'Branch updated successfully!',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      })
      .catch((error) => {
        console.error('Error fetching updated branches:', error);
        const errorMsg = error.response?.data?.error || 'Failed to fetch updated branches';
        setError(errorMsg);
        
        // Show error notification
        Swal.fire({
          title: 'Error! ❌',
          text: errorMsg,
          icon: 'error',
          timer: 4000,
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
      });
  };

  // Check if user is coming from add branch page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const addedBranch = urlParams.get('added');
    
    if (addedBranch === 'true') {
      // Show success message for newly added branch
      Swal.fire({
        title: 'Success! 🎉',
        text: 'New branch added successfully!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      // Refresh the branches list
      fetchBranches();
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
                    placeholder="Search branches by ID, name, or address..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button 
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => setSearchTerm('')}
                      title="Clear search"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                <div className="button-container">
                  <button className="btn-gold-add" onClick={handleAddBranch}>
                    <i className="bi bi-plus-circle"></i> Add Branch
                  </button>
                </div>
              </div>
              
              {searchTerm && (
                <div className="search-status mb-3">
                  <small className="text-muted">
                    Showing {filteredBranches.length} of {branches.length} branches
                    {searchTerm && ` matching "${searchTerm}"`}
                  </small>
                </div>
              )}

              <div className='user-table-container'>
                <div className="gallery-content">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Branch ID</th>
                        <th>Branch Name</th>
                        <th>Branch Address</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBranches.map(branch => (
                        <tr key={branch.branchId}>
                          <td>{branch.branchId}</td>
                          <td><strong>{branch.branchName}</strong></td>
                          <td>{branch.branchAddress}</td>
                          <td>{branch.branchPhone || '-'}</td>
                          <td>{branch.branchEmail || '-'}</td>
                          <td>
                            <button
                              className="btn-confirm"
                              onClick={() => handleEditBranch(branch)}
                              title="Edit Branch"
                            >
                              <i className="bi bi-pencil-square"></i> Edit
                            </button>
                            <button
                              className="btn-deny"
                              onClick={() => handleDeleteBranch(branch.branchId)}
                              title="Delete Branch"
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredBranches.length === 0 && !loading && (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        {searchTerm ? 'No branches found matching your search.' : 'No branches available.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedBranch && (
        <UpdateBranchModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          branch={selectedBranch}
          onUpdate={handleUpdateBranch}
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
                    onClick={cancelDeleteBranch}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this branch? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelDeleteBranch}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteBranch}>Delete</button>
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

export default ViewBranch;
