import React, { useState, useEffect } from "react";
import "./vendor.css";
import SearchIcon from "../../../image/search.svg";
import VendorImage from "../../../image/vendor.svg";
import {
  FaCaretLeft,
  FaCaretRight,
  FaChevronRight,
  FaFilter,
  FaThList,
} from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import Listview from "./Listview";
import Newvendor from "./Newvendor";
import VendorDetails from "./VendorDetails";

import CloudDownload from "../../../image/cloud-download.svg";
import ExcelFile from "../../../vendorExcelFile.xlsx";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  InputBase,
} from "@mui/material";
import UploadMedia from "../../../components/UploadMedia";
import PurchaseHeader from "../PurchaseHeader";
import { usePurchase } from "../../../context/PurchaseContext";

export const getVendors = (items) => {
  return items.map((item) => ({
    id: item.id,
    vendorName: item.vendorName,
    email: item.email,
    phone: item.phone,
    address: item.address,
    category: item.category,
    image: item.image,
  }));
};

export const getCategories = (items) => {
  const categories = new Set(items.map((item) => item.category));
  return Array.from(categories);
};

export default function Vend() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  // const [items, setItems] = useState(() => {
  //   return JSON.parse(localStorage.getItem("vendors")) || [];
  // });
  // const [vendors, setVendors] = useState([]);
  const { vendors, createVendor, error } = usePurchase();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState(vendors);
  console.log(filteredItems);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [categories, setCategories] = useState([]);
  const [vendorDropdownVisible, setVendorDropdownVisible] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const location = useLocation();

  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const [showUploadMedia, setShowUploadMedia] = useState(false);

  const toggleLeftDrawer = (open) => () => setOpenLeft(open);
  const toggleRightDrawer = (open) => () => setOpenRight(open);

  const handleCloseUploadMedia = () => {
    setShowUploadMedia(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.state?.openForm) {
        setIsFormVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.state?.openForm]);

  // useEffect(() => {
  //   setFilteredItems(items);
  //   localStorage.setItem("vendors", JSON.stringify(items));
  // }, [items]);

  useEffect(() => {
    // const storedVendors = JSON.parse(localStorage.getItem("vendors")) || [];
    // setVendors(storedVendors);
    setCategories(["IT Hardware Sales", "Printing & Branding"]);
  }, []);

  const handleSaveAndSubmit = (data) => {
    console.log(data);
    setFormData(data);
    createVendor(data);
    setIsSubmitted(true);
    // submit logic here

    // const newItem = {
    //   ...data,
    //   id: (vendors.length + 1).toString(),
    //   category: data.vendorCategory,
    //   image: data.image || VendorImage,
    // };
    // setItems([...vendors, newItem]);
    setIsFormVisible(false);
  };

  const handleFormDataChange = (data) => {
    setFormData(data);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewVendor = () => {
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsSubmitted(false);
    console.log("handle form close");
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredItems(vendors);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = vendors.filter(
        (item) =>
          item.id.toLowerCase().includes(lowercasedQuery) ||
          item.vendorName.toLowerCase().includes(lowercasedQuery) ||
          item.email.toLowerCase().includes(lowercasedQuery) ||
          item.phone.toLowerCase().includes(lowercasedQuery) ||
          item.address.toLowerCase().includes(lowercasedQuery) ||
          item.category.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, vendors]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseVendorDetails = () => {
    setSelectedItem(null);
  };

  const handleSaveVendorDetails = (updatedVendor) => {
    // logic to update vendor details

    // const updatedItems = vendors.map((item) =>
    //   item.id === updatedVendor.id ? updatedVendor : item
    // );
    // setItems(updatedItems);
    // setFilteredItems(updatedItems);
    // localStorage.setItem("vendors", JSON.stringify(updatedItems));
    setSelectedItem(updatedVendor);
  };

  const handleVendorSelect = (vendor) => {
    setFormData({
      ...formData,
      vendorName: vendor.vendorName,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      vendorCategory: vendor.category,
    });
    setVendorDropdownVisible(false);
  };

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      vendorCategory: category,
    });
    setCategoryDropdownVisible(false);
  };

  return (
    <div className="container-bod">
      <div className="vend" id="vend">
        <PurchaseHeader />
        <div className="prq1">
          <div className="prq2">
            {/* New secondary navbar */}
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ height: "40px", marginBottom: "32px" }}
            >
              {/* Icon for Left Drawer */}
              <IconButton
                onClick={toggleLeftDrawer(true)}
                sx={{ display: { xs: "block", md: "none" }, color: "#3B7CED" }}
              >
                <FaChevronRight /> {/* Updated icon for left drawer */}
              </IconButton>

              {/* Left side - Hidden on small, shown on large */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                }}
              >
                <Button
                  onClick={() => setIsFormVisible(true)}
                  variant="contained"
                  sx={{
                    height: "100%",
                    backgroundColor: "#3B7CED",
                    color: "white",
                    textTransform: "capitalize",
                  }}
                >
                  New Vendor
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    ml: 4,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    paddingLeft: "10px",
                  }}
                >
                  <img
                    src={SearchIcon}
                    alt="Search"
                    style={{ height: "20px" }}
                  />
                  <InputBase
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    sx={{
                      ml: 1,
                      height: "100%",

                      padding: "0 8px",
                    }}
                  />
                </Box>

                <IconButton
                  style={{ marginLeft: "24px" }}
                  onClick={() => setShowUploadMedia(true)}
                >
                  <img
                    src={CloudDownload}
                    alt="Download Excel"
                    style={{ height: "32px" }}
                  />
                </IconButton>
              </Grid>

              {/* Icon for Right Drawer */}
              <IconButton
                onClick={toggleRightDrawer(true)}
                sx={{
                  display: { xs: "block", md: "none" },
                  color: "#3B7CED",
                  marginLeft: "auto",
                }}
              >
                <FaFilter /> {/* Updated icon for right drawer */}
              </IconButton>

              {/* Right side - Hidden on small, shown on large */}
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  display: { xs: "none", md: "flex" },
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <p style={{ margin: 0 }}>1-2 of 2</p>
                  <Box sx={{ display: "flex", ml: 2 }}>
                    <IconButton
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #A9B3BC",
                        borderRadius: "4px 0 0 4px",
                      }}
                    >
                      <FaCaretLeft style={{ color: "#A9B3BC" }} />
                    </IconButton>

                    <IconButton
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #A9B3BC",
                        borderRadius: "0 4px 4px 0",
                      }}
                    >
                      <FaCaretRight style={{ color: "#A9B3BC" }} />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    ml: 2,
                  }}
                >
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "4px 0 0 4px",
                    }}
                  >
                    <IoGrid
                      style={{
                        color: viewMode === "grid" ? "#3B7CED" : "#A9B3BC",
                      }}
                    />
                  </IconButton>

                  <IconButton
                    onClick={() => setViewMode("list")}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <FaThList
                      style={{
                        color: viewMode === "list" ? "#3B7CED" : "#A9B3BC",
                      }}
                    />
                  </IconButton>
                </Box>
              </Grid>

              {/* Drawer for Left side on small screens */}
              <Drawer
                anchor="left"
                open={openLeft}
                onClose={toggleLeftDrawer(false)}
              >
                <Box sx={{ p: 2, width: 250 }}>
                  {/* Same content as the left side on large screens */}
                  <Button
                    onClick={() => setIsFormVisible(true)}
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#3B7CED",
                      color: "white",
                      textTransform: "capitalize",
                    }}
                  >
                    New Vendor
                  </Button>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 2,
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <img
                      src={SearchIcon}
                      alt="Search"
                      style={{
                        height: "20px",
                        paddingLeft: "8px",
                      }}
                    />
                    <InputBase
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      sx={{
                        ml: 1,
                        height: "100%",
                        padding: "0 8px",
                      }}
                    />
                  </Box>

                  {/* <a
                    href={ExcelFile}
                    download={ExcelFile}
                    style={{ marginTop: "10px", display: "block" }}
                  > */}
                  <IconButton onClick={() => setShowUploadMedia(true)}>
                    <img
                      src={CloudDownload}
                      alt="Download Excel"
                      style={{ height: "20px" }}
                    />
                  </IconButton>
                  {/* </a> */}
                </Box>
              </Drawer>

              {/* Drawer for Right side on small screens */}
              <Drawer
                anchor="right"
                open={openRight}
                onClose={toggleRightDrawer(false)}
              >
                <Box sx={{ p: 2, width: 250 }}>
                  {/* Same content as the right side on large screens */}
                  <p>1-2 of 2</p>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <IconButton
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #A9B3BC",
                        borderRadius: "4px 0 0 4px",
                      }}
                    >
                      <FaCaretLeft style={{ color: "#A9B3BC" }} />
                    </IconButton>

                    <IconButton
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #A9B3BC",
                        borderRadius: "0 4px 4px 0",
                      }}
                    >
                      <FaCaretRight style={{ color: "#A9B3BC" }} />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <IconButton
                      onClick={() => setViewMode("grid")}
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #A9B3BC",
                        borderRadius: "4px 0 0 4px",
                      }}
                    >
                      <IoGrid
                        style={{
                          color: viewMode === "grid" ? "#3B7CED" : "#A9B3BC",
                        }}
                      />
                    </IconButton>

                    <IconButton
                      onClick={() => setViewMode("list")}
                      sx={{
                        backgroundColor: "white",
                        border: "1px solid #A9B3BC",
                        borderRadius: "0 4px 4px 0",
                      }}
                    >
                      <FaThList
                        style={{
                          color: viewMode === "list" ? "#3B7CED" : "#A9B3BC",
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </Drawer>
            </Grid>

            {/* HERE IS THE CONTAINER THAT CONDITIONALY RENDERS THE LISTVIEW, GRIDVIEW, AND ITEMS DETAIL  */}
            <div className="prq4">
              {selectedItem ? (
                <VendorDetails
                  vendor={selectedItem}
                  onClose={handleCloseVendorDetails}
                  onSave={handleSaveVendorDetails}
                />
              ) : viewMode === "grid" ? (
                filteredItems.map((item) => (
                  <div
                    className="vr4gv"
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="vendor-image">
                      <img
                        src={item.image}
                        alt="Vendor"
                        className="circular-image"
                      />
                    </div>
                    <p className="vendor-name">{item.vendor_name}</p>
                    <p className="vendor-email">{item.email}</p>
                    <p className="vendor-phone">{item.phone_number}</p>
                    <p className="vendor-address">{item.address}</p>
                    <p className="vendor-category">{item.category}</p>
                  </div>
                ))
              ) : (
                <Listview items={filteredItems} onItemClick={handleCardClick} />
              )}
            </div>
          </div>
        </div>

        {/* RENDERS THE NEW VENDORS FORM CONDITIONALY */}
        {isFormVisible && (
          <div className="overlay">
            <Newvendor
              onClose={handleFormClose}
              onSaveAndSubmit={handleSaveAndSubmit}
              fromPurchaseModuleWizard={location.state?.openForm}
            />
          </div>
        )}
        {/* RENDER UPLOAD PRODUCT FILE FORM CONDITIONALLY */}
        {showUploadMedia && (
          <div className="overlay">
            <UploadMedia
              onClose={handleCloseUploadMedia}
              endpoint="/vendors/upload_excel/"
              excelFile={ExcelFile}
            />
          </div>
        )}
      </div>
    </div>
  );
}
