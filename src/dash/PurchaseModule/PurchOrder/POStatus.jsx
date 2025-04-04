import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../Rfq/RfqStatus.css";
import PurchaseHeader from "../PurchaseHeader";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import { Button } from "@mui/material";
import { Search } from "lucide-react";
import POStatusModal from "./POStatusModal";
import POGrid from "./POGrid";
import Orderlistview from "./Orderlistview";

const POStatus = ({
  selectedStatus,
  formatDate,
  statusColor,
  onCancel,
  triggerRefresh,
  purchaseOrderData,
}) => {
  const [purchaseOrder, setPurchaseOrder] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;

  // const { error, isLoading, singerRFQ, getRFQById } = useRFQ();

  const handleClick = (item) => {
    setSelectedItem(item);
  };

  const handleCancel = () => {
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
  };

  useEffect(() => {
    if (selectedStatus[0] && selectedStatus[0].length) {
      setPurchaseOrder(() =>{

        const statusMap = {
            rejected: 'cancelled',
            pending: 'awaiting',
            approved: 'completed',
            draft: 'draft'
          };
        const status = statusMap[selectedStatus[1].toLowerCase()];
        console.log(status);
        return purchaseOrderData.filter((item) => item.status === status)
      }
        
      );
    }
  }, [selectedStatus]);


  // Filter purchase orders based on search query
  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrder.filter((item) => {
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
  }, [searchQuery, purchaseOrder]);

  const totalPages = Math.ceil(filteredPurchaseOrders.length / itemsPerPage);


  const paginatedPurchaseOrders = useMemo(() => {
    return filteredPurchaseOrders.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [page, itemsPerPage, filteredPurchaseOrders]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );


  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="rfqStatus">
      <PurchaseHeader />
      <div className="rfqStatusCancel">
        <Button variant="outlined" className="cancel" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="rfqHeader">
        <div className="rfqHeaderContent">
          <h2 className="rfqHeaderTitle">{selectedStatus[1]}</h2>
          <div className="rfqsash">
            <Search style={{ color: "#C6CCD2" }} className="rfqsearch-icon" />
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
      {viewMode === "grid" ? (
        <POGrid
          purchaseOrders={paginatedPurchaseOrders}
          handleClick={handleClick}
          formatDate={formatDate}
          statusColor={statusColor}
        />
      ) : (
        <div className="rfqStatusList">
          <Orderlistview
            items={paginatedPurchaseOrders}
            onCardClick={handleClick}
            getStatusColor={statusColor}
          />
        </div>
      )}

      {selectedItem && (
        <div className="rfqStatusModal overlay">
          <POStatusModal
            item={selectedItem}
            formatDate={formatDate}
            statusColor={statusColor}
            onCancel={handleCancel}
            triggerRefresh={triggerRefresh}
            // handleNewRfq={handleNewRfq}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
};

export default POStatus;
