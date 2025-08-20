import React, { useState } from 'react';
import ImageView from './ImageView';
import '../CSS/SimpleImageView.css';

const SimpleImageView = () => {
  const [imageData, setImageData] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  // Example JSON data that you can copy and paste
  const exampleJson = `[
  {
    "pictureId": 1,
    "pictureName": "Sample Book Cover",
    "pictureType": "Fiction",
    "pictureImage": "All the Light We Cannot See.jpg",
    "description": "A beautiful book cover",
    "category": "Books"
  },
  {
    "pictureId": 2,
    "pictureName": "Educational Material",
    "pictureType": "Educational",
    "pictureImage": "ACT Exam Prep.jpg",
    "description": "Study guide for students",
    "category": "Education"
  }
]`;

  const handleJsonInput = (event) => {
    setJsonInput(event.target.value);
    setError('');
  };

  const loadImagesFromJson = () => {
    try {
      const parsedData = JSON.parse(jsonInput);
      
      if (Array.isArray(parsedData)) {
        setImageData(parsedData);
        setError('');
      } else {
        setError('JSON must be an array of image objects');
      }
    } catch (parseError) {
      setError('Invalid JSON format: ' + parseError.message);
    }
  };

  const loadExampleData = () => {
    setJsonInput(exampleJson);
    setImageData(JSON.parse(exampleJson));
    setError('');
  };

  const clearData = () => {
    setImageData([]);
    setJsonInput('');
    setError('');
  };

  const handleImageClick = (image, index) => {
    console.log('Clicked image:', image);
    console.log('Image index:', index);
    
    // You can add custom logic here
    alert(`Clicked: ${image.pictureName || image.pictureId}`);
  };

  return (
    <div className="simple-image-view">
      <div className="header">
        <h1>Simple Image View Example</h1>
        <p>Pass image data via JSON from JavaScript to display images</p>
      </div>

      <div className="controls-section">
        <div className="json-input-section">
          <h3>Input JSON Data:</h3>
          <textarea
            value={jsonInput}
            onChange={handleJsonInput}
            placeholder="Paste your JSON image data here..."
            rows="8"
            className="json-textarea"
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="button-group">
            <button onClick={loadImagesFromJson} className="btn-primary">
              Load Images
            </button>
            <button onClick={loadExampleData} className="btn-secondary">
              Load Example
            </button>
            <button onClick={clearData} className="btn-clear">
              Clear
            </button>
          </div>
        </div>

        <div className="info-section">
          <h3>JSON Format:</h3>
          <div className="format-info">
            <p>Your JSON should be an array of objects with these fields:</p>
            <ul>
              <li><strong>pictureId</strong> - Unique identifier</li>
              <li><strong>pictureName</strong> - Display name</li>
              <li><strong>pictureType</strong> - Category/type</li>
              <li><strong>pictureImage</strong> - Image filename</li>
              <li><strong>description</strong> - Image description (optional)</li>
              <li><strong>category</strong> - Image category (optional)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="image-display-section">
        <h3>Image Display:</h3>
        {imageData.length > 0 ? (
          <ImageView
            images={imageData}
            title={`Loaded ${imageData.length} Images`}
            showTitle={true}
            layout="grid"
            maxImages={20}
            showImageInfo={true}
            enableZoom={true}
            onImageClick={handleImageClick}
          />
        ) : (
          <div className="no-data-message">
            <div className="no-data-icon">📷</div>
            <p>No images loaded yet. Use the JSON input above to load images.</p>
          </div>
        )}
      </div>

      <div className="usage-examples">
        <h3>Usage Examples:</h3>
        
        <div className="example-card">
          <h4>1. Basic Image Array:</h4>
          <pre>
{`const images = [
  {
    "pictureId": 1,
    "pictureName": "Book Cover",
    "pictureType": "Fiction",
    "pictureImage": "book1.jpg"
  }
];`}
          </pre>
        </div>

        <div className="example-card">
          <h4>2. With Additional Fields:</h4>
          <pre>
{`const images = [
  {
    "pictureId": 1,
    "pictureName": "Book Cover",
    "pictureType": "Fiction",
    "pictureImage": "book1.jpg",
    "description": "A beautiful book cover",
    "category": "Books",
    "uploadDate": "2024-01-15"
  }
];`}
          </pre>
        </div>

        <div className="example-card">
          <h4>3. Using in React Component:</h4>
          <pre>
{`import ImageView from './ImageView';

function MyComponent() {
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    // Fetch images from API or load from JSON
    fetch('/api/images')
      .then(res => res.json())
      .then(data => setImages(data));
  }, []);
  
  return (
    <ImageView 
      images={images}
      title="My Gallery"
      layout="grid"
      enableZoom={true}
    />
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SimpleImageView;
