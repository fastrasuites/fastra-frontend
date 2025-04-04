import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { Search } from "lucide-react";
import { Button } from "@mui/material";
import PurchaseHeader from "../PurchaseHeader";
import POForm from "./POForm/POForm";
import POStatusModal from "./POStatusModal";
import Orderlistview from "./Orderlistview";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import "./PurchaseOrder.css";
import { usePurchaseOrder } from "../../../context/PurchaseOrderContext.";
import POStatus from "./POStatus";
import "./PurchaseOrder.css";
import { toast } from "react-toastify";
import { useForm } from "../../../context/FormContext";

export default function PurchaseOrder() {
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [purchaseOrderData, setPurchaseOrderData] = useState([]);
  const { isFormVisible, handleOpenForm, handleCloseForm } = useForm();
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  // New state for triggering a refresh from external updates
  const [refresh, setRefresh] = useState(false);

  const itemsPerPage = 10;
  const { getPurchaseOrderList } = usePurchaseOrder();

  // Load purchase orders from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("purchaseOrderData");
    if (savedData) {
      setPurchaseOrderData(JSON.parse(savedData));
    }
  }, []);

  // Fetch purchase orders when the refresh flag changes
  const fetchPurchaseOrders = useCallback(async () => {
    try {
      const { success, data } = await getPurchaseOrderList();
      if (success) {
        setPurchaseOrderData(data);
        localStorage.setItem("purchaseOrderData", JSON.stringify(data));
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to load purchase orders.");
    }
  }, [getPurchaseOrderList]);

  useEffect(() => {
    const toastId = "purchaseOrdersPromise";

    if (!toast.isActive(toastId)) {
      const purchaseOrdersPromise = fetchPurchaseOrders();
      toast.promise(
        purchaseOrdersPromise,
        {
          pending: "Loading purchase orders...",
          success: "Purchase orders loaded successfully",
          error: "Failed to load purchase orders.",
        },
        { toastId }
      );
    }
  }, [fetchPurchaseOrders, refresh]);

  // Reset to first page on search query change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Filter purchase orders based on search query
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrderData.filter((item) => {
      if (!searchQuery) return true;
      const lowercasedQuery = searchQuery.toLowerCase();

      const dateCreated = new Date(item.date_created)
        .toLocaleString()
        .toLowerCase();
      const status = item.status ? item.status.toLowerCase() : "";
      const currencyName = item.currency_name
        ? item.currency_name.toLowerCase()
        : "";
      const purchaseOrderID =
        typeof item.id === "string" ? item.id.toLowerCase() : "";
      const vendorName =
        item.vendor && item.vendor.company_name
          ? item.vendor.company_name.toLowerCase()
          : "";

      return (
        dateCreated.includes(lowercasedQuery) ||
        status.includes(lowercasedQuery) ||
        currencyName.includes(lowercasedQuery) ||
        purchaseOrderID.includes(lowercasedQuery) ||
        vendorName.includes(lowercasedQuery)
      );
    });
  }, [searchQuery, purchaseOrderData]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPurchaseOrders.length / itemsPerPage);
  const paginatedPurchaseOrders = useMemo(() => {
    return filteredPurchaseOrders.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [page, itemsPerPage, filteredPurchaseOrders]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Return a color based on the status string
  const getStatusColor = useCallback((status) => {
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    switch (formattedStatus) {
      case "Completed":
        return "#2ba24c";
      case "Awaiting":
        return "#f0b501";
      case "Cancelled":
        return "#e43e2b";
      default:
        return "#3B7CED";
    }
  }, []);

  // Define status types for filtering and display
  const statuses = useMemo(
    () => [
      { key: "draft", label: "Draft", img: draft },
      { key: "approved", label: "Approved", img: approved },
      { key: "pending", label: "Pending", img: pending },
      { key: "rejected", label: "Rejected", img: rejected },
    ],
    []
  );
  // Group purchase orders by status for the header display
  const groupedByStatus = useMemo(() => {
    const statusMap = {
      cancelled: "rejected",
      awaiting: "pending",
      completed: "approved",
    };
    return purchaseOrderData.reduce((acc, order) => {
      const { status } = order;
      const newStatus = statusMap[status] || status; // Use the mapped status or default to the original
      if (!acc[newStatus]) {
        acc[newStatus] = [];
      }
      acc[newStatus].push(order.url);
      return acc;
    }, {});
  }, [purchaseOrderData]);

  // Event handlers
  const handleRfqStatusClick = useCallback((urlList, status) => {
    setSelectedStatus([urlList, status]);
  }, []);

  const toggleViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // const handleNewPurchaseOrder = useCallback(() => {
  //   setIsFormVisible(true);
  // }, []);

  const handleCardClick = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  // const handleFormClose = useCallback(() => {
  //   setIsFormVisible(false);
  // }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const handleEdit = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleStatusCancel = () => {
    setSelectedStatus(null);
  };

  // Trigger a refresh when an external update occurs
  const triggerRefresh = useCallback(() => {
    setRefresh((prev) => !prev);
  }, []);

  return (
    <div className="rfq" id="rfq">
      <PurchaseHeader />
      <div className="rfq1">
        <div className="rfq2">
          <p style={{ fontSize: "17px" }}>Purchase Orders</p>
          <div className="rfq-status">
            {statuses.map(({ key, label, img }) => {
              const count = groupedByStatus[key]?.length || 0;
              return (
                <div
                  className={`status-field rfq-${key}`}
                  key={key}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleRfqStatusClick(groupedByStatus[key], key)
                  }
                >
                  <img
                    src={img}
                    alt={label.toLowerCase()}
                    className="status-img"
                  />
                  <p className={`plnum ${count === 0 ? "zero" : ""}`}>
                    {count}
                  </p>
                  <p style={{ lineHeight: "1rem" }} className="status-desc">
                    Purchase Order
                  </p>
                  <p style={{ fontSize: "20px" }}>{label}</p>
                </div>
              );
            })}
          </div>

          <div className="rfq3">
            <div className="r3a">
              <Button
                variant="contained"
                disableElevation
                onClick={handleOpenForm}
                style={{ fontSize: "17px", whiteSpace: "nowrap" }}
              >
                New Purchase Order
              </Button>
              <div className="rfqsash">
                <Search
                  style={{ color: "#C6CCD2" }}
                  className="rfqsearch-icon"
                />
                <input
                  id="searchInput"
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="searchInput"
                />
              </div>
            </div>
            <div className="r3b">
              <p className="r3bpage" style={{ whiteSpace: "nowrap" }}>
                {page} of {totalPages}
              </p>
              <div className="r3bnav">
                <FaCaretLeft
                  className="lr"
                  onClick={() => handlePageChange(page - 1)}
                />
                <div className="stroke"></div>
                <FaCaretRight
                  className="lr"
                  onClick={() => handlePageChange(page + 1)}
                />
              </div>
              <div className="r3bview">
                <IoGrid
                  className={`toggle ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => toggleViewMode("grid")}
                />
                <div className="stroke"></div>
                <FaBars
                  className={`toggle ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => toggleViewMode("list")}
                />
              </div>
            </div>
          </div>
          {isFormVisible ? (
            <div className="overlay">
              <POForm
                open={isFormVisible}
                onCancel={handleCloseForm}
                purchaseOrder={{}}
                formUse={"New RFQ"}
                refresh={triggerRefresh}
              />
            </div>
          ) : selectedStatus ? (
            <div className="overlay">
              <POStatus
                selectedStatus={selectedStatus}
                getStatusColor={getStatusColor}
                statusColor={getStatusColor}
                formatDate={formatDate}
                onCancel={handleStatusCancel}
                purchaseOrderData={purchaseOrderData}
                triggerRefresh={triggerRefresh}
              />
            </div>
          ) : selectedItem ? (
            <div className="overlay">
              <POStatusModal
                item={selectedItem}
                formatDate={formatDate}
                statusColor={getStatusColor}
                onEdit={handleEdit}
                onCancel={handleCancel}
                triggerRefresh={triggerRefresh}
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="rfqStatusCards" style={{ marginTop: "20px" }}>
              {paginatedPurchaseOrders.map((item) => (
                <div
                  className="rfqStatusCard"
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <p className="cardid">{item.id}</p>
                  <p className="cardate">{formatDate(item.date_created)}</p>
                  <p className="vendname">
                    {item.vendor && item.vendor.company_name}
                  </p>
                  <p
                    className="status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <Orderlistview
              items={paginatedPurchaseOrders}
              onCardClick={handleCardClick}
              getStatusColor={getStatusColor}
              triggerRefresh={triggerRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
}
