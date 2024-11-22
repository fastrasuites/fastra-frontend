import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { stockMoveData } from "/stockMoveData";

const StockMove = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(stockMoveData);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = stockMoveData.filter((item) =>
      item.productName.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  return (
    <Box p={4}>
      <Typography variant="h5" mb={2}>
        Stock Move
      </Typography>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
        />
        <Box display="flex" alignItems="center">
          <IconButton>
            <FilterListIcon />
          </IconButton>
          <Typography variant="body2" ml={1}>
            Filter
          </Typography>
        </Box>
      </Box>
      <Divider />
      <stockMoveData data={filteredData} />
    </Box>
  );
};

export default StockMove;
