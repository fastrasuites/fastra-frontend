// import React, { useState } from "react";
// import "./LocationDetails.css";
// import { DataGrid } from "@mui/x-data-grid";
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   IconButton,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

// export default function VendorDetails({ vendor, onClose, onSave }) {
//   const [editMode, setEditMode] = useState(false);
//   const [formState, setFormState] = useState({ ...vendor });
//   const [filteredRfqs, setFilteredRfqs] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);

//   if (!vendor) return null;

//   const rfqColumns = [
//     { field: "rfqId", headerName: "RFQ ID", width: 150 },
//     {
//       field: "product",
//       headerName: "Product Name",
//       width: 250,
//       renderCell: (params) => {
//         const productNames = params.value.split(",");
//         if (productNames.length > 1) {
//           return (
//             <Accordion
//               style={{ backgroundColor: "transparent", boxShadow: "none" }}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls="panel1a-content"
//                 id="panel1a-header"
//               >
//                 {productNames[0]}
//               </AccordionSummary>
//               <AccordionDetails
//                 style={{
//                   flexDirection: "column",
//                   overflowY: "auto",
//                   maxHeight: "150px",
//                 }}
//               >
//                 {productNames.slice(1).map((productName, index) => (
//                   <div key={index}>{productName}</div>
//                 ))}
//               </AccordionDetails>
//             </Accordion>
//           );
//         } else {
//           return productNames[0];
//         }
//       },
//     },
//     {
//       field: "quantity",
//       headerName: "Qty",
//       type: "number",
//       width: 150,
//       renderCell: (params) => {
//         const quantities = params.value.split(",");
//         if (quantities.length > 1) {
//           return (
//             <Accordion
//               style={{ backgroundColor: "transparent", boxShadow: "none" }}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls="panel1a-content"
//                 id="panel1a-header"
//               >
//                 {quantities[0]}
//               </AccordionSummary>
//               <AccordionDetails
//                 style={{
//                   flexDirection: "column",
//                   overflowY: "auto",
//                   maxHeight: "150px",
//                 }}
//               >
//                 {quantities.slice(1).map((qty, index) => (
//                   <div key={index}>{qty}</div>
//                 ))}
//               </AccordionDetails>
//             </Accordion>
//           );
//         } else {
//           return quantities[0];
//         }
//       },
//     },
//     { field: "dateOpened", headerName: "Date Opened", width: 180 },
//     { field: "expiryDate", headerName: "Expiry Date", width: 180 },
//     {
//       field: "vendor",
//       headerName: "Vendor",
//       width: 250,
//       renderCell: (params) => {
//         if (params.row.status === "Awaiting Vendor Selection") {
//           return (
//             <div
//               style={{ display: "flex", alignItems: "center", color: "blue" }}
//             >
//               <span style={{ color: "blue" }}>Select Vendor</span>
//               <IconButton style={{ color: "blue" }}>
//                 <ArrowDropDownIcon />
//               </IconButton>
//             </div>
//           );
//         } else {
//           return params.value;
//         }
//       },
//     },
//     {
//       field: "status",
//       headerName: "Status",
//       width: 150,
//       renderCell: (params) => {
//         const color = getStatusColor(params.value);
//         return (
//           <div style={{ display: "flex", alignItems: "center", color }}>
//             <div
//               style={{
//                 width: "10px",
//                 height: "10px",
//                 borderRadius: "50%",
//                 backgroundColor: color,
//                 marginRight: "8px",
//               }}
//             ></div>
//             {params.value}
//           </div>
//         );
//       },
//     },
//   ];

