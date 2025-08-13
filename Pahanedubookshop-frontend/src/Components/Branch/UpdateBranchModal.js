// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { Button, Form } from 'react-bootstrap';

// const UpdateBranchModal = ({ show, handleClose, branch, onUpdate }) => {
//   const [branchName, setBranchName] = useState(branch?.branchName || '');
//   const [branchAddress, setBranchAddress] = useState(branch?.branchAddress || '');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (branch) {
//       setBranchName(branch.branchName);
//       setBranchAddress(branch.branchAddress);
//     }
//   }, [branch]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!branch?.branchId) {
//       console.error('Branch ID is undefined');
//       return;
//     }

//     if (!branchName || !branchAddress) {
//       alert('Please fill all required fields.');
//       return;
//     }

//     setLoading(true);

//     try {
//       await axios.put(`/branch/${branch.branchId}`, {
//         branchName,
//         branchAddress,
//       });
//       onUpdate();
//       handleClose();
//     } catch (error) {
//       console.error('Error updating branch', error);
//       alert('Failed to update branch. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!show) return null;

//   return (
//     <>
//       <div className="modal-backdrop-blur"></div>
//       <div className="modal show" style={{ display: 'block' }}>
//         <div className="modal-dialog">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">Update Branch - {branchName}</h5>
//               <button
//                 type="button"
//                 className="btn-close"
//                 onClick={handleClose}
//               >
//                 &times;
//               </button>
//             </div>
//             <div className="modal-body">
//               <Form onSubmit={handleSubmit}>
//                 <Form.Group controlId="formBranchName">
//                   <Form.Label>Branch Name</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={branchName}
//                     onChange={(e) => setBranchName(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//                 <br />
//                 <Form.Group controlId="formBranchAddress">
//                   <Form.Label>Branch Address</Form.Label>
//                   <Form.Control
//                     type="text"
//                     value={branchAddress}
//                     onChange={(e) => setBranchAddress(e.target.value)}
//                     required
//                   />
//                 </Form.Group>
//                 <br />
//                 <div className="modal-footer">
//                   <Button variant="secondary" onClick={handleClose} className="btn btn-secondary">Close</Button>
//                   <Button variant="primary" type="submit" className="btn btn-danger" disabled={loading}>
//                     {loading ? 'Updating...' : 'Update'}
//                   </Button>
//                 </div>
//               </Form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UpdateBranchModal;
