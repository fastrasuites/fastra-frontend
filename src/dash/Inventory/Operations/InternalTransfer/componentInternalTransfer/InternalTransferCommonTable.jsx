// InternalTransferCommonTable.jsx
import React from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { Link, useHistory } from "react-router-dom";
import Can from "../../../../../components/Access/Can";
import Highlighter from "react-highlight-words";

const InternalTransferCommonTable = ({
  columns = [],
  rows = [],
  rowKey = "id",
  gridRenderItem,
  selectable = false,
  selectedRows = [],
  onSelectAll,
  onRowSelect,
  searchable = false,
  searchQuery = "",
  onSearchChange,
  paginated = false,
  page = 1,
  rowsPerPage = 10,
  onPageChange,
  viewModes = ["list"],
  viewMode = "list",
  onViewModeChange,
  actionButton,
  path = "",
  disableClick,
  isLoading,
}) => {
  const history = useHistory();

  const totalPages = paginated ? Math.ceil(rows.length / rowsPerPage) : 1;
  const pagedRows = paginated
    ? rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    : rows;

  const allSelected = selectedRows.length === rows.length && rows.length > 0;
  const showPagination = paginated && rows.length > 0;
  const showViewToggles = viewModes.length > 1;

  const handleRowClick = (row, event) => {
    if (event.target.closest('input[type="checkbox"]')) return;
    const id = row[rowKey] || row.id;
    history.push(`${path}/${id}`);
  };

  const renderListSkeleton = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={`skeleton-${idx}`}>
        {columns.map((col) => (
          <TableCell key={col.id}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const renderGridSkeleton = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Box
        key={`grid-skeleton-${idx}`}
        sx={{
          p: 3,
          border: "1.2px solid #E2E6E9",
          borderRadius: 2,
          mb: 2,
          backgroundColor: "#fffffd",
        }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={150} />
        <Skeleton variant="text" width={150} />
        <Skeleton variant="text" width={120} />
        <Skeleton variant="circular" width={8} height={8} />
      </Box>
    ));
  };

  const noDataMessage = (
    <Box display="flex" justifyContent="center" p={4}>
      <Typography variant="body1" color="textSecondary">
        No internal transfers found.
      </Typography>
    </Box>
  );

  return (
    <Box>
      {/* Toolbar */}
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          {actionButton && (
            <Can
              app={actionButton.app}
              module={actionButton.module}
              action={actionButton.action}
            >
              <Button
                variant="contained"
                component={actionButton.link ? Link : Button}
                to={actionButton.link}
                onClick={actionButton.onClick}
              >
                {actionButton.text}
              </Button>
            </Can>
          )}
          {searchable && (
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 240 }}
            />
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {showPagination && (
            <Typography variant="body2">
              Page {page} of {totalPages}
            </Typography>
          )}
          <Box display="flex" alignItems="center" gap={1}>
            {showPagination && (
              <Box border="1px solid #E2E6E9" borderRadius={1}>
                <IconButton
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page <= 1}
                >
                  <FaCaretLeft />
                </IconButton>
                <IconButton
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page >= totalPages}
                >
                  <FaCaretRight />
                </IconButton>
              </Box>
            )}
            {showViewToggles && (
              <Box border="1px solid #E2E6E9" borderRadius={1}>
                {viewModes.includes("grid") && (
                  <IconButton
                    onClick={() => onViewModeChange?.("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                  >
                    <IoGrid />
                  </IconButton>
                )}
                {viewModes.includes("list") && (
                  <IconButton
                    onClick={() => onViewModeChange?.("list")}
                    color={viewMode === "list" ? "primary" : "default"}
                  >
                    <FaBars />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={200}
        >
          <CircularProgress />
        </Box>
      ) : pagedRows.length === 0 ? (
        noDataMessage
      ) : viewMode === "list" ? (
        /* Table View */
        <TableContainer component={Paper} elevation={0}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#ffffff" }}>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && selectedRows.length > 0}
                      onChange={onSelectAll}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ fontWeight: 500, color: "#7A8A98" }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.map((row, index) => (
                <TableRow
                  key={row[rowKey]}
                  hover
                  onClick={(e) => !disableClick && handleRowClick(row, e)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      index % 2 === 0 ? "rgba(246, 244, 244, 1)" : "#ffffff",
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(row[rowKey])}
                        onChange={() => onRowSelect?.(row[rowKey])}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.id} sx={{ color: "#7A8A98" }}>
                      {col.render ? (
                        col.render(row)
                      ) : (
                        <Highlighter
                          highlightClassName="highlight"
                          searchWords={[searchQuery]}
                          autoEscape={true}
                          textToHighlight={String(row[col.id] || "")}
                          highlightStyle={{
                            backgroundColor: "#ffff00",
                            padding: 0,
                          }}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* Grid View */
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(auto-fill, minmax(250px, 1fr))",
              sm: "repeat(auto-fill, minmax(300px, 1fr))",
            },
            gap: 2,
          }}
        >
          {pagedRows.map((row) => gridRenderItem?.(row))}
        </Box>
      )}
    </Box>
  );
};

export default InternalTransferCommonTable;

////-----------------------------------------------
// import React from "react";
// import {
//   Box,
//   Button,
//   Checkbox,
//   IconButton,
//   InputAdornment,
//   Paper,
//   Skeleton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from "@mui/material";
// import { Search } from "@mui/icons-material";
// import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
// import { IoGrid } from "react-icons/io5";
// import { Link, useHistory } from "react-router-dom";
// import Can from "../../../../../components/Access/Can";

// const InternalTransferCommonTable = ({
//   // Data & Configuration
//   columns = [],
//   rows = [],
//   rowKey = "id",
//   gridRenderItem,

//   // Selection
//   selectable = false,
//   selectedRows = [],
//   onSelectAll,
//   onRowSelect,

//   // Search
//   searchable = false,
//   searchQuery = "",
//   onSearchChange,

//   // Pagination
//   paginated = false,
//   page = 1,
//   rowsPerPage = 10,
//   onPageChange,

//   // View Mode
//   viewModes = ["list"],
//   viewMode = "list",
//   onViewModeChange,

//   // Actions
//   actionButton,

//   path = "",
//   disableClick,
//   isLoading,
// }) => {
//   // const showPagination = paginated && rows.length > 0;
//   // const showViewToggles = viewModes.length > 1;
//   // const allSelected = selectedRows.length === rows.length && rows.length > 0;
//   const history = useHistory();

//   const totalPages = paginated ? Math.ceil(rows.length / rowsPerPage) : 1;
//   const pagedRows = paginated
//     ? rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)
//     : rows;

//   const allSelected = selectedRows.length === rows.length && rows.length > 0;
//   const showPagination = paginated && rows.length > 0;
//   const showViewToggles = viewModes.length > 1;

//   const handleRowClick = (row, event, path) => {
//     // Prevent navigation if clicking selectable elements
//     if (event.target.closest('input[type="checkbox"]')) return;
//     const id = row[rowKey] || row.id;
//     history.push(`${path}/${id}`);
//   };

//   const renderListSkeleton = () => {
//     return Array.from({ length: 5 }).map((_, idx) => (
//       <TableRow key={`skeleton-${idx}`}>
//         {columns.map((col) => (
//           <TableCell key={col.id}>
//             <Skeleton variant="text" width="80%" />
//           </TableCell>
//         ))}
//         <TableCell>
//           <Skeleton variant="text" width="80%" />
//         </TableCell>
//       </TableRow>
//     ));
//   };
//   return (
//     <Box>
//       {/* Toolbar */}
//       <Box display="flex" flexWrap="wrap" justifyContent="space-between" mb={2}>
//         <Box display="flex" alignItems="center" gap={2}>
//           {actionButton && (
//             <Can
//               app={actionButton.app}
//               module={actionButton.module}
//               action={actionButton.action}
//             >
//               <Button
//                 variant="contained"
//                 component={actionButton.link ? Link : Button}
//                 to={actionButton.link}
//                 onClick={actionButton.onClick}
//               >
//                 {actionButton.text}
//               </Button>
//             </Can>
//           )}
//           {searchable && (
//             <TextField
//               size="small"
//               placeholder="Search"
//               value={searchQuery}
//               onChange={(e) => onSearchChange?.(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Search />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={{ minWidth: 240 }}
//             />
//           )}
//         </Box>
//         <Box display="flex" alignItems="center" gap={2}>
//           {showPagination && (
//             <Typography variant="body2">
//               Page {page} of {totalPages}
//             </Typography>
//           )}
//           <Box display="flex" alignItems="center" gap={1}>
//             {showPagination && (
//               <Box border="1px solid #E2E6E9" borderRadius={1}>
//                 <IconButton
//                   onClick={() => onPageChange?.(page - 1)}
//                   disabled={page <= 1}
//                 >
//                   <FaCaretLeft />
//                 </IconButton>
//                 <IconButton
//                   onClick={() => onPageChange?.(page + 1)}
//                   disabled={page >= totalPages}
//                 >
//                   <FaCaretRight />
//                 </IconButton>
//               </Box>
//             )}
//             {showViewToggles && (
//               <Box border="1px solid #E2E6E9" borderRadius={1}>
//                 {viewModes.includes("grid") && (
//                   <IconButton
//                     onClick={() => onViewModeChange?.("grid")}
//                     color={viewMode === "grid" ? "primary" : "default"}
//                   >
//                     <IoGrid />
//                   </IconButton>
//                 )}
//                 {viewModes.includes("list") && (
//                   <IconButton
//                     onClick={() => onViewModeChange?.("list")}
//                     color={viewMode === "list" ? "primary" : "default"}
//                   >
//                     <FaBars />
//                   </IconButton>
//                 )}
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </Box>

//       {/* Table or Grid */}
//       {viewMode === "list" ? (
//         <TableContainer component={Paper} elevation={0}>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {selectable && (
//                   <TableCell padding="checkbox">
//                     <Checkbox
//                       checked={allSelected}
//                       indeterminate={!allSelected && selectedRows.length > 0}
//                       onChange={onSelectAll}
//                     />
//                   </TableCell>
//                 )}
//                 {columns.map((col) => (
//                   <TableCell
//                     key={col.id}
//                     sx={{ fontWeight: 500, color: "#7A8A98" }}
//                   >
//                     {col.label}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {isLoading
//                 ? renderListSkeleton()
//                 : pagedRows.map((row) => (
//                     <TableRow
//                       key={row[rowKey]}
//                       hover
//                       onClick={(e) =>
//                         !disableClick && handleRowClick(row, e, path)
//                       }
//                     >
//                       {selectable && (
//                         <TableCell padding="checkbox">
//                           <Checkbox
//                             checked={selectedRows.includes(row[rowKey])}
//                             onChange={() => onRowSelect?.(row[rowKey])}
//                           />
//                         </TableCell>
//                       )}
//                       {columns.map((col) => (
//                         <TableCell key={col.id} sx={{ color: "#7A8A98" }}>
//                           {col.render ? col.render(row) : row[col.id]}
//                         </TableCell>
//                       ))}
//                     </TableRow>
//                   ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       ) : (
//         <Box
//           display="grid"
//           gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
//           gap={2}
//         >
//           {pagedRows.map((row) => gridRenderItem?.(row))}
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default InternalTransferCommonTable;
