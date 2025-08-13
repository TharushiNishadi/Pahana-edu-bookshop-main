// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../../CSS/Profile.css';
// import SecFooter from "../footer2";
// import FrtNavigation from "../Navigations/navigation4";
// import SideNavigation from "../Navigations/navigation5";
// import UpdateBranchModal from './UpdateBranchModal';

// const ViewBranch = () => {
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [branchToDelete, setBranchToDelete] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [selectedBranch, setSelectedBranch] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     axios.get('/branch')
//       .then(response => {
//         setBranches(response.data);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError('Failed to fetch branches');
//         setLoading(false);
//       });
//   }, []);

//   const handleAddBranch = () => {
//     navigate('/add-branch');
//   };

//   const handleEditBranch = (branch) => {
//     setSelectedBranch(branch);
//     setShowModal(true);
//   };

//   const handleDeleteBranch = (branchId) => {
//     setBranchToDelete(branchId);
//     setShowDeleteModal(true);
//   };

//   const confirmDeleteBranch = () => {
//     if (!branchToDelete) return;

//     axios.delete(`/branch/${branchToDelete}`)
//       .then(() => {
//         setBranches(prevBranches => prevBranches.filter(branch => branch.branchId !== branchToDelete));
//         setShowDeleteModal(false);
//       })
//       .catch(() => {
//         setError('Failed to delete branch');
//       });
//   };

//   const cancelDeleteBranch = () => {
//     setShowDeleteModal(false);
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value.toLowerCase());
//   };

//   const filteredBranches = branches.filter(branch =>
//     branch.branchId.toLowerCase().includes(searchTerm) ||
//     branch.branchName.toLowerCase().includes(searchTerm) ||
//     branch.branchAddress.toLowerCase().includes(searchTerm)
//   );

//   const handleUpdateBranch = () => {
//     axios
//       .get('/branch')
//       .then((response) => {
//         setBranches(response.data);
//         setShowModal(false);
//       })
//       .catch((error) => {
//         setError('Failed to fetch updated branches');
//       });
//   };

//   return (
//     <>
//       <FrtNavigation />
//       <div className="gallery-container">
//         <SideNavigation />
//         <div className="add-user-container">
//           {loading ? (
//             <p>Loading...</p>
//           ) : error ? (
//             <p className="text-danger">{error}</p>
//           ) : (
//             <>
//               <div className="header-container">
//                 <div className="search-container-one">
//                   <input
//                     type="text"
//                     className="form-control search-input"
//                     placeholder="Search Branches..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
//                   />
//                 </div>
//                 <div className="button-container">
//                   <button className="btn-gold-add" onClick={handleAddBranch}>
//                     Add Branch
//                   </button>
//                 </div>
//               </div>

//               <div className='user-table-container'>
//                 <div className="gallery-content">
//                   <table className="custom-table">
//                     <thead>
//                       <tr>
//                         <th>Branch ID</th>
//                         <th>Branch Name</th>
//                         <th>Branch Address</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredBranches.map(branch => (
//                         <tr key={branch.branchId}>
//                           <td>{branch.branchId}</td>
//                           <td>{branch.branchName}</td>
//                           <td>{branch.branchAddress}</td>
//                           <td>
//                             <button
//                               className="btn-confirm"
//                               onClick={() => handleEditBranch(branch)}
//                             >
//                               Edit Branch
//                             </button>
//                             <button
//                               className="btn-deny"
//                               onClick={() => handleDeleteBranch(branch.branchId)}
//                             >
//                               Delete
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {selectedBranch && (
//         <UpdateBranchModal
//           show={showModal}
//           handleClose={() => setShowModal(false)}
//           branch={selectedBranch}
//           onUpdate={handleUpdateBranch}
//         />
//       )}

//       {showDeleteModal && (
//         <div className="modal-backdrop-blur">
//           <div className="modal show" style={{ display: 'block' }}>
//             <div className="modal-dialog">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h5 className="modal-title">Confirm Deletion</h5>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={cancelDeleteBranch}
//                   >
//                     &times;
//                   </button>
//                 </div>
//                 <div className="modal-body">
//                   <p>Are you sure you want to delete this branch? This action cannot be undone.</p>
//                 </div>
//                 <div className="modal-footer">
//                   <button className="btn btn-secondary" onClick={cancelDeleteBranch}>Cancel</button>
//                   <button className="btn btn-danger" onClick={confirmDeleteBranch}>Delete</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <SecFooter/>
//     </>
//   );
// };

// export default ViewBranch;
