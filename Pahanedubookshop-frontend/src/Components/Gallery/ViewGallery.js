import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

    try {
      await axios.delete(`/gallery/${galleryToDelete.pictureId}`);
      setGalleries(galleries.filter(g => g.pictureId !== galleryToDelete.pictureId));
      setShowDeleteModal(false); // Close the delete modal after deletion
      setGalleryToDelete(null); // Clear the gallery to be deleted
    } catch (error) {
      setError('Failed to delete image. Please try again later.');
      setShowDeleteModal(false);
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
    gallery.picturePath.toLowerCase().includes(searchTerm)
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
                            <img src={`/images/${gallery.picturePath}`} alt={gallery.picturePath} className="product-pic-admin" />
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
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelDeleteImage}>Cancel</button>
                  <button className="btn btn-danger" onClick={confirmDeleteImage}>Delete</button>
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
