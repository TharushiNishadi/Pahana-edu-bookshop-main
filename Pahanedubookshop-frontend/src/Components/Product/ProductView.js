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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`/product/byCategory?categoryName=${encodeURIComponent(categoryName)}`);
                setProducts(response.data);

                const storedFavorites = await fetchFavoriteProducts();
                setFavorites(new Set(storedFavorites));
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        const fetchFavoriteProducts = async () => {
            try {
                const response = await axios.get(`/api/favorites/list?userId=${userId}`);
                return response.data || [];
            } catch (error) {
                console.error('Error fetching favorite products:', error);
                return [];
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
            const newCart = {
                ...cart,
                [product.productId]: {
                    ...product,
                    quantity: currentQuantity + 1
                }
            };
            setCart(newCart);
            localStorage.setItem('cart', JSON.stringify(newCart));

            try {
                await axios.post('/api/cart/add', null, {
                    params: {
                        userId,
                        productId: product.productId,
                        quantity: newCart[product.productId].quantity
                    }
                });
                toast.success('Cart Updated Successfully!');
            } catch (error) {
                console.error('Error adding product to cart:', error);
                toast.error('Error adding product to cart.');
            }
        } else {
            toast.warn('Quantity must be at least 1');
        }
    };

    const toggleFavorite = async (productId) => {
        if (!userId) {
            console.log('User not logged in');
            return;
        }

        const isFavorite = favorites.has(productId);
        const newFavorites = new Set(favorites);

        try {
            if (isFavorite) {
                await axios.post('/api/favorites/remove', null, { params: { userId, productId } });
                newFavorites.delete(productId);
            } else {
                await axios.post('/api/favorites/add', null, { params: { userId, productId } });
                newFavorites.add(productId);
            }

            setFavorites(newFavorites);
        } catch (error) {
            console.error('Error toggling favorite:', error);
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
                                    src={`/images/${product.productImage}`}
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