//   const orderColumns = [
//     { field: "poId", headerName: "Purchase Order ID", width: 150 },
//     {
//       field: "product",
//       headerName: "Product Name",
//       width: 250,
//       renderCell: (params) => {
//         const productNames = params.value.split(",");
//         if (productNames.length > 1) {
//           return (
//             <Accordion
//               style={{ backgroundColor: "transparent", boxShadow: "none" }}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls="panel1a-content"
//                 id="panel1a-header"
//               >
//                 {productNames[0]}
//               </AccordionSummary>
//               <AccordionDetails
//                 style={{
//                   flexDirection: "column",
//                   overflowY: "auto",
//                   maxHeight: "150px",
//                 }}
//               >
//                 {productNames.slice(1).map((productName, index) => (
//                   <div key={index}>{productName}</div>
//                 ))}
//               </AccordionDetails>
//             </Accordion>
//           );
//         } else {
//           return productNames[0];
//         }
//       },
//     },
//     {
//       field: "quantity",
//       headerName: "Qty",
//       type: "number",
//       width: 150,
//       renderCell: (params) => {
//         const quantities = params.value.split(",");
//         if (quantities.length > 1) {
//           return (
//             <Accordion
//               style={{ backgroundColor: "transparent", boxShadow: "none" }}
//             >
//               <AccordionSummary
//                 expandIcon={<ExpandMoreIcon />}
//                 aria-controls="panel1a-content"
//                 id="panel1a-header"
//               >
//                 {quantities[0]}
//               </AccordionSummary>
//               <AccordionDetails
//                 style={{
//                   flexDirection: "column",
//                   overflowY: "auto",
//                   maxHeight: "150px",
//                 }}
//               >
//                 {quantities.slice(1).map((qty, index) => (
//                   <div key={index}>{qty}</div>
//                 ))}
//               </AccordionDetails>
//             </Accordion>
//           );
//         } else {
//           return quantities[0];
//         }
//       },
//     },
//     { field: "dateCreated", headerName: "Date Created", width: 180 },
//     { field: "vendor", headerName: "Vendor", width: 250 },
//     {
//       field: "status",
//       headerName: "Status",
//       width: 150,
//       renderCell: (params) => {
//         const color = getStatusColor(params.value);
//         return (
//           <div style={{ display: "flex", alignItems: "center", color }}>
//             <div
//               style={{
//                 width: "10px",
//                 height: "10px",
//                 borderRadius: "50%",
//                 backgroundColor: color,
//                 marginRight: "8px",
//               }}
//             ></div>
//             {params.value}
//           </div>
//         );
//       },
//     },
//   ];

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Vendor Selected":
//         return "#2ba24c";
//       case "Awaiting Vendor Selection":
//         return "#f0b501";
//       case "Order Completed":
//         return "#2ba24c";
//       case "Awaiting Goods":
//         return "#f0b501";
//       default:
//         return "#7a8a98";
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormState((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setFormState((prev) => ({
//           ...prev,
//           image: e.target.result,
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };


//   const handleSave = () => {
//     onSave(formState);
//     setEditMode(false);
//   };

//   return (
//     <div id="vendetails" className="vendet">
//       <form className="vendet1">
//         <div className="vendet2">
//           <p style={{ fontSize: "20px" }}>Basic Information</p>
//           <div className="vendet2a">
//             <button type="button" className="vendet2but" onClick={onClose}>
//               Cancel
//             </button>
//             {editMode ? (
//               <button type="button" className="vendet2btn" onClick={handleSave}>
//                 Save
//               </button>
//             ) : (
//               <button type="button" className="vendet2btn" onClick={() => setEditMode(true)}>
//                 Edit
//               </button>
//             )}
//           </div>
//         </div>
//         <div className="vendet3">
//           <div className="vendet3a">
//             <label>Vendor Name</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="name"
//                 value={formState.vendorName}
//                 onChange={handleChange}
//                 className="editable-input"
//               />
//             ) : (
//               <p className="vendet3b">{vendor.vendorName}</p>
//             )}
//           </div>
//           <div className="vendet3a">
//             <label>Category</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="vendorCategory"
//                 className="editable-input"
//                 value={formState.vendorCategory}
//                 onChange={handleChange}
//               />
//             ) : (
//               <p className="vendet3b">{vendor.category}</p>
//             )}
//           </div>
//           <div className="vendet3a">
//             <label>Email Address</label>
//             {editMode ? (
//               <input
//                 type="email"
//                 name="email"
//                 className="editable-input"
//                 value={formState.email}
//                 onChange={handleChange}
//               />
//             ) : (
//               <p className="vendet3b">{vendor.email}</p>
//             )}
//           </div>
//         </div>
//         <div className="vendet4">
//           <div className="vendet4a">
//             <label>Phone Number</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="phone"
//                 className="editable-input"
//                 value={formState.phone}
//                 onChange={handleChange}
//               />
//             ) : (
//               <p className="vendet4b">{vendor.phone}</p>
//             )}
//           </div>
//           <div className="vendet4a">
//             <label>Address</label>
//             {editMode ? (
//               <input
//                 type="text"
//                 name="address"
//                 className="editable-input"
//                 value={formState.address}
//                 onChange={handleChange}
//               />
//             ) : (
//               <p className="vendet4b">{vendor.address}</p>
//             )}
//           </div>
//           <div className="vendet4a">
//             <label>Image</label>
//             {editMode ? (
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="editable-input"
//               />
//             ) : (
//               <img src={vendor.image} alt={vendor.name} className="vendet4b" style={{ width: '50px', height: '50px' }} />
//             )}
//           </div>
//         </div>
//         <div>
//         <div className="vendet5">
//               <div style={{ height: 400, width: "100%" }}>
//                 <DataGrid
//                   rows={filteredRfqs}
//                   columns={rfqColumns}
//                   pageSize={5}
//                   disableColumnFilter={!editMode}
//                 />
//               </div>
//             </div>
//             <div className="vendet5">
//               <div style={{ height: 400, width: "100%" }}>
//                 <DataGrid rows={filteredOrders} columns={orderColumns} pageSize={5} />
//               </div>
//             </div>
//         </div>
//       </form>
//     </div>
//   );
// }
