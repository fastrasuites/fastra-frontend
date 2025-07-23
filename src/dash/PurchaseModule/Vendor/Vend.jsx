import React, { useState, useEffect } from "react";
import "./vendor.css";
import SearchIcon from "../../../image/search.svg";
import { FaCaretLeft, FaCaretRight, FaThList } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import {
  Box,
  Grid,
  IconButton,
  InputBase,
  Drawer,
  Button,
} from "@mui/material";
import Listview from "./Listview";
import VendorDetails from "./VendorDetails";
import Swal from "sweetalert2";
import { usePurchase } from "../../../context/PurchaseContext";
import { Link, useHistory } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import UploadIcon from "../../../image/cloud-download.svg";
import UploadMedia from "../../../components/UploadMedia";

export default function Vend() {
  const [openUploadMedia, setOpenUploadMedia] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [openRight, setOpenRight] = useState(false);
  const [loading, setLoading] = useState(false);
  const tenant = useTenant().tenantData.tenant_schema_name;
  const history = useHistory();

  const { fetchVendors, vendors, error } = usePurchase();
  const data = Array.isArray(vendors) ? vendors : [];

  const toggleRightDrawer = (open) => () => setOpenRight(open);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      setLoading(true);
      const results = await fetchVendors(searchQuery);
      setLoading(false);

      if (searchQuery && (!results || results.length === 0)) {
        Swal.fire({
          icon: "info",
          title: "No results found",
          text: "Try a different search term.",
        });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery, fetchVendors]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Failed to load vendors",
        text: error?.message || "An unexpected error occurred.",
      });
    }
  }, [error]);

  const handleCardClick = (item) => {
    history.push(`/${tenant}/purchase/vendor/${item.id}`);
  };

  const handleCloseUploadMedia = () => {
    setOpenUploadMedia(false);
  };
  return (
    <div>
      <div>
        <div>
          <div className="prq2">
            {/* Top bar */}
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ height: "40px", marginBottom: "32px" }}
            >
              <Grid
                item
                xs={12}
                md={6}
                gap={4}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                }}
              >
                <Link to="vendor/new">
                  <Button
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
                </Link>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
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
                    sx={{ ml: 1, padding: "0 8px" }}
                  />
                </Box>
                <Box>
                  {/* IconButton to show modal (UploadMedia.jsx) to create products from excel file */}
                  <IconButton onClick={() => setOpenUploadMedia(true)}>
                    <img
                      src={UploadIcon}
                      alt="Upload"
                      title="Create Vendor via excelFile upload"
                    />
                  </IconButton>
                </Box>
              </Grid>

              {openUploadMedia && (
                <UploadMedia
                  endpoint="purchase/vendors/download-template/"
                  uploadfileEndpoint="/purchase/vendors/upload_excel/"
                  onClose={handleCloseUploadMedia}
                  // templateEndpoint="/purchase/download_excel_template/"
                />
              )}

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
                  <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
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
              </Grid>
            </Grid>

            {/* Drawer on small screen */}
            <Drawer
              anchor="right"
              open={openRight}
              onClose={toggleRightDrawer(false)}
            >
              <Box sx={{ p: 2, width: 250 }}>
                <p>Pagination</p>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <IconButton
                    sx={{
                      border: "1px solid #A9B3BC",
                      borderRadius: "4px 0 0 4px",
                    }}
                  >
                    <FaCaretLeft style={{ color: "#A9B3BC" }} />
                  </IconButton>
                  <IconButton
                    sx={{
                      border: "1px solid #A9B3BC",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <FaCaretRight style={{ color: "#A9B3BC" }} />
                  </IconButton>
                </Box>
              </Box>
            </Drawer>

            {/* Main content */}
            <div className="prq4">
              {viewMode === "grid" ? (
                data.map((item) => (
                  <div
                    className="vr4gv"
                    key={item.id}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="vendor-image">
                      <img
                        src={`data:image/png;base64,${item.profile_picture}`}
                        alt="Vendor"
                        className="circular-image"
                      />
                    </div>
                    <p className="vendor-name">{item.company_name}</p>
                    <p className="vendor-email">{item.email}</p>
                    <p className="vendor-phone">{item.phone_number}</p>
                    <p className="vendor-address">{item.address}</p>
                  </div>
                ))
              ) : (
                <Listview
                  items={data}
                  onItemClick={handleCardClick}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
