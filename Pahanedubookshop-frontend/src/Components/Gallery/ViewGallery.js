import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import '../../CSS/Profile.css';
import SecFooter from '../footer2';
import FrtNavigation from '../Navigations/navigation4';
import SideNavigation from '../Navigations/navigation5';
import UpdateGalleryModal from './UpdateGalleryModal'; // Import the UpdateGalleryModal component

const ViewGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGallery, setSelectedGallery] = useState(null); // State to store selected gallery for editing
  const [showUpdateModal, setShowUpdateModal] = useState(false); // State to show/hide the update modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State to show/hide the delete confirmation modal
  const [galleryToDelete, setGalleryToDelete] = useState(null); // State to store the gallery to be deleted
  const [deleteLoading, setDeleteLoading] = useState(false); // State for delete loading
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await axios.get('/gallery');
        setGalleries(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch galleries. Please try again later.');
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddImage = () => {
    navigate('/add-image');
  };

  const handleEditImage = (gallery) => {
    setSelectedGallery(gallery); // Set the selected gallery item
    setShowUpdateModal(true); // Show the update modal
  };

  const handleDeleteImage = (gallery) => {
    setGalleryToDelete(gallery); // Set the gallery to be deleted
    setShowDeleteModal(true); // Show the delete confirmation modal
  };

  const confirmDeleteImage = async () => {
    if (!galleryToDelete) return;

    setDeleteLoading(true); // Start loading
    
    // Show loading notification
    Swal.fire({
      title: 'Deleting Gallery Item...',
      text: 'Please wait while we delete your gallery item.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Also show a loading toast
    const loadingToast = toast.loading('Deleting gallery item...', {
      position: "top-right",
    });

    try {
      await axios.delete(`/gallery/${galleryToDelete.pictureId}`);
      setGalleries(galleries.filter(g => g.pictureId !== galleryToDelete.pictureId));
      setShowDeleteModal(false); // Close the delete modal after deletion
      setGalleryToDelete(null); // Clear the gallery to be deleted
      
      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: `Gallery item "${galleryToDelete.pictureId}" deleted successfully!`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        footer: `Deleted: ${new Date().toLocaleString()}`
      });

      // Also show a toast notification
      toast.success(`Gallery item "${galleryToDelete.pictureId}" deleted successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Dismiss the loading toast
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      
      let errorMessage = 'Failed to delete image. ';
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
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server. Please check if backend is running.';
      } else {
        // Something else happened
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setShowDeleteModal(false);
      
      // Show error notification
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });

      // Also show a toast notification for the error
      toast.error(`Gallery delete failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Dismiss the loading toast
      toast.dismiss(loadingToast);
    } finally {
      setDeleteLoading(false); // End loading
    }
  };

  const cancelDeleteImage = () => {
    setShowDeleteModal(false);
    setGalleryToDelete(null);
  };

  const handleUpdate = async () => {
    setShowUpdateModal(false); // Close the update modal
    try {
      const response = await axios.get('/gallery'); // Refresh gallery list
      setGalleries(response.data);
    } catch (error) {
      setError('Failed to fetch updated galleries. Please try again later.');
    }
  };

  const filteredGalleries = galleries.filter(gallery =>
    gallery.pictureId.toLowerCase().includes(searchTerm) ||
    gallery.pictureType.toLowerCase().includes(searchTerm) ||
    (gallery.pictureImage && gallery.pictureImage.toLowerCase().includes(searchTerm))
  );

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
                    placeholder="Search Images..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="button-container">
                  <button className="btn-gold-add" onClick={handleAddImage}>
                    Add Image
                  </button>
                </div>
              </div>

              <div className="user-table-container">
                <div className="gallery-content">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Picture ID</th>
                        <th>Picture Type</th>
                        <th>Picture Path</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGalleries.map(gallery => (
                        <tr key={gallery.pictureId}>
                          <td>{gallery.pictureId}</td>
                          <td>{gallery.pictureType}</td>
                          <td> 
                            <img src={`http://localhost:12345/images/${gallery.pictureImage}`} alt={gallery.pictureName || gallery.picturePath} className="product-pic-admin" />
                          </td>
                          <td>
                            <button
                              className="btn-confirm"
                              onClick={() => handleEditImage(gallery)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-deny"
                              onClick={() => handleDeleteImage(gallery)}
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

      {showUpdateModal && (
        <UpdateGalleryModal
          show={showUpdateModal}
          handleClose={() => setShowUpdateModal(false)}
          gallery={selectedGallery}
          onUpdate={handleUpdate}
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
                    onClick={cancelDeleteImage}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this Image? This action cannot be undone.</p>
                  {galleryToDelete && (
                    <div className="delete-details mt-3">
                      <div className="alert alert-warning">
                        <strong>Item to be deleted:</strong><br />
                        <strong>ID:</strong> {galleryToDelete.pictureId}<br />
                        <strong>Type:</strong> {galleryToDelete.pictureType}<br />
                        <strong>Name:</strong> {galleryToDelete.pictureName || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelDeleteImage}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteImage} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
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

export default ViewGallery;
