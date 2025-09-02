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
    const [loading, setLoading] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);
  
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
          console.log('Decoded token:', decodedToken);
          console.log('Available token fields:', Object.keys(decodedToken));
          
          // Try different possible field names for userId
          const userId = decodedToken.userId || decodedToken.id || decodedToken.user_id || decodedToken.sub;
          const userEmail = decodedToken.userEmail || decodedToken.email || decodedToken.user_email;
          
          console.log('Extracted userId:', userId);
          console.log('Extracted userEmail:', userEmail);
          
          if (userId) {
            setUserId(userId);
            setUserEmail(userEmail);
          } else {
            console.error('No userId found in token');
            // Try to use a test user ID for debugging
            setUserId('cust001');
            setUserEmail('customer@test.com');
          }
        } catch (error) {
          console.error('Invalid token', error);
          // Use test user for debugging
          setUserId('cust001');
          setUserEmail('customer@test.com');
        }
      } else {
        console.error('No token found');
        // Use test user for debugging
        setUserId('cust001');
        setUserEmail('customer@test.com');
      }
    }, []);
  
    useEffect(() => {
      if (userId) {
        fetchCartItems();
      }
    }, [userId]);
  
    useEffect(() => {
      console.log('Fetching branches...');
      axios.get('/branch')
        .then(response => {
          console.log('Branches response:', response.data);
          setBranches(response.data);
        })
        .catch(error => {
          console.error('Error fetching branches:', error);
          console.error('Error details:', error.response?.data);
          console.error('Error status:', error.response?.status);
          // Set default branches if API fails
          setBranches([
            { branchId: 'branch001', branchName: 'Main Branch', branchAddress: '123 Main Street, Colombo' },
            { branchId: 'branch002', branchName: 'City Branch', branchAddress: '456 City Road, Kandy' }
          ]);
        });
    }, []);
  
    useEffect(() => {
      console.log('Fetching offers...');
      axios.get('/offer')
        .then(response => {
          console.log('Offers response:', response.data);
          setOffers(response.data);
        })
        .catch(error => {
          console.error('Error fetching offers:', error);
          console.error('Error details:', error.response?.data);
          console.error('Error status:', error.response?.status);
          // Set default offers if API fails
          setOffers([
            { offerId: 'off001', offerTitle: 'Summer Sale', offerValue: 20 },
            { offerId: 'off002', offerTitle: 'Student Discount', offerValue: 15 },
            { offerId: 'off003', offerTitle: 'New Year Special', offerValue: 25 }
          ]);
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
        console.log('Fetching cart items for userId:', userId);
        try {
          const response = await axios.get(`/api/cart/detailsInfo?userId=${userId}`);
          console.log('Cart response:', response.data);
          
          const products = response.data.products || [];
          console.log('Cart products:', products);
          
          // Process cart items and calculate total
          const processedItems = products.map(item => {
            // Handle different possible field names
            const quantity = item.quantity || item.productQuantity || item.qty || 1;
            const price = item.productPrice || item.price || item.unitPrice || 0.0;
            const productId = item.productId || item.id || '';
            const productName = item.productName || item.name || 'Unknown Product';
            
            return {
              ...item,
              quantity: parseInt(quantity) || 1,
              productPrice: parseFloat(price) || 0.0,
              productId: productId,
              productName: productName
            };
          });
          
          console.log('Processed cart items:', processedItems);
          
          // Calculate total amount safely
          const total = processedItems.reduce((sum, item) => {
            const itemTotal = (parseFloat(item.productPrice) || 0) * (parseInt(item.quantity) || 1);
            return sum + itemTotal;
          }, 0);
          
          console.log('Calculated total amount:', total);
          
          setCartItems(processedItems);
          setTotalAmount(total);
          calculateCharges(total, selectedOffer ? selectedOffer.offerValue : 0);
          
        } catch (error) {
          console.error('Failed to fetch cart details:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          
          // Fallback to basic cart data
          try {
            console.log('Trying fallback cart fetch...');
            const cartResponse = await axios.get(`/api/cart/details?userId=${userId}`);
            console.log('Fallback cart response:', cartResponse.data);
            
            if (cartResponse.data && cartResponse.data.productId) {
              // Convert cart format to items format
              const cartData = cartResponse.data.productId;
              const items = Object.keys(cartData).map(productId => ({
                productId: productId,
                productName: `Product ${productId}`,
                quantity: parseInt(cartData[productId]) || 1,
                productPrice: 100 // Default price, should be fetched from product details
              }));
              
              const total = items.reduce((sum, item) => sum + (parseFloat(item.productPrice) * parseInt(item.quantity)), 0);
              
              setCartItems(items);
              setTotalAmount(total);
              calculateCharges(total, selectedOffer ? selectedOffer.offerValue : 0);
            } else {
              console.log('No cart data found, setting empty cart');
              setCartItems([]);
              setTotalAmount(0);
              calculateCharges(0, 0);
            }
          } catch (fallbackError) {
            console.error('Fallback cart fetch also failed:', fallbackError);
            console.error('Fallback error response:', fallbackError.response?.data);
            console.error('Fallback error status:', fallbackError.response?.status);
            
            // Set empty cart as last resort
            setCartItems([]);
            setTotalAmount(0);
            calculateCharges(0, 0);
          }
        }
      } else {
        console.log('No userId available, cannot fetch cart');
      }
    };
  
    const calculateCharges = (amount, offerValue) => {
      // Ensure amount is a valid number
      const safeAmount = parseFloat(amount) || 0;
      
      const tax = safeAmount * 0.04;
      const deliveryCharge = safeAmount * 0.05;
      
      // Calculate discount based on offer percentage
      let discount = 0;
      if (offerValue && offerValue > 0) {
        // Extract percentage from offer value (e.g., "20%" -> 20)
        const percentage = parseFloat(offerValue.toString().replace('%', ''));
        if (!isNaN(percentage) && percentage > 0) {
          discount = (percentage / 100) * safeAmount;
        }
      }
      
      const finalTotal = safeAmount - discount + tax + deliveryCharge;
  
      setTaxAmount(tax);
      setDeliveryCharges(deliveryCharge);
      setFinalTotal(finalTotal);
      setDiscountAmount(discount);
      
      console.log('Charges calculation:', {
        originalAmount: amount,
        safeAmount,
      ,
        discount,
        tax,
        deliveryCharge,
        finalTotal
      });
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
      console.log('=== PLACING ORDER ===');
      console.log('Form validation result:', validateForm());
      console.log('Current checkout details:', checkoutDetails);
      console.log('Current cart items:', cartItems);
      console.log('Current total amount:', totalAmount);
      console.log('Current final total:', finalTotal);
      console.log('Current userId:', userId);
      console.log('Current userEmail:', userEmail);
      
      // Additional validation
      if (cartItems.length === 0) {
        Swal.fire({
          title: 'Cart Empty',
          text: 'Your cart is empty. Please add items before placing an order.',
          icon: 'warning',
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }
      
      if (!userId) {
        Swal.fire({
          title: 'User Not Found',
          text: 'Please log in again to place an order.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }
      
      if (validateForm()) {
        setLoading(true);
        try {
          const orderData = {
            userId: userId || '',
            userEmail: userEmail || '',
            items: cartItems.map(item => {
              console.log('Processing cart item:', item);
              console.log('Item keys:', Object.keys(item));
              
              // Handle different possible field names for quantity and price
              const quantity = item.quantity || item.productQuantity || item.qty || 1;
              const price = item.productPrice || item.price || item.unitPrice || 0.0;
              const productId = item.productId || item.id || '';
              const productName = item.productName || item.name || 'Unknown Product';
              
              console.log('Mapped values:', { productId, productName, quantity, price });
              
              return {
                productId: productId,
                productName: productName,
                quantity: parseInt(quantity) || 1,
                price: parseFloat(price) || 0.0
              };
            }),
            branch: checkoutDetails.branch || '',
            paymentMethod: checkoutDetails.paymentMethod || '',
            deliveryAddress: checkoutDetails.deliveryAddress || '',
            offerId: checkoutDetails.offer || null,
            taxAmount: parseFloat(taxAmount) || 0.0,
            deliveryCharges: parseFloat(deliveryCharges) || 0.0,
            discountAmount: parseFloat(discountAmount) || 0.0,
            finalAmount: parseFloat(finalTotal) || 0.0
          };
    
          console.log('Sending order data to backend:', orderData);
          console.log('Data types check:', {
            userId: typeof orderData.userId,
            userEmail: typeof orderData.userEmail,
            items: typeof orderData.items,
            branch: typeof orderData.branch,
            paymentMethod: typeof orderData.paymentMethod,
            deliveryAddress: typeof orderData.deliveryAddress,
            offerId: typeof orderData.offerId,
            taxAmount: typeof orderData.taxAmount,
            deliveryCharges: typeof orderData.deliveryCharges,
            discountAmount: typeof orderData.discountAmount,
            finalAmount: typeof orderData.finalAmount
          });
          
          // Test the backend endpoint first
          console.log('Testing backend endpoint...');
          try {
            const testResponse = await axios.get('/orders');
            console.log('Backend test successful:', testResponse.data);
          } catch (testError) {
            console.error('Backend test failed:', testError);
            throw new Error('Backend is not responding properly');
          }
          
          console.log('Attempting to create order...');
          const response = await axios.post('/orders', orderData);
          console.log('Order created successfully:', response.data);
          
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
          console.error('Error placing order:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
          console.error('Error message:', error.message);
          console.error('Full error object:', error);
          
          let errorMessage = 'There was an issue placing your order.';
          let errorDetails = '';
          
          if (error.response && error.response.data) {
            if (error.response.data.error) {
              errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
            errorDetails = JSON.stringify(error.response.data, null, 2);
          } else if (error.message) {
            errorMessage = `Error: ${error.message}`;
          }
          
          // Show detailed error in console
          console.error('Error details for debugging:', errorDetails);
          
          // Show user-friendly error
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            html: errorDetails ? `<div>${errorMessage}</div><small style="color: #666; margin-top: 10px;">${errorDetails}</small>` : errorMessage,
            icon: 'error',
            timer: 5000,
            showConfirmButton: true
          });
        } finally {
          setLoading(false);
        }
      } else {
        console.log('Form validation failed');
        console.log('Current errors:', errors);
        Swal.fire({
          title: 'Validation Error',
          text: 'Please fill in all required fields.',
          icon: 'warning',
          timer: 2500,
          showConfirmButton: false
        });
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
          <form onSubmit={(e) => e.preventDefault()}>
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
              <label htmlFor="offer" className="col-sm-2 col-form-label">Offer (Optional)</label><br></br>
              <div className="col-sm-10">
                <div className="form-select-wrapper">
                  <select
                    className={`form-select ${errors.offer ? 'is-invalid' : ''}`}
                    id="offer"
                    name="offer"
                    value={checkoutDetails.offer}
                    onChange={handleCheckoutChange}
                  >
                    <option value="">No offer</option>
                    {offers.map(offer => (
                      <option key={offer.offerId} value={offer.offerId}>
                        {offer.offerTitle} - {offer.offerValue}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.offer && <div className="invalid-feedback">{errors.offer}</div>}
                {selectedOffer && discountAmount > 0 && (
                  <div className="mt-2" style={{ color: '#28a745', fontSize: '0.9rem' }}>
                    <i className="bi bi-tag-fill me-1"></i>
                    You'll save Rs. {discountAmount.toFixed(2)} with this offer!
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

      
      <div className="checkout-items-section flex-fill">
          {cartItems.length > 0 ? (
            <div>
              {cartItems.map((item) => {
                // Handle different possible field names for quantity and price
                const quantity = item.quantity || item.productQuantity || item.qty || 1;
                const price = item.productPrice || item.price || item.unitPrice || 0.0;
                const productName = item.productName || item.name || 'Unknown Product';
                
                // Calculate item total safely
                const itemTotal = (parseFloat(price) || 0) * (parseInt(quantity) || 1);
                
                return (
                  <div key={item.productId || item.id} className="checkout-item d-flex justify-content-between align-items-center mb-3">
                    <span>{productName} - {quantity}</span>
                    <span>Rs. {itemTotal.toFixed(2)}</span>
                  </div>
                );
              })}
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
              {selectedOffer && discountAmount > 0 && (
                <div className="checkout-item d-flex justify-content-between align-items-center mb-3">
                  <span>Discount ({selectedOffer.offerValue})</span>
                  <span style={{ color: '#28a745' }}>- Rs. {discountAmount.toFixed(2)}</span>
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

      <div className="text-center mt-4 mb-4">
        <button 
          type="button" 
          className="btn btn-primary-submit"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order to Proceed'}
        </button>
      </div>
      
    <SecFooter/>

    </>
  );
};

export default Checkout;
