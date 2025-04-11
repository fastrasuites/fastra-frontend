import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Grid,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

const StatusIndicator = ({ status }) => {
  const statusColor = getStatusColor(status);
  return (
    <Box display="flex" alignItems="center">
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: statusColor,
          marginRight: 1,
        }}
      />
      <Typography variant="body2" style={{ color: statusColor }}>
        {status}
      </Typography>
    </Box>
  );
};

const ListView = ({
  data,
  columns,
  selected,
  onSelect,
  onSelectAll,
  onItemClick,
}) => (
  <TableContainer component={Paper}>
    <Table stickyHeader aria-label="product list">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selected.length === data.length && data.length > 0}
              indeterminate={
                selected.length > 0 && selected.length < data.length
              }
              onChange={onSelectAll}
              color="primary"
            />
          </TableCell>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              style={{ color: "#7A8A98", fontSize: "14px" }}
            >
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((item, index) => (
          <TableRow
            key={item.requestId}
            hover
            onClick={() => onItemClick(item)}
            style={{
              backgroundColor: index % 2 === 1 ? "#FFFFFF" : "#F2F2F2",
              cursor: "pointer",
            }}
          >
            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selected.includes(item.requestId)}
                onChange={() => onSelect(item.requestId)}
                color="primary"
              />
            </TableCell>
            {columns.map((column) => (
              <TableCell key={`${item.requestId}-${column.key}`}>
                {column.key === "status" ? (
                  <StatusIndicator status={item[column.key]} />
                ) : (
                  item[column.key]
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const GridView = ({ data, selected, onSelect, onItemClick }) => (
  <Grid container spacing={2} sx={{ p: 2 }}>
    {data.map((item) => (
      <Grid item key={item.requestId} xs={12} sm={6} md={4} lg={3}>
        <Paper
          sx={{
            p: 2,
            cursor: "pointer",
            backgroundColor: selected.includes(item.requestId)
              ? "#e3f2fd"
              : "background.paper",
            position: "relative",
          }}
          onClick={() => onItemClick(item)}
        >
          <Checkbox
            checked={selected.includes(item.requestId)}
            onChange={() => onSelect(item.requestId)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          />
          <Box mb={1}>
            {/* <Typography variant="subtitle2">Request ID</Typography> */}
            <Typography variant="body2">{item.requestId}</Typography>
          </Box>
          <Box mb={1}>
            {/* <Typography variant="subtitle2">Partner</Typography> */}
            <Typography variant="body2">{item.dateCreated}</Typography>
          </Box>
          <Box mb={1}>
            {/* <Typography variant="subtitle2">Partner</Typography> */}
            <Typography variant="body2">{item.sourceLocation}</Typography>
          </Box>
          <Box mb={1}>
            {/* <Typography variant="subtitle2">Partner</Typography> */}
            <Typography variant="body2">{item.partner}</Typography>
          </Box>
          <Box mb={1}>
            {/* <Typography variant="subtitle2">Status</Typography> */}
            <StatusIndicator status={item.status} />
          </Box>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

const ProductsView = ({
  viewMode,
  data,
  loading,
  error,
  selected,
  onSelect,
  onSelectAll,
  onItemClick,
}) => {
  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error)
    return (
      <Typography color="error" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  if (!data.length)
    return <Typography sx={{ mt: 4 }}>No products found</Typography>;

  return viewMode === "list" ? (
    <ListView
      data={data}
      columns={defaultColumns}
      selected={selected}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onItemClick={onItemClick}
    />
  ) : (
    <GridView
      data={data}
      selected={selected}
      onSelect={onSelect}
      onItemClick={onItemClick}
    />
  );
};

const defaultColumns = [
  { key: "requestId", label: "Request ID" },
  { key: "partner", label: "Partner" },
  { key: "sourceLocation", label: "Source Location" },
  { key: "destinationLocation", label: "Destination Location" },
  { key: "dateCreated", label: "Date Created" },
  { key: "status", label: "Status" },
];

const getStatusColor = (status) => {
  const colors = {
    validate: "#2ba24c",
    validated: "#2ba24c",
    draft: "#158fec",
    drafted: "#158fec",
    cancelled: "#e43e2b",
    cancel: "#e43e2b",
  };
  return colors[status] || "#158fec";
};

export default ProductsView;
