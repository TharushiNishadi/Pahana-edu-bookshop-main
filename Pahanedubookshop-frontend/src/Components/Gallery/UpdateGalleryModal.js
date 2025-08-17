import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const UpdateGalleryModal = ({ show, handleClose, gallery, onUpdate }) => {
  const [pictureId, setPictureId] = useState(gallery?.pictureId || '');
  const [pictureType, setPictureType] = useState(gallery?.pictureType || '');
  const [picturePath, setPicturePath] = useState(null);
  const [imagePreview, setImagePreview] = useState(gallery?.pictureImage ? `http://localhost:12345/images/${gallery.pictureImage}` : '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (gallery) {
      setPictureId(gallery.pictureId);
      setPictureType(gallery.pictureType);
      setImagePreview(gallery.pictureImage ? `http://localhost:12345/images/${gallery.pictureImage}` : '');
      setPicturePath(null);
    }
  }, [gallery]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPicturePath(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    if (!gallery?.pictureId) {
      console.error('Picture ID is undefined');
      return;
    }

    if (!pictureType) {
      alert('Please select a picture type.');
      return;
    }

    setLoading(true);

    // Show loading notification
    Swal.fire({
      title: 'Updating Gallery...',
      text: 'Please wait while we update your gallery item.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Also show a loading toast
    const loadingToast = toast.loading('Updating gallery item...', {
      position: "top-right",
    });

    try {
      const formData = new FormData();
      formData.append('pictureId', pictureId);
      formData.append('pictureType', pictureType);

      if (picturePath instanceof File) {
        formData.append('picturePath', picturePath);
      }

      // Debug logging
      console.log('Sending update request with:');
      console.log('- pictureId:', pictureId);
      console.log('- pictureType:', pictureType);
      console.log('- picturePath:', picturePath);
      console.log('- FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }

      await axios.put(`/gallery/${gallery.pictureId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success notification
      Swal.fire({
        title: 'Success!',
        text: `Gallery item "${pictureId}" updated successfully!`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        footer: `Updated: ${new Date().toLocaleString()}`
      });

      // Also show a toast notification
      toast.success(`Gallery item "${pictureId}" updated successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      // Wait a moment for the success message to be seen, then update and close
      setTimeout(() => {
        onUpdate();
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating gallery', error);
      
      // Show detailed error information using SweetAlert2
      let errorMessage = 'Failed to update gallery. ';
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
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });

      // Also show a toast notification for the error
      toast.error(`Gallery update failed: ${errorMessage}`, {
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
              <h5 className="modal-title">Update Gallery - {pictureId}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <Form onSubmit={handleSubmit} encType="multipart/form-data">
                <Form.Group controlId="formPictureType" className="mb-3 form-select-wrapper">
                  <Form.Label>Picture Type *</Form.Label>
                  <Form.Control
                    as="select"
                    value={pictureType}
                    onChange={(e) => setPictureType(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Picture type</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fictions">Non-Fiction</option>
                    <option value="Childrens Book">Childrens Book</option>
                    <option value="Educational Books">Educational Books</option>
                    <option value="other">Other</option>
                  </Form.Control>
                  {errors.pictureType && <div className="invalid-feedback">{errors.pictureType}</div>}
                </Form.Group>
                <br />
                <Form.Group controlId="formPicturePath" className="mb-3">
                  <Form.Label>Picture Path</Form.Label><br />
                  <div className="image-preview-container">
                    <input type="file" id="picturePath" name="picturePath" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    <label htmlFor="picturePath" className={`custom-file-upload ${errors.picturePath ? 'is-invalid' : ''}`}>
                      Change Image
                    </label>
                    {imagePreview && (
                      <div className="image-preview mt-3">
                        <img src={imagePreview} alt="Picture Preview" style={{ inlineSize: '200px' }} />
                      </div>
                    )}
                    {errors.picturePath && <div className="invalid-feedback">{errors.picturePath}</div>}
                  </div>
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

export default UpdateGalleryModal;
