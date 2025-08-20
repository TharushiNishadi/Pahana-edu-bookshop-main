# ImageView Components

This directory contains enhanced image viewing components that can display images passed via JSON from JavaScript.

## Components Overview

### 1. ImageView.js
The main image display component with advanced features:
- Multiple layout options (Grid, List, Masonry)
- Image zoom with modal view
- Responsive design
- Error handling for failed images
- Customizable image limits
- Hover effects and animations

### 2. ImageViewDemo.js
A comprehensive demo component showing all features:
- Interactive controls for layout, zoom, and display options
- Real-time configuration changes
- Code examples and usage instructions

### 3. SimpleImageView.js
A simple example component for basic usage:
- JSON input field for testing
- Example data loading
- Step-by-step usage examples

## How to Use

### Basic Usage

```jsx
import ImageView from './Gallery/ImageView';

function MyComponent() {
  const [images, setImages] = useState([]);
  
  return (
    <ImageView 
      images={images}
      title="My Gallery"
    />
  );
}
```

### Advanced Usage

```jsx
<ImageView 
  images={imageArray}
  title="Custom Gallery"
  layout="masonry"
  maxImages={20}
  showImageInfo={true}
  enableZoom={true}
  onImageClick={(image, index) => {
    console.log('Clicked:', image);
  }}
/>
```

## JSON Data Format

Your JSON should be an array of image objects with these fields:

```json
[
  {
    "pictureId": 1,
    "pictureName": "Image Name",
    "pictureType": "Category",
    "pictureImage": "filename.jpg",
    "description": "Optional description",
    "category": "Optional category",
    "uploadDate": "2024-01-15"
  }
]
```

### Required Fields:
- `pictureId` - Unique identifier
- `pictureImage` - Image filename (will be prefixed with backend URL)

### Optional Fields:
- `pictureName` - Display name
- `pictureType` - Category/type
- `description` - Image description
- `category` - Image category
- `uploadDate` - Upload date

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | Array/Object | `[]` | Array of image objects or single image object |
| `title` | String | `"Image Gallery"` | Gallery title |
| `showTitle` | Boolean | `true` | Whether to show the title |
| `layout` | String | `"grid"` | Layout type: "grid", "list", "masonry" |
| `maxImages` | Number | `12` | Maximum number of images to display |
| `showImageInfo` | Boolean | `true` | Whether to show image information |
| `enableZoom` | Boolean | `true` | Whether to enable image zoom |
| `onImageClick` | Function | `null` | Callback when image is clicked |

## Features

### Layout Options
- **Grid**: Responsive grid layout (default)
- **List**: Single column list layout
- **Masonry**: Pinterest-style masonry layout

### Image Zoom
- Click any image to open modal view
- Zoom in/out controls
- Image details display
- Keyboard navigation support

### Responsive Design
- Mobile-friendly layouts
- Adaptive grid columns
- Touch-friendly controls

### Error Handling
- Graceful fallback for failed images
- Loading states
- Error placeholders

## Examples

### 1. Fetch from API

```jsx
useEffect(() => {
  const fetchImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };
  
  fetchImages();
}, []);
```

### 2. Load from Local Data

```jsx
const localImages = [
  {
    pictureId: 1,
    pictureName: "Local Image",
    pictureType: "Local",
    pictureImage: "local-image.jpg"
  }
];

<ImageView images={localImages} />
```

### 3. Dynamic Updates

```jsx
const [images, setImages] = useState([]);

const addImage = (newImage) => {
  setImages(prev => [...prev, newImage]);
};

const removeImage = (imageId) => {
  setImages(prev => prev.filter(img => img.pictureId !== imageId));
};
```

## Styling

The components use CSS modules and can be customized by modifying the corresponding CSS files:
- `ImageView.css` - Main component styles
- `ImageViewDemo.css` - Demo component styles
- `SimpleImageView.css` - Simple example styles

## Backend Integration

The components expect images to be served from your backend at:
```
http://localhost:12345/images/{filename}
```

Make sure your backend serves images from the correct endpoint and the image filenames in your JSON match the actual files.

## Troubleshooting

### Images Not Loading
1. Check that image filenames in JSON match actual files
2. Verify backend image serving endpoint
3. Check browser console for errors
4. Ensure image files exist in backend images directory

### Performance Issues
1. Limit `maxImages` prop for large galleries
2. Use appropriate image formats (JPEG for photos, PNG for graphics)
3. Consider image compression for large files

### Layout Issues
1. Check CSS is properly imported
2. Verify responsive breakpoints
3. Test on different screen sizes

## Contributing

To add new features or fix issues:
1. Modify the relevant component file
2. Update corresponding CSS file
3. Test with different data formats
4. Update this README if needed
