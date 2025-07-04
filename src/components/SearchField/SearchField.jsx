import { InputAdornment, TextField } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/system";
import { Search } from "lucide-react";

export const SearchField = ({ onSearch, placeholder = "Search" }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
      fullWidth={isXs}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search size={16} />
          </InputAdornment>
        ),
      }}
      sx={{ width: { xs: "100%", sm: 200, md: 280, lg: 320 } }}
    />
  );
};
