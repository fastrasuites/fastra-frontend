import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useRFQ } from "../../../context/RequestForQuotation";
import "./RfqStatus.css";
import SearchIcon from "../../../image/search.svg";
import PurchaseHeader from "../PurchaseHeader";
import RfqStatusModal from "./RfqStatusModal";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import RfqGrid from "./RfqGrid";
import RListView from "./RListView";
import { Button } from "@mui/material";
import { extractRFQID } from "../../../helper/helper";
import { Search } from "lucide-react";

const RfqStatus = ({
  selectedStatus,
  formatDate,
  statusColor,
  onCancel,
  triggerRefresh,
  quotationsData,
}) => {
  const [quotations, setQuotations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;

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
      setQuotations(() =>
        quotationsData.filter((item) => item.status === selectedStatus[1])
      );
    }
  }, [selectedStatus]);

  const filteredQuotations = quotations.filter((item) => {
    if (!searchQuery) return true;
    const lowercasedQuery = searchQuery.toLowerCase();

    const price = item?.rfq_total_price?.toString().toLowerCase() || "";
    const expiryDate = formatDate(item.expiry_date).toLowerCase();
    const status = item?.status?.toLowerCase() || "";
    const currencyName = item?.currency?.company_name?.toLowerCase() || "";
    const purchaseID = extractRFQID(item.purchase_request)?.toLowerCase() || "";
    const vendor =
      typeof item.vendor === "string" ? item.vendor.toLowerCase() : "";
    const vendorCategory = item.vendor_category?.toLowerCase() || "";
    return (
      price.includes(lowercasedQuery) ||
      expiryDate.includes(lowercasedQuery) ||
      status.includes(lowercasedQuery) ||
      currencyName.includes(lowercasedQuery) ||
      purchaseID.includes(lowercasedQuery) ||
      vendor.includes(lowercasedQuery) ||
      vendorCategory.includes(lowercasedQuery)
    );
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  const paginatedRequestsForQuotations = useMemo(() => {
    return filteredQuotations.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [page, itemsPerPage, filteredQuotations]);

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
        <RfqGrid
          quotations={paginatedRequestsForQuotations}
          handleClick={handleClick}
          formatDate={formatDate}
          statusColor={statusColor}
        />
      ) : (
        <div className="rfqStatusList">
          <RListView
            items={paginatedRequestsForQuotations}
            onCardClick={handleClick}
            getStatusColor={statusColor}
          />
        </div>
      )}

      {selectedItem && (
        <div className="rfqStatusModal overlay">
          <RfqStatusModal
            item={selectedItem}
            formatDate={formatDate}
            statusColor={statusColor}
            onCancel={handleCancel}
            triggerRefresh={triggerRefresh}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
};

export default RfqStatus;
