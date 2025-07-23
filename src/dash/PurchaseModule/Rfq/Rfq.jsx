import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useHistory } from "react-router-dom";
import "./Rfq.css";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { Search } from "lucide-react";
import { Button } from "@mui/material";
import { toast } from "react-toastify";

import RListView from "./RListView";
import Can from "../../../components/Access/Can";
import { useRFQ } from "../../../context/RequestForQuotation";
import { useTenant } from "../../../context/TenantContext";
import { extractRFQID, formatDate } from "../../../helper/helper";

// Status icons
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import Swal from "sweetalert2";

export default function Rfq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotationsData, setQuotationsData] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const itemsPerPage = 10;
  const totalPages = Math.ceil(quotationsData.length / itemsPerPage);

  const history = useHistory();
  const { getRFQList, deleteRFQ } = useRFQ();
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;

  // Fetch from localStorage initially
  useEffect(() => {
    const saved = localStorage.getItem("quotationsData");
    if (saved && saved !== "undefined") {
      try {
        setQuotationsData(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing quotationsData:", err);
      }
    }
  }, []);

  // Fetch RFQ List
  const fetchRFQs = useCallback(async () => {
    try {
      const { success, data } = await getRFQList(searchQuery);
      if (success) {
        setQuotationsData(data);
        localStorage.setItem("quotationsData", JSON.stringify(data));
      }

      if (searchQuery && (!data || data.length === 0)) {
        Swal.fire({
          icon: "info",
          title: "No results found",
          text: "Try a different search term.",
        });
      }
    } catch {
      toast.error("Failed to load RFQs.");
    }
  }, [getRFQList, searchQuery]);

  // Fetch on mount & refresh
  useEffect(() => {
    const debounce = setTimeout(fetchRFQs, 500);

    return () => clearTimeout(debounce);
  }, [fetchRFQs, searchQuery]);

  // Reset page on search
  useEffect(() => setPage(1), [searchQuery]);

  const paginatedRFQs = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return quotationsData.slice(start, start + itemsPerPage);
  }, [page, quotationsData]);

  const groupedByStatus = useMemo(() => {
    return quotationsData.reduce((acc, rfq) => {
      const { status, url } = rfq;
      acc[status] = acc[status] ? [...acc[status], url] : [url];
      return acc;
    }, {});
  }, [quotationsData]);

  const handleViewChange = (mode) => setViewMode(mode);
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  const handleDeleteSelected = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteRFQ(extractRFQID(id))));
      fetchRFQs();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSelectRFQ = (id) => {
    history.push(`/${tenantSchema}/purchase/request-for-quotations/${id}`);
  };

  const handleStatusClick = (urls, status) => {
    history.push({
      pathname: `/${tenantSchema}/purchase/request-for-quotations/status/${status}`,
      state: { urlList: urls, status, quotationsData },
    });
  };

  const getStatusColor = (status) => {
    const base = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      {
        Approved: "#2ba24c",
        Pending: "#f0b501",
        Rejected: "#e43e2b",
      }[base] || "#3B7CED"
    );
  };

  const statuses = [
    { key: "draft", label: "Draft", img: draft },
    { key: "approved", label: "Approved", img: approved },
    { key: "pending", label: "Pending", img: pending },
    { key: "rejected", label: "Rejected", img: rejected },
  ];

  return (
    <div className="rfq">
      <div className="rfq1">
        <div className="rfq2">
          <p className="rfq-title">RFQs</p>

          <div className="rfq-status">
            {statuses.map(({ key, label, img }) => {
              const count = groupedByStatus[key]?.length || 0;
              return (
                <div
                  key={key}
                  className={`status-field rfq-${key}`}
                  onClick={() => handleStatusClick(groupedByStatus[key], key)}
                >
                  <img src={img} alt={label} className="status-img" />
                  <p className={`plnum ${count === 0 ? "zero" : ""}`}>
                    {count}
                  </p>
                  <p className="status-desc">Request for Quote</p>
                  <p className="status-label">{label}</p>
                </div>
              );
            })}
          </div>

          <div className="rfq3">
            <div className="r3a">
              <Link to={`/${tenantSchema}/purchase/request-for-quotations/new`}>
                <Can
                  app="purchase"
                  module="requestforquotation"
                  action="create"
                >
                  <Button variant="contained" disableElevation>
                    New RFQ
                  </Button>
                </Can>
              </Link>
              <div className="rfqsash">
                <Search
                  className="rfqsearch-icon"
                  style={{ color: "#C6CCD2" }}
                />
                <input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="searchInput"
                />
              </div>
            </div>

            <div className="r3b">
              <p className="r3bpage">
                {page} of {totalPages}
              </p>
              <div className="r3bnav">
                <FaCaretLeft
                  onClick={() => handlePageChange(page - 1)}
                  className="lr"
                />
                <div className="stroke" />
                <FaCaretRight
                  onClick={() => handlePageChange(page + 1)}
                  className="lr"
                />
              </div>
              <div className="r3bview">
                <IoGrid
                  onClick={() => handleViewChange("grid")}
                  className={`toggle ${viewMode === "grid" ? "active" : ""}`}
                />
                <div className="stroke" />
                <FaBars
                  onClick={() => handleViewChange("list")}
                  className={`toggle ${viewMode === "list" ? "active" : ""}`}
                />
              </div>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="rfqStatusCards">
              {paginatedRFQs.map((item) => (
                <div
                  key={item.id}
                  className="rfqStatusCard"
                  onClick={() => handleSelectRFQ(item.id)}
                >
                  <p className="cardid">{extractRFQID(item.url)}</p>
                  <p className="cardate">{formatDate(item.expiry_date)}</p>
                  <p className="vendname">
                    {item.vendor_details?.company_name}
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
            <div className="rfq5">
              <RListView
                items={paginatedRFQs}
                onCardClick={handleSelectRFQ}
                getStatusColor={getStatusColor}
                onDeleteSelected={handleDeleteSelected}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
