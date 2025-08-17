import axios from 'axios';
import { useState } from 'react';
import Swal from 'sweetalert2';
import FrtNavigation from "./Navigations/navigation4";
import SideNavigation from "./Navigations/navigation5";
import SecFooter from './footer2';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const validateDates = () => {
    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Both start date and end date are required!',
        confirmButtonColor: '#A69003',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      return false;
    }
    return true;
  };

  const handleGenerateSalesReport = async () => {
    if (!validateDates()) return;

    try {
      const formattedStartDate = `${startDate}T00:00:00`;
      const formattedEndDate = `${endDate}T00:00:00`;

      const response = await axios.get(`/orders/sales-report`, {
        params: { startDate: formattedStartDate, endDate: formattedEndDate }
      });
      
      // Display sales report data
      const reportData = response.data;
      let reportContent = `📊 Sales Report\n\n`;
      reportContent += `📅 Period: ${startDate} to ${endDate}\n`;
      reportContent += `📈 Total Orders: ${reportData.totalOrders}\n`;
      reportContent += `💰 Total Revenue: Rs. ${reportData.totalRevenue?.toFixed(2) || '0.00'}\n`;
      reportContent += `🕒 Generated: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;
      
      if (reportData.salesData && reportData.salesData.length > 0) {
        reportContent += `📋 Sales Details:\n`;
        reportData.salesData.forEach((sale, index) => {
          reportContent += `${index + 1}. Order ${sale.orderId} - ${sale.customerName}\n`;
          reportContent += `   Product: ${sale.productName} x${sale.quantity} @ Rs.${sale.price}\n`;
          reportContent += `   Total: Rs.${sale.totalAmount} (${sale.status})\n\n`;
        });
      } else {
        reportContent += `No sales data found for the selected period.`;
      }
      
      Swal.fire({
        title: 'Sales Report Generated!',
        text: reportContent,
        icon: 'success',
        confirmButtonColor: '#A69003',
        width: '600px',
        customClass: {
          popup: 'text-left'
        }
      });
      
    } catch (error) {
      console.error("Error generating sales report", error);
      const errorMessage = error.response?.data?.error || 'Failed to generate sales report!';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#A69003',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  const handleGenerateFinancialReport = async () => {
    if (!validateDates()) return;

    try {
      const formattedStartDate = `${startDate}T00:00:00`;
      const formattedEndDate = `${endDate}T00:00:00`;

      const response = await axios.get(`/orders/financial-report`, {
        params: { startDate: formattedStartDate, endDate: formattedEndDate }
      });
      
      // Display financial report data
      const reportData = response.data;
      const financialData = reportData.financialData;
      
      let reportContent = `💰 Financial Report\n\n`;
      reportContent += `📅 Period: ${startDate} to ${endDate}\n`;
      reportContent += `📊 Total Revenue: Rs. ${financialData.totalRevenue?.toFixed(2) || '0.00'}\n`;
      reportContent += `📦 Total Orders: ${financialData.orderCount || 0}\n`;
      reportContent += `📈 Average Order Value: Rs. ${financialData.avgOrderValue?.toFixed(2) || '0.00'}\n`;
      reportContent += `🕒 Generated: ${new Date(reportData.generatedAt).toLocaleString()}\n\n`;
      
      if (financialData.topProducts && financialData.topProducts.length > 0) {
        reportContent += `🏆 Top Selling Products:\n`;
        financialData.topProducts.forEach((product, index) => {
          reportContent += `${index + 1}. ${product.productName}\n`;
          reportContent += `   Quantity: ${product.totalQuantity} | Revenue: Rs.${product.totalRevenue?.toFixed(2)}\n\n`;
        });
      }
      
      Swal.fire({
        title: 'Financial Report Generated!',
        text: reportContent,
        icon: 'success',
        confirmButtonColor: '#A69003',
        width: '600px',
        customClass: {
          popup: 'text-left'
        }
      });
      
    } catch (error) {
      console.error("Error generating financial report", error);
      const errorMessage = error.response?.data?.error || 'Failed to generate financial report!';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#A69003',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  };

  return (
    <>
      <FrtNavigation />
      <div className="gallery-container">
        <SideNavigation />
        <div className="add-user-container">
          <h1 className="form-head-one">
            <span>Generate Reports</span>
          </h1>
          <div className="mb-3">
            <label htmlFor="startDate" className="col-sm-2 col-form-label">Start Date *</label>
            <input
              id="startDate"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="endDate" className="col-sm-2 col-form-label">End Date *</label>
            <input
              id="endDate"
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn"
              style={{ backgroundColor: '#A69003', color: '#fff' }}
              onClick={handleGenerateSalesReport}
            >
              <i className="bi bi-box-arrow-down"></i> Generate Sales Report
            </button>
            <button
              className="btn"
              style={{ backgroundColor: '#A69003', color: '#fff' }}
              onClick={handleGenerateFinancialReport}
            >
              <i className="bi bi-box-arrow-down"></i> Generate Financial Report
            </button>
          </div>
        </div>
      </div>
      <SecFooter/>
    </>
  );
};

export default Reports;
