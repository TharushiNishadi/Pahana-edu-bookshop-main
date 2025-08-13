import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../../CSS/Cart.css';
import SecFooter from '../footer2';
import Navigation2 from '../Navigations/navigation2';

const Cart = () => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [userId, setUserId] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productToRemove, setProductToRemove] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error('Invalid token', error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const fetchCartItems = async () => {
    if (userId) {
      try {
        const response = await fetch(`/api/cart/detailsInfo?userId=${userId}`);
        const data = await response.json();
        setTotalAmount(data.totalAmount || 0);
        setCartItems(data.products || []);
      } catch (error) {
        console.error('Failed to fetch cart details', error);
        setTotalAmount(0);
        setCartItems([]);
      }
    }
  };

  const handleRemoveClick = (productId, quantity) => {
    setProductToRemove({ productId, quantity });
    setShowModal(true);
  };

  const handleConfirmRemove = async () => {
    if (productToRemove) {
      await handleClearFromCart(productToRemove.productId, productToRemove.quantity);
      setShowModal(false);
    }
  };

  const handleClearFromCart = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User not authenticated');
      return;
    }

    try {
      const userId = jwtDecode(token).userId;

      const response = await fetch(`/api/cart/remove?userId=${userId}&productId=${productId}&quantity=${quantity}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Product removed from cart');
        
        setCartItems((prevItems) => prevItems.filter(item => item.productId !== productId));

        setTotalAmount((prevTotal) => {
          const removedItem = cartItems.find(item => item.productId === productId);
          if (removedItem) {
            return (prevTotal || 0) - ((removedItem.productPrice || 0) * (removedItem.quantity || 0));
          }
          return prevTotal || 0;
        });

        fetchCartItems();
      } else {
        console.error('Failed to remove product from cart');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleContinueShopping = () => {
    navigate('/customer-dashboard');
  };

  const handleGoToCheckout = () => {
    navigate('/checkout');
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <Navigation2 />
      <div className="cart-header">
        <span><i className="bi bi-cart3 fs-3"></i></span>
        <h5 className="total-amount" style={{ fontSize: '1.25rem' }}>
          Total Amount&nbsp;<span style={{ margin: '0 0.5rem' }}>-</span>&nbsp;Rs. {(totalAmount || 0).toFixed(2)}
        </h5>
        <div>
          <button type="button" className="btn-btn-warning" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
          <button type="button" className="btn-btn-danger-me-2" onClick={handleGoToCheckout}>
            Go to Checkout
          </button>
        </div>
      </div>

      <div className="cart-items-container mt-4">
        {cartItems.length > 0 ? (
          <div className="row g-2">
            {cartItems.map((item) => (
              <div className="col-md-6" key={item.productId} onClick={() => handleProductClick(item.productId)}>
                <div className="card-custom-card">
                  <img src={`/images/${item.productImage}`} className="card-img" alt={item.productName} />
                  <div className="card-body">
                    <div className="card-product-info">
                      <h5 className="card-product-name">{item.productName}</h5>
                      <p className="card-product-description">{item.productDescription}</p>
                      <p className="card-product-quantity">
                        {item.quantity} {item.productName}
                      </p>
                    </div>
                    <div className="card-product-actions">
                      <p className="card-product-subtotal">
                        Rs. {((item.productPrice || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                      <button
                        className="card-clear-btn"
                        onClick={() => handleRemoveClick(item.productId, item.quantity)}
                      >
                        <span>
                          <i className="bi bi-trash-fill"></i>
                        </span>
                        Clear from Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-products-message">
            <p>No product added to cart yet!</p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop-blur"></div>

          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Remove Confirmation</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to remove this product from the cart?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmRemove}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <SecFooter/>
    </>
  );
};

export default Cart;