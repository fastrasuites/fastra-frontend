import React, { useEffect, useState } from "react";
// import { useRFQ } from "../../../context/RequestForQuotation";
import "./RfqStatus.css";
import SearchIcon from "../../../image/search.svg";
import PurchaseHeader from "../PurchaseHeader";
import RfqStatusModal from "./RfqStatusModal";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import RfqGrid from "./RfqGrid";
import RListView from "./RListView";
import { quotations as allquotations } from "../../../data/quotations";

const RfqStatus = ({
  selectedStatus,
  formatDate,
  statusColor,
  handleNewRfq,
}) => {
  const [quotations, setQuotations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState("list");

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

  //   useEffect(() => {
  //     if (quotationsUrl && quotationsUrl.length) {
  //       // Assuming quotationsUrl is an array of IDs
  //       Promise.all(quotationsUrl.map((id) => getRFQById(id)))
  //         .then((data) => {
  //           // Update state with fetched quotation objects
  //           setQuotations(data);
  //         })
  //         .catch((err) => {
  //           console.error("Error fetching quotations:", err);
  //         });
  //     }
  //   }, [quotationsUrl, getRFQById]);

  //   if (isLoading) {
  //     return <div>Loading quotations...</div>;
  //   }

  //   if (error) {
  //     return <div>Error: {error.message || error.toString()}</div>;
  //   }

  useEffect(() => {
    if (selectedStatus[0] && selectedStatus[0].length) {
      setQuotations(() =>
        allquotations.filter((item) => item.status === selectedStatus[1])
      );
    }
  }, [selectedStatus]);

  // const getQuotationsByUrl = allquotations.filter(
  //   (item) => item.status === selectedStatus[1]
  // );

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="rfqStatus">
      <PurchaseHeader />
      <div className="rfqHeader">
        <div className="rfqHeaderContent">
          <h2 className="rfqHeaderTitle">{selectedStatus[1]}</h2>
          <div className="rfqsash">
            <label htmlFor="searchInput" className="search-box">
              <img src={SearchIcon} alt="Search" className="search-icon" />
              <input
                id="searchInput"
                type="text"
                placeholder="Search..."
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </label>
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
        <RfqGrid
          quotations={quotations}
          handleClick={handleClick}
          formatDate={formatDate}
          statusColor={statusColor}
        />
      ) : (
        <div className="rfqStatusList">
          <RListView
            items={quotations}
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
            handleNewRfq={handleNewRfq}
            onEdit={handleEdit}
          />
        </div>
      )}
    </div>
  );
};

export default RfqStatus;
