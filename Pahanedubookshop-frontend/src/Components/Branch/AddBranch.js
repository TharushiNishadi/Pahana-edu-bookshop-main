// import axios from 'axios';
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';
// import '../../CSS/Form.css';
// import TrdNavigation from '../Navigations/navigation4';
// import SecFooter from '../footer2';

// const AddBranch = () => {
//     const [formData, setFormData] = useState({
//         branchName: '',
//         branchAddress: '',
//     });
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.branchName) {
//             newErrors.branchName = 'Branch Name is required';
//         }

//         if (!formData.branchAddress) {
//             newErrors.branchAddress = 'Branch Address is required';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prevData => ({ ...prevData, [name]: value }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         if (validateForm()) {
//             setLoading(true);

//             axios
//                 .post('/branch', {
//                     branchName: formData.branchName,
//                     branchAddress: formData.branchAddress,
//                 })
//                 .then(response => {
//                     Swal.fire({
//                         title: 'Success!',
//                         text: 'Branch added successfully!',
//                         icon: 'success',
//                         timer: 2500,
//                         showConfirmButton: false
//                     }).then(() => {
//                         navigate('/view-branch');
//                     });
//                     setFormData({
//                         branchName: '',
//                         branchAddress: '',
//                     });
//                 })
//                 .catch(error => {
//                     console.error('Error adding branch:', error);
//                     const errorMsg = error.response?.data?.message || 'Failed to add branch';
//                     Swal.fire({
//                         title: 'Error!',
//                         text: errorMsg,
//                         icon: 'error',
//                         timer: 2500,
//                         showConfirmButton: false
//                     });
//                 })
//                 .finally(() => {
//                     setLoading(false);
//                 });
//         }
//     };

//     return (
//         <>
//             <TrdNavigation />
//             <div className="add-user-container">
//                 <h1 className="form-head">
//                     <div className='back-arrow' onClick={() => navigate('/view-branch')}>
//                         <i className="bi bi-caret-left-fill"></i>
//                     </div>
//                     Add New Branch
//                 </h1>

//                 {loading ? (
//                     <div className="d-flex flex-column justify-content-center align-items-center" style={{ blockSize: '80vh' }}>
//                         <div className="spinner-border text-primary" role="status">
//                             <span className="visually-hidden">Loading...</span>
//                         </div>
//                         <p className="mt-3" style={{ color: 'white', fontSize: 20 }}>Adding branch. Please wait...</p>
//                     </div>
//                 ) : (
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-3 row">
//                             <label htmlFor="branchName" className="col-sm-2 col-form-label">Branch Name *</label>
//                             <div className="col-sm-10">
//                                 <input
//                                     type="text"
//                                     className={`form-control ${errors.branchName ? 'is-invalid' : ''}`}
//                                     id="branchName"
//                                     name="branchName"
//                                     value={formData.branchName}
//                                     onChange={handleChange}
//                                     placeholder="Enter branch name"
//                                     required
//                                 />
//                                 {errors.branchName && <div className="invalid-feedback">{errors.branchName}</div>}
//                             </div>
//                         </div>

//                         <div className="mb-3 row">
//                             <label htmlFor="branchAddress" className="col-sm-2 col-form-label">Branch Address *</label>
//                             <div className="col-sm-10">
//                                 <input
//                                     type="text"
//                                     className={`form-control ${errors.branchAddress ? 'is-invalid' : ''}`}
//                                     id="branchAddress"
//                                     name="branchAddress"
//                                     value={formData.branchAddress}
//                                     onChange={handleChange}
//                                     placeholder="Enter branch address"
//                                     required
//                                 />
//                                 {errors.branchAddress && <div className="invalid-feedback">{errors.branchAddress}</div>}
//                             </div>
//                         </div>

//                         {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
                        
//                         <button type="submit" className="btn btn-primary-submit">Add Branch</button>
//                     </form>
//                 )}
//             </div>
//             <SecFooter/>
//         </>
//     );
// };

// export default AddBranch;
