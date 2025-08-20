import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../CSS/Card.css';
import Navigation2 from '../Navigations/navigation2';
import SecFooter from '../footer2';

const ProductView = () => {
    const { categoryName } = useParams();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState({});
    const [favorites, setFavorites] = useState(new Set());
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.userId : null;

    // Backend base URL
    const BACKEND_URL = 'http://localhost:12345';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/product/byCategory?categoryName=${encodeURIComponent(categoryName)}`);
                setProducts(response.data);

                const fetchFavoriteProducts = async () => {
                    try {
                        console.log('Fetching favorites for userId:', userId);
                        const response = await axios.get(`${BACKEND_URL}/api/favorites/list?userId=${userId}`);
                        console.log('Favorites response:', response.data);
                        setFavorites(new Set(response.data));
                    } catch (error) {
                        console.error('Error fetching favorite products:', error);
                        if (error.response) {
                            console.error('Error response:', error.response.data);
                            console.error('Error status:', error.response.status);
                        } else if (error.request) {
                            console.error('No response received:', error.request);
                        } else {
                            console.error('Request setup error:', error.message);
                        }
                        // Don't show error toast for favorites fetch, just log it
                    }
                };

                if (userId) {
                    fetchFavoriteProducts();
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, [categoryName, userId]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm)
    );

    const handleQuantityChange = (productId, delta) => {
        setCart(prevCart => {
            const newQuantity = Math.max((prevCart[productId]?.quantity || 0) + delta, 0);
            const updatedCart = {
                ...prevCart,
                [productId]: {
                    ...(prevCart[productId] || {}),
                    quantity: newQuantity
                }
            };
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    const handleAddToCart = async (product) => {
        const currentQuantity = cart[product.productId]?.quantity || 0;

        if (currentQuantity > 0) {
            try {
                await axios.post(`${BACKEND_URL}/api/cart/add`, null, {
                    params: {
                        userId,
                        productId: product.productId,
                        quantity: currentQuantity
                    }
                });
                toast.success('Product added to cart successfully!');
            } catch (error) {
                console.error('Error adding product to cart:', error);
                toast.error('Error adding product to cart.');
            }
        } else {
            toast.warn('Please select a quantity first using the + button');
        }
    };

    const toggleFavorite = async (productId) => {
        if (!userId) {
            toast.error('Please login first to add favorites!');
            navigate('/login');
            return;
        }

        const isFavorite = favorites.has(productId);
        const newFavorites = new Set(favorites);

        try {
            if (isFavorite) {
                // Remove from favorites
                await axios.post(`${BACKEND_URL}/api/favorites/remove`, null, { 
                    params: { userId, productId } 
                });
                newFavorites.delete(productId);
                toast.success('Product removed from favorites!');
            } else {
                // Add to favorites
                await axios.post(`${BACKEND_URL}/api/favorites/add`, null, { 
                    params: { userId, productId } 
                });
                newFavorites.add(productId);
                toast.success('Product added to favorites!');
            }

            setFavorites(newFavorites);
            console.log('Favorites updated:', Array.from(newFavorites));
            
        } catch (error) {
            console.error('Error toggling favorite:', error);
            
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                toast.error(`Error: ${error.response.data.error || 'Failed to update favorites'}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                toast.error('No response from server. Please check if backend is running.');
            } else {
                console.error('Request setup error:', error.message);
                toast.error(`Error: ${error.message}`);
            }
        }
    };

    return (
        <>
            <Navigation2 />
            <div className="search-container-one">
                <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <h1 className="form-head-one">
                <div className="back-arrow-two">
                    <span className="back-arrow-one" onClick={() => navigate('/customer-dashboard')}>
                        <i className="bi bi-caret-left-fill"></i>
                    </span>
                </div>
                <span>{categoryName}</span>
            </h1>

            {products.length === 0 ? (
                <div className="no-products-message">
                    <p>Currently, there are no products available in the {categoryName} category.</p>
                </div>
            ) : (
                <div className="custom-row">
                    {filteredProducts.map((product) => (
                        <div className="custom-col" key={product.productId}>
                            <div className="custom-card">
                                <img
                                    src={`${BACKEND_URL}/images/${product.productImage}`}
                                    className="custom-card-img-top"
                                    alt={product.productName}
                                />
                                <div className="custom-card-body">
                                    <h5 className="custom-card-title">{product.productName}</h5>
                                    <p className="custom-card-text">Rs. {product.productPrice.toFixed(2)}</p>

                                    <div className="custom-favorite-icon" onClick={() => toggleFavorite(product.productId)}>
                                        <i className={`bi ${favorites.has(product.productId) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                    </div>

                                    <div className="custom-quantity-controls">
                                        <button
                                            className="custom-btn custom-btn-outline-secondary"
                                            onClick={() => handleQuantityChange(product.productId, -1)}
                                        >
                                            <i className="bi bi-dash"></i>
                                        </button>
                                        <span className="custom-mx-2">{cart[product.productId]?.quantity || 0}</span>
                                        <button
                                            className="custom-btn custom-btn-outline-secondary"
                                            onClick={() => handleQuantityChange(product.productId, 1)}
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    </div>
                                    <button
                                        className="custom-btn custom-btn-primary custom-mt-2"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <SecFooter />
        </>
    );
};

export default ProductView;
