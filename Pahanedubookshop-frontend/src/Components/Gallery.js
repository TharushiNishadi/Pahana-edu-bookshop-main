import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Footer from "../Components/footer";
import Navigation from "../Components/Navigations/navigation";
import ImageView from "./Gallery/ImageView";
import '../CSS/Form.css';


const Gallery = () => {
  const location = useLocation();
  const { type } = useParams();
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [type]);

  const handleImageClick = (image, index) => {
    console.log('Image clicked:', image, 'Index:', index);
    // You can add custom logic here, like opening a lightbox or navigating to detail page
  };

  if (loading) {
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
                <Link className={`nav-link ${location.pathname === '/gallery/restaurant' ? 'active' : ''}`} to="/gallery/restaurant">Children's Book</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/gallery/foods' ? 'active' : ''}`} to="/gallery/foods">Novels</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/gallery/beverages' ? 'active' : ''}`} to="/gallery/beverages">Fiction</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/gallery/deserts' ? 'active' : ''}`} to="/gallery/deserts">Educational Books</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/gallery/other' ? 'active' : ''}`} to="/gallery/other">Other</Link>
              </li>
            </ul>
          </div>
          <div className="gallery-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading gallery images...</p>
            </div>
          </div>
        </div>
        <Footer/>
      </>
    );
  }

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
              <Link className={`nav-link ${location.pathname === '/gallery/restaurant' ? 'active' : ''}`} to="/gallery/restaurant">Children's Book</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/foods' ? 'active' : ''}`} to="/gallery/foods">Novels</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/beverages' ? 'active' : ''}`} to="/gallery/beverages">Fiction</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/gallery/deserts' ? 'active' : ''}`} to="/gallery/deserts">Educational Books</Link>
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
            <ImageView
              images={images}
              title={type ? `${type} Gallery` : "All Images"}
              showTitle={false}
              layout="grid"
              maxImages={50}
              showImageInfo={true}
              enableZoom={true}
              onImageClick={handleImageClick}
            />
          )}
        </div>
      </div>

      <Footer/>
    </>
  );
};

export default Gallery;
