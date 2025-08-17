import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../CSS/Cart.css'; // Import the CSS file
import '../../CSS/Purchases.css'; // Import the Purchases CSS file
import SecFooter from '../footer2';
import SecNavigation from '../Navigations/navigation2';

const Purchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Parse JWT token to get userId
        let userId;
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          userId = decoded.userId;
        } catch (parseError) {
          console.error('Error parsing token:', parseError);
          setLoading(false);
          return;
        }

        if (userId) {
          console.log('Fetching orders for userId:', userId);
          const response = await axios.get(`/orders?userId=${userId}`);
          console.log('Orders response:', response.data);
          setOrders(response.data);
        } else {
          console.error('No userId found in token');
        }
      } catch (error) {
        console.error('There was an error fetching the orders!', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDownloadBill = async (orderId) => {
    try {
      const response = await axios.get(`/orders/${orderId}/bill`, {
        responseType: 'arraybuffer'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading bill', error);
    }
  };

  const formatAmount = (amount) => {
    return amount.toFixed(2);
  };

  const getStatusText = (status) => {
    if (!status) return 'Pending';
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'accepted':
        return 'Accepted';
      case 'denied':
      case 'rejected':
        return 'Denied';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'pending';
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'accepted':
        return 'accepted';
      case 'denied':
      case 'rejected':
        return 'denied';
      case 'pending':
      default:
        return 'pending';
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p>Loading your purchase history...</p>
    </div>
  );

  return (
    <>
      <SecNavigation />
      <div className="purchases-container">
        <h1 className="page-title">My Purchase History</h1>
        {orders.length === 0 ? (
          <div className="no-orders-message">
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start shopping to see your purchase history here!</p>
          </div>
        ) : (
          orders.map(order => {
            console.log('Rendering order:', order);
            return (
          <div key={order.orderId} className="order-card">
            <div className="order-info">
              <div className='order-id'>
                <strong>{order.orderId}</strong>
                <button 
                  className="btn-download-receipt"
                  onClick={() => handleDownloadBill(order.orderId)}
                  title="Download Receipt"
                >
                  <i className="bi bi-box-arrow-down"></i>
                </button>
              </div>
              <div className="order-date">
                <small>Order Date: {new Date(order.orderDate).toLocaleDateString()}</small>
              </div>
              <div className="order-items">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <span key={index}>
                        {item.quantity}  {item.productName}
                        {index < order.items.length - 1 && '  , '}
                      </span>
                    ))
                  ) : (
                    <span className="no-items">No items found</span>
                  )}
                </div>
            </div>
            <div className="order-summary">
              <div className="order-text">
                Rs. {formatAmount(order.totalAmount || 0)}
              </div>
                                <div className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
            </div>
          </div>
            );
          })
        )}
      </div>
      <SecFooter/>
    </>
  );
};

export default Purchases;
