import React, { useState, useEffect } from 'react';
import ImageView from './ImageView';
import '../CSS/ImageViewDemo.css';

const ImageViewDemo = () => {
  const [demoImages, setDemoImages] = useState([]);
  const [layout, setLayout] = useState('grid');
  const [maxImages, setMaxImages] = useState(12);
  const [showImageInfo, setShowImageInfo] = useState(true);
  const [enableZoom, setEnableZoom] = useState(true);
  const [loading, setLoading] = useState(true);

  // Sample JSON data for demonstration
  const sampleImageData = [
    {
      pictureId: 1,
      pictureName: "Children's Book Cover",
      pictureType: "Children's Book",
      pictureImage: "Cat Kid Comic Club.jpg",
      description: "A colorful children's book cover",
      category: "Children",
      uploadDate: "2024-01-15"
    },
    {
      pictureId: 2,
      pictureName: "Fiction Novel",
      pictureType: "Fiction",
      pictureImage: "All the Light We Cannot See.jpg",
      description: "A bestselling fiction novel",
      category: "Fiction",
      uploadDate: "2024-01-16"
    },
    {
      pictureId: 3,
      pictureName: "Educational Book",
      pictureType: "Educational",
      pictureImage: "ACT Exam Prep.jpg",
      description: "Study guide for ACT exam",
      category: "Educational",
      uploadDate: "2024-01-17"
    },
    {
      pictureId: 4,
      pictureName: "Cultural Book",
      pictureType: "Cultural",
      pictureImage: "Cultural Explotion.jpg",
      description: "Exploring cultural diversity",
      category: "Cultural",
      uploadDate: "2024-01-18"
    }
  ];

  useEffect(() => {
    // Simulate loading from API
    const loadImages = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to fetch from your backend first
      try {
        const response = await fetch('http://localhost:12345/gallery');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setDemoImages(data);
          } else {
            // Fallback to sample data
            setDemoImages(sampleImageData);
          }
        } else {
          // Fallback to sample data
          setDemoImages(sampleImageData);
        }
      } catch (error) {
        console.log('Using sample data:', error);
        // Fallback to sample data
        setDemoImages(sampleImageData);
      }
      
      setLoading(false);
    };

    loadImages();
  }, []);

  const handleImageClick = (image, index) => {
    console.log('Image clicked:', image, 'Index:', index);
    // You can add custom logic here
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const handleMaxImagesChange = (event) => {
    setMaxImages(parseInt(event.target.value));
  };

  if (loading) {
    return (
      <div className="demo-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-container">
      <div className="demo-header">
        <h1>ImageView Component Demo</h1>
        <p>This demonstrates how to display images passed via JSON from JavaScript</p>
      </div>

      <div className="demo-controls">
        <div className="control-group">
          <label>Layout:</label>
          <div className="button-group">
            <button 
              className={layout === 'grid' ? 'active' : ''} 
              onClick={() => handleLayoutChange('grid')}
            >
              Grid
            </button>
            <button 
              className={layout === 'list' ? 'active' : ''} 
              onClick={() => handleLayoutChange('list')}
            >
              List
            </button>
            <button 
              className={layout === 'masonry' ? 'active' : ''} 
              onClick={() => handleLayoutChange('masonry')}
            >
              Masonry
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Max Images:</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={maxImages} 
            onChange={handleMaxImagesChange}
          />
          <span>{maxImages}</span>
        </div>

        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={showImageInfo} 
              onChange={(e) => setShowImageInfo(e.target.checked)}
            />
            Show Image Info
          </label>
        </div>

        <div className="control-group">
          <label>
            <input 
              type="checkbox" 
              checked={enableZoom} 
              onChange={(e) => setEnableZoom(e.target.checked)}
            />
            Enable Zoom
          </label>
        </div>
      </div>

      <div className="demo-content">
        <ImageView
          images={demoImages}
          title="Book Gallery"
          showTitle={true}
          layout={layout}
          maxImages={maxImages}
          showImageInfo={showImageInfo}
          enableZoom={enableZoom}
          onImageClick={handleImageClick}
        />
      </div>

      <div className="demo-info">
        <h3>How to Use:</h3>
        <div className="code-example">
          <h4>1. Basic Usage:</h4>
          <pre>
{`<ImageView 
  images={yourImageArray} 
  title="Your Gallery Title"
/>`}
          </pre>

          <h4>2. With Custom Configuration:</h4>
          <pre>
{`<ImageView 
  images={yourImageArray}
  layout="masonry"
  maxImages={8}
  showImageInfo={false}
  enableZoom={true}
  onImageClick={(image, index) => {
    console.log('Clicked:', image);
  }}
/>`}
          </pre>

          <h4>3. JSON Data Format:</h4>
          <pre>
{`const imageData = [
  {
    pictureId: 1,
    pictureName: "Image Name",
    pictureType: "Category",
    pictureImage: "filename.jpg",
    description: "Description",
    category: "Category",
    uploadDate: "2024-01-15"
  }
];`}
          </pre>
        </div>

        <div className="features-list">
          <h3>Features:</h3>
          <ul>
            <li>✅ Multiple layout options (Grid, List, Masonry)</li>
            <li>✅ Image zoom with modal view</li>
            <li>✅ Responsive design</li>
            <li>✅ Error handling for failed images</li>
            <li>✅ Customizable image limits</li>
            <li>✅ Hover effects and animations</li>
            <li>✅ Image information display</li>
            <li>✅ Click event handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageViewDemo;
