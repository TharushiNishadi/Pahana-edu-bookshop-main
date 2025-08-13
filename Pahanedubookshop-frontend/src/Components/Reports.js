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
        params: { startDate: formattedStartDate, endDate: formattedEndDate },
        responseType: 'arraybuffer'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating sales report", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate sales report!',
        confirmButtonColor: '#A69003',
        showConfirmButton: false,
        timer: 2000,
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
        params: { startDate: formattedStartDate, endDate: formattedEndDate },
        responseType: 'arraybuffer'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating financial report", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate financial report!',
        confirmButtonColor: '#A69003',
        showConfirmButton: false,
        timer: 2000,
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
