// import React, { useState, useEffect } from "react";
// import "./LocationLayout.css";
// import SearchIcon from "../../../image/search.svg";
// import LocationImage from "../../../image/vendor.svg";

// import {
//   FaChevronRight,
//   FaFilter,
// } from "react-icons/fa";
// import { Box, Button, Drawer, Grid, IconButton, InputBase } from "@mui/material";
// import UploadMedia from "../../../components/UploadMedia";
// import LocationForm from "./LocationForm";
// import InventoryHeader from "../InventoryHeader";
// import ListView from "./ListView";
// import { useLocation } from "react-router-dom";

// export default function Location () {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [viewMode, setViewMode] = useState("list");
//   const [items, setItems] = useState(() => {
//     return JSON.parse(localStorage.getItem("locations")) || [];
//   });
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [filteredItems, setFilteredItems] = useState(items);
//   const [formData, setFormData] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const location = useLocation();

//   const [openLeft, setOpenLeft] = useState(false);
//   const [openRight, setOpenRight] = useState(false);
//   const [showUploadMedia, setShowUploadMedia] = useState(false);

//   useEffect(() => {
//     const storedItems = JSON.parse(localStorage.getItem("locations"));
//     setItems(Array.isArray(storedItems) ? storedItems : []);
//   }, []);

//   useEffect(() => {
//     if (location.state?.openForm) {
//       setIsFormVisible(true);
//     }
//   }, [location.state?.openForm]);

//   const handleSaveAndSubmit = (data) => {
//     const newItem = {
//       ...data,
//       id: (items.length + 1).toString(),
//       category: data.locationCategory,
//       image: data.image || LocationImage,
//     };
//     const updatedItems = [...items, newItem];
//     setItems(updatedItems);
//     setFilteredItems(updatedItems);
//     localStorage.setItem("locations", JSON.stringify(updatedItems));
//     setIsFormVisible(false);
//   };

//   const handleSearch = () => {
//     if (searchQuery === "") {
//       setFilteredItems(items);
//     } else {
//       const lowercasedQuery = searchQuery.toLowerCase();
//       const filtered = items.filter(
//         (item) =>
//           item.id.toLowerCase().includes(lowercasedQuery) ||
//           item.locationName.toLowerCase().includes(lowercasedQuery) ||
//           item.address.toLowerCase().includes(lowercasedQuery) ||
//           item.manager.toLowerCase().includes(lowercasedQuery) ||
//           item.category.toLowerCase().includes(lowercasedQuery)
//       );
//       setFilteredItems(filtered);
//     }
//   };

//   useEffect(() => {
//     handleSearch();
//   }, [searchQuery, items]);

//   const toggleLeftDrawer = (open) => () => setOpenLeft(open);
//   const toggleRightDrawer = (open) => () => setOpenRight(open);

//   const handleNewLocation = () => {
//     setIsFormVisible(true);
//   };

//   const handleFormClose = () => {
//     setIsFormVisible(false);
//   };

//   const handleCardClick = (item) => {
//     setSelectedItem(item);
//   };

//   const handleCloseLocationDetails = () => {
//     setSelectedItem(null);
//   };

//   const handleSaveLocationDetails = (updatedLocation) => {
//     const updatedItems = items.map((item) =>
//       item.id === updatedLocation.id ? updatedLocation : item
//     );
//     setItems(updatedItems);
//     setFilteredItems(updatedItems);
//     localStorage.setItem("locations", JSON.stringify(updatedItems));
//     setSelectedItem(updatedLocation);
//   };

//   return (
//     <div className="container-body">
//       <div className="location" id="location">
//         <InventoryHeader />
//         <div className="prq1">
//           <Grid
//             container
//             spacing={2}
//             alignItems="center"
//             sx={{ height: "40px", marginBottom: "32px" }}
//           >
//             <IconButton
//               onClick={toggleLeftDrawer(true)}
//               sx={{ display: { xs: "block", md: "none" }, color: "#3B7CED" }}
//             >
//               <FaChevronRight />
//             </IconButton>

//             <Grid
//               item
//               xs={12}
//               md={6}
//               sx={{
//                 display: { xs: "none", md: "flex" },
//                 alignItems: "center",
//               }}
//             >
//               <Button
//                 onClick={handleNewLocation}
//                 variant="contained"
//                 sx={{
//                   height: "100%",
//                   backgroundColor: "#3B7CED",
//                   color: "white",
//                   textTransform: "capitalize",
//                 }}
//               >
//                 New Location
//               </Button>

//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   ml: 4,
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                   paddingLeft: "10px",
//                 }}
//               >
//                 <img src={SearchIcon} alt="Search" style={{ height: "20px" }} />
//                 <InputBase
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search"
//                   sx={{
//                     ml: 1,
//                     height: "100%",
//                     padding: "0 8px",
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <IconButton
//               onClick={toggleRightDrawer(true)}
//               sx={{
//                 display: { xs: "block", md: "none" },
//                 color: "#3B7CED",
//                 marginLeft: "auto",
//               }}
//             >
//               <FaFilter />
//             </IconButton>
//           </Grid>

//           <div className="prq4">
//             {selectedItem ? (
//               <LocationDetails
//                 location={selectedItem}
//                 onClose={handleCloseLocationDetails}
//                 onSave={handleSaveLocationDetails}
//               />
//             ) : viewMode === "grid" ? (
//               filteredItems.map((item) => (
//                 <div
//                   className="location-card"
//                   key={item.id}
//                   onClick={() => handleCardClick(item)}
//                 >
//                   <div className="location-image">
//                     <img
//                       src={item.image}
//                       alt="Location"
//                       className="circular-image"
//                     />
//                   </div>
//                   <p className="location-name">{item.locationName}</p>
//                   <p className="location-address">{item.address}</p>
//                   <p className="location-manager">{item.manager}</p>
//                 </div>
//               ))
//             ) : (
//               <ListView
//                 items={filteredItems}
//                 onItemClick={handleCardClick}
//               />
//             )}
//           </div>

//           <Drawer
//             anchor="left"
//             open={openLeft}
//             onClose={toggleLeftDrawer(false)}
//           >
//             <ListView
//               items={filteredItems}
//               onItemClick={handleCardClick}
//               viewMode="list"
//             />
//           </Drawer>

//           <Drawer
//             anchor="right"
//             open={openRight}
//             onClose={toggleRightDrawer(false)}
//           >
//             {/* Filters or other components for the right drawer */}
//           </Drawer>

//           {isFormVisible && (
//             <LocationForm
//               onSave={handleSaveAndSubmit}
//               onClose={handleFormClose}
//               initialData={formData}
//             />
//           )}

//           {showUploadMedia && (
//             <UploadMedia onClose={() => setShowUploadMedia(false)} />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
