import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../CSS/Cart.css';
import SecFooter from '../footer2';
import Navigation2 from '../Navigations/navigation2';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [userId, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [branches, setBranches] = useState([]);
    const [offers, setOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [checkoutDetails, setCheckoutDetails] = useState({
      branch: '',
      paymentMethod: '',
      deliveryAddress: '',
      offer: ''
    });
    const [taxAmount, setTaxAmount] = useState(0);
    const [deliveryCharges, setDeliveryCharges] = useState(0);
    const [finalTotal, setFinalTotal] = useState(0);
  
    const [errors, setErrors] = useState({
      branch: '',
      paymentMethod: '',
      deliveryAddress: '',
      offer: ''
    });
  
    const navigate = useNavigate();
  
    useEffect(() => {
      const token = localStorage.getItem('token');
  
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.userId);
          setUserEmail(decodedToken.userEmail);
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
  
    useEffect(() => {
      axios.get('/branch')
        .then(response => {
          setBranches(response.data);
        })
        .catch(error => {
          console.error('Error fetching branches:', error);
        });
    }, []);
  
    useEffect(() => {
      axios.get('/offer')
        .then(response => {
          setOffers(response.data);
        })
        .catch(error => {
          console.error('Error fetching offers:', error);
        });
    }, []);
  
    useEffect(() => {
      if (checkoutDetails.offer) {
        const offer = offers.find(o => o.offerId === checkoutDetails.offer);
        setSelectedOffer(offer);
        calculateCharges(totalAmount, offer ? offer.offerValue : 0);
      } else {
        calculateCharges(totalAmount, 0);
      }
    }, [checkoutDetails.offer, totalAmount, offers]);
  
    const fetchCartItems = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/cart/detailsInfo?userId=${userId}`);
          const data = await response.json();
          setCartItems(data.products);
          setTotalAmount(data.totalAmount);
          calculateCharges(data.totalAmount, selectedOffer ? selectedOffer.offerValue : 0);
        } catch (error) {
          console.error('Failed to fetch cart details', error);
        }
      }
    };
  
    const calculateCharges = (amount, offerValue) => {
      const tax = amount * 0.04;
      const deliveryCharge = amount * 0.05;
      const discount = (offerValue / 100) * amount;
      const finalTotal = amount - discount + tax + deliveryCharge;
  
      setTaxAmount(tax);
      setDeliveryCharges(deliveryCharge);
      setFinalTotal(finalTotal);
    };
  
    const handleCheckoutChange = (e) => {
      const { name, value } = e.target;
      setCheckoutDetails({ ...checkoutDetails, [name]: value });
  
      setErrors({ ...errors, [name]: '' });
    };
  
    const validateForm = () => {
      let valid = true;
      const newErrors = { branch: '', paymentMethod: '', deliveryAddress: '', offer: '' };
  
      if (!checkoutDetails.branch) {
        newErrors.branch = 'Branch is required.';
        valid = false;
      }
      if (!checkoutDetails.paymentMethod) {
        newErrors.paymentMethod = 'Payment method is required.';
        valid = false;
      }
      if (!checkoutDetails.deliveryAddress) {
        newErrors.deliveryAddress = 'Delivery address is required.';
        valid = false;
      }
      
  
      setErrors(newErrors);
      return valid;
    };
  
    const handlePlaceOrder = async () => {
      if (validateForm()) {
        try {
          const orderData = {
            userId,
            userEmail,
            items: cartItems.map(item => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.productPrice
            })),
            branch: checkoutDetails.branch,
            paymentMethod: checkoutDetails.paymentMethod,
            deliveryAddress: checkoutDetails.deliveryAddress,
            offerId: checkoutDetails.offer,
            taxAmount,
            deliveryCharges,
            discountAmount: selectedOffer ? (selectedOffer.offerValue / 100) * totalAmount : 0,
            finalAmount: finalTotal
          };
    
          await axios.post('/orders', orderData);
          
          Swal.fire({
            title: 'Success!',
            text: 'Order placed successfully!',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          });

          setTimeout(() => {
            navigate('/purchases');
          }, 2500);
    
        } catch (error) {
          console.error('Error placing order', error);
          Swal.fire({
            title: 'Error!',
            text: 'There was an issue placing your order.',
            icon: 'error',
            timer: 2500,
            showConfirmButton: false
          });
        }
      }
    };

  return (
    <>
      <Navigation2 />
      <h1 className="form-head-one">
        <div className="back-arrow-two">
          <span className="back-arrow-one" onClick={() => navigate('/cart')}>
            <i className="bi bi-caret-left-fill"></i>
          </span>
        </div>
        <span>Checkout</span>
      </h1>

      <div className="checkout-container d-flex">

        <div className="checkout-form-section flex-fill me-3">
          <form>
            <div className="mb-3 row">
              <label htmlFor="branch" className="col-sm-2 col-form-label">Nearest Branch *</label><br></br>
              <div className="col-sm-10">
                <div className="form-select-wrapper">
                  <select
                    className={`form-select ${errors.branch ? 'is-invalid' : ''}`}
                    id="branch"
                    name="branch"
                    value={checkoutDetails.branch}
                    onChange={handleCheckoutChange}
                    required
                  >
                    <option value="" disabled>Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.branchName} value={branch.branchName}>
                        {branch.branchName}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.branch && <div className="invalid-feedback">{errors.branch}</div>}
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="paymentMethod" className="col-sm-2 col-form-label">Payment Method *</label><br></br>
              <div className="col-sm-10">
                <div className="form-select-wrapper">
                  <select
                    className={`form-select ${errors.paymentMethod ? 'is-invalid' : ''}`}
                    id="paymentMethod"
                    name="paymentMethod"
                    value={checkoutDetails.paymentMethod}
                    onChange={handleCheckoutChange}
                    required
                  >
                    <option value="" disabled>Select a payment method</option>
                    <option value="Online Payment">Online Payment</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
                {errors.paymentMethod && <div className="invalid-feedback">{errors.paymentMethod}</div>}
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="deliveryAddress" className="col-sm-2 col-form-label">Delivery Address *</label><br></br>
              <div className="col-sm-10">
                <textarea
                  className={`form-control ${errors.deliveryAddress ? 'is-invalid' : ''}`}
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={checkoutDetails.deliveryAddress}
                  onChange={handleCheckoutChange}
                  rows="4"
                  placeholder="Enter your delivery address..."
                  required
                ></textarea>
                {errors.deliveryAddress && <div className="invalid-feedback">{errors.deliveryAddress}</div>}
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="offer" className="col-sm-2 col-form-label">Offer *</label><br></br>
              <div className="col-sm-10">
                <div className="form-select-wrapper">
                  <select
                    className={`form-select ${errors.offer ? 'is-invalid' : ''}`}
                    id="offer"
                    name="offer"
                    value={checkoutDetails.offer}
                    onChange={handleCheckoutChange}
                    required
                  >
                    <option value="" disabled>Select an offer</option><br></br>
                    {offers.map(offer => (
                      <option key={offer.offerId} value={offer.offerId}>
                        {offer.offerName} - {offer.offerValue}%
                      </option>
                    ))}
                  </select>
                </div>
                {errors.offer && <div className="invalid-feedback">{errors.offer}</div>}
              </div>
            </div>

            
          </form>
        </div>

      
      <div className="checkout-items-section flex-fill">
          {cartItems.length > 0 ? (
            <div>
              {cartItems.map((item) => (
                <div key={item.productId} className="checkout-item d-flex justify-content-between align-items-center mb-3">
                  <span>{item.productName} - {item.quantity}</span>
                  <span>Rs. {(item.productPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="checkout-total d-flex justify-content-between align-items-center mb-3">
                <span>Amount</span>
                <span>Rs. {totalAmount.toFixed(2)}</span>
              </div>
              <div className="checkout-item d-flex justify-content-between align-items-center mb-3">
                <span>Government Tax (4%)</span>
                <span>Rs. {taxAmount.toFixed(2)}</span>
              </div>
              <div className="checkout-item d-flex justify-content-between align-items-center mb-3">
                <span>Delivery Charges (5%)</span>
                <span>Rs. {deliveryCharges.toFixed(2)}</span>
              </div>
              {selectedOffer && (
                <div className="checkout-item d-flex justify-content-between align-items-center mb-3">
                  <span>Discount ({selectedOffer.offerValue}%)</span>
                  <span>- Rs. {(selectedOffer.offerValue / 100 * totalAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="checkout-final-total d-flex justify-content-between align-items-center mb-3">
                <span>Total</span>
                <span>Rs. {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
      </div>

      <button type="button" className="btn btn-primary-submit" onClick={handlePlaceOrder}>
              Place Order to Proceed
      </button>
      
    <SecFooter/>

    </>
  );
};

export default Checkout;
