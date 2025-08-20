import React, { useState, useEffect } from 'react';
import '../../CSS/ImageView.css';

const ImageView = ({ 
  images = [], 
  title = "Image Gallery", 
  showTitle = true,
  layout = "grid", // grid, list, masonry
  maxImages = 12,
  showImageInfo = true,
  enableZoom = true,
  onImageClick = null
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [displayImages, setDisplayImages] = useState([]);

  useEffect(() => {
    // Process images and limit to maxImages
    if (Array.isArray(images)) {
      setDisplayImages(images.slice(0, maxImages));
    } else if (images && typeof images === 'object') {
      // Handle single image object
      setDisplayImages([images]);
    } else {
      setDisplayImages([]);
    }
  }, [images, maxImages]);

  const handleImageClick = (image, index) => {
    if (onImageClick) {
      onImageClick(image, index);
    } else if (enableZoom) {
      setSelectedImage({ ...image, index });
      setZoomLevel(1);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const getImageUrl = (image) => {
    // Handle different image field names
    if (image.pictureImage) {
      return `http://localhost:12345/images/${image.pictureImage}`;
    } else if (image.picturePath) {
      return `http://localhost:12345/images/${image.picturePath}`;
    } else if (image.imageUrl) {
      return image.imageUrl;
    } else if (image.url) {
      return image.url;
    } else if (image.src) {
      return image.src;
    } else if (typeof image === 'string') {
      return image;
    }
    return '';
  };

  const getImageAlt = (image) => {
    return image.pictureName || 
           image.name || 
           image.alt || 
           image.title || 
           image.pictureId || 
           'Gallery Image';
  };

  const getImageInfo = (image) => {
    const info = {};
    
    if (image.pictureType) info.type = image.pictureType;
    if (image.pictureName) info.name = image.pictureName;
    if (image.pictureId) info.id = image.pictureId;
    if (image.description) info.description = image.description;
    if (image.category) info.category = image.category;
    if (image.uploadDate) info.uploadDate = image.uploadDate;
    
    return info;
  };

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="image-view-container">
        {showTitle && <h2 className="image-view-title">{title}</h2>}
        <div className="no-images-message">
          <div className="no-images-icon">📷</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`image-view-container layout-${layout}`}>
        {showTitle && <h2 className="image-view-title">{title}</h2>}
        
        <div className={`image-grid layout-${layout}`}>
          {displayImages.map((image, index) => {
            const imageUrl = getImageUrl(image);
            const imageAlt = getImageAlt(image);
            const imageInfo = getImageInfo(image);
            
            return (
              <div 
                key={image.pictureId || image.id || index} 
                className="image-item"
                onClick={() => handleImageClick(image, index)}
              >
                <div className="image-wrapper">
                  <img 
                    src={imageUrl} 
                    alt={imageAlt}
                    className="gallery-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      e.target.style.border = '2px solid #4CAF50';
                    }}
                  />
                  <div className="image-error-placeholder" style={{ display: 'none' }}>
                    <span>❌</span>
                    <p>Image failed to load</p>
                  </div>
                  
                  {enableZoom && (
                    <div className="image-overlay">
                      <span className="zoom-icon">🔍</span>
                    </div>
                  )}
                </div>
                
                {showImageInfo && Object.keys(imageInfo).length > 0 && (
                  <div className="image-info">
                    {imageInfo.name && <p className="image-name">{imageInfo.name}</p>}
                    {imageInfo.type && <p className="image-type">{imageInfo.type}</p>}
                    {imageInfo.description && <p className="image-description">{imageInfo.description}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {displayImages.length >= maxImages && (
          <div className="images-limit-message">
            Showing {maxImages} of {images.length} images
          </div>
        )}
      </div>

      {/* Image Modal for Zoom */}
      {selectedImage && enableZoom && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getImageAlt(selectedImage)}</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="image-container">
                <img 
                  src={getImageUrl(selectedImage)} 
                  alt={getImageAlt(selectedImage)}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="modal-image"
                />
              </div>
              
              <div className="zoom-controls">
                <button onClick={zoomOut} disabled={zoomLevel <= 0.5}>🔍-</button>
                <button onClick={resetZoom}>🔍</button>
                <button onClick={zoomIn} disabled={zoomLevel >= 3}>🔍+</button>
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="image-details">
                {Object.entries(getImageInfo(selectedImage)).map(([key, value]) => (
                  <span key={key} className="detail-item">
                    <strong>{key}:</strong> {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageView;
