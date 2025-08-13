import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const UpdateGalleryModal = ({ show, handleClose, gallery, onUpdate }) => {
  const [pictureId, setPictureId] = useState(gallery?.pictureId || '');
  const [pictureType, setPictureType] = useState(gallery?.pictureType || '');
  const [picturePath, setPicturePath] = useState(null);
  const [imagePreview, setImagePreview] = useState(gallery?.picturePath ? `/images/${gallery.picturePath}` : '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (gallery) {
      setPictureId(gallery.pictureId);
      setPictureType(gallery.pictureType);
      setImagePreview(gallery.picturePath ? `/images/${gallery.picturePath}` : '');
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

    try {
      const formData = new FormData();
      formData.append('pictureId', pictureId);
      formData.append('pictureType', pictureType);

      if (picturePath instanceof File) {
        formData.append('picturePath', picturePath);
      }

      await axios.put(`/gallery/${gallery.pictureId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUpdate();
      handleClose();
    } catch (error) {
      console.error('Error updating gallery', error);
      alert('Failed to update gallery. Please try again.');
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
                    <option value="restaurant">Restaurant</option>
                    <option value="foods">Foods</option>
                    <option value="beverages">Beverages</option>
                    <option value="deserts">Deserts</option>
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
