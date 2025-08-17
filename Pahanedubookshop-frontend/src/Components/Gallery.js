import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Footer from "../Components/footer";
import Navigation from "../Components/Navigations/navigation";
import '../CSS/Form.css';

const Gallery = () => {
  const location = useLocation();
  const { type } = useParams();
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log('Fetching gallery images...');
        const response = await fetch(`http://localhost:12345/gallery?pictureType=${type || ''}`);
        const data = await response.json();
        console.log('Gallery response:', response);
        console.log('Gallery data:', data);
        
        if (data.length === 0) {
          setMessage('No images available for this category.');
        } else {
          setMessage('');
        }
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
        setMessage('Error fetching images.');
      }
    };

    fetchImages();
  }, [type]);

  return (
    <>
      <Navigation />

      <div className="menu-container">
        <div className="menu-header">
          <h1 className="menu-heading">
            <span className="menu-heading-tasty">Gallery</span> <span className="menu-heading-dishes">Space</span>
          </h1>
        </div>
      </div>

      <div className="gallery-container">
        <div className="gallery-sidebar">
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery' ? 'active' : ''}`} to="/gallery">All</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/restaurant' ? 'active' : ''}`} to="/gallery/restaurant">Childresn's Book</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/foods' ? 'active' : ''}`} to="/gallery/foods">Novels</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/beverages' ? 'active' : ''}`} to="/gallery/beverages">Fiction</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/deserts' ? 'active' : ''}`} to="/gallery/deserts">Educaional Books</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/other' ? 'active' : ''}`} to="/gallery/other">Other</Link>
            </li>
          </ul>
        </div>

        <div className="gallery-content">
          {message ? (
            <p className="no-images-message">{message}</p>
          ) : (
            <div className="gallery-images">
              {images.map(image => {
                const imageUrl = `http://localhost:12345/images/${image.pictureImage || image.picturePath}`;
                console.log('Image data:', image);
                console.log('Generated image URL:', imageUrl);
                
                return (
                  <div key={image.pictureId} className="gallery-item">
                    <img 
                      src={imageUrl} 
                      alt={image.pictureId} 
                      onError={(e) => {
                        console.error('Image failed to load:', imageUrl);
                        e.target.style.border = '2px solid red';
                        e.target.alt = 'IMAGE FAILED TO LOAD';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', imageUrl);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer/>
    </>
  );
};

export default Gallery;
