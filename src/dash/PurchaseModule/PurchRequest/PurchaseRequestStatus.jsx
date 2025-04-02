import React, { useEffect, useState } from "react";
// import { useRFQ } from "../../../context/RequestForQuotation";
import "../Rfq/RfqStatus.css";
import SearchIcon from "../../../image/search.svg";
import PurchaseHeader from "../PurchaseHeader";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import { Button } from "@mui/material";
import { extractRFQID } from "../../../helper/helper";
import { Search } from "lucide-react";
import PurchaseRequestModule from "./PurchaseRequestModule";
import PurchaseRequestGrid from "./PurchaseRequestGrid";
import ListView from "./Listview";

const PurchaseRequestStatus = ({
  selectedStatus,
  formatDate,
  statusColor,
  onCancel,
  // handleNewRfq,
  quotationsData,
}) => {

    console.log(selectedStatus)
  const [quotations, setQuotations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");

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

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="rfqStatus">
      <div className="rfqStatusCancel">
        <Button variant="outlined" className="cancel" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className="rfqHeader">
        <div className="rfqHeaderContent">
          <h2 className="rfqHeaderTitle">{selectedStatus[1]}</h2>
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
          <p className="r3bpage">1-2 of 2</p>
          <div className="r3bnav">
            <FaCaretLeft className="lr" />
            <div className="stroke"></div>
            <FaCaretRight className="lr" />
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
        <PurchaseRequestGrid
          quotations={filteredQuotations}
          handleClick={handleClick}
          formatDate={formatDate}
          statusColor={statusColor}
        />
      ) : (
        <div className="rfqStatusList">
          <ListView
            items={filteredQuotations}
            onCardClick={handleClick}
            getStatusColor={statusColor}
          />
        </div>
      )}

      {selectedItem && (
        <div className="rfqStatusModal overlay">
          <PurchaseRequestModule
            item={selectedItem}
            formatDate={formatDate}
            statusColor={statusColor}
            onCancel={handleCancel}
            // handleNewRfq={handleNewRfq}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestStatus;
