// CurrencyPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  IconButton,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { usePurchase } from "../../context/PurchaseContext";

const CurrencyPage = () => {
  const {
    currencies,
    totalCount,
    page,
    pageSize,
    fetchCurrencies,
    fetchPage,
    updateCurrency,
    loadingCurrencies,
    savingCurrencyId,
    deletingCurrencyId,
    softDeleteCurrency,
  } = usePurchase();

  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({
    currency_name: "",
    currency_code: "",
    currency_symbol: "",
    is_hidden: false,
  });

  useEffect(() => {
    // initial load: use default page & pageSize from context
    fetchCurrencies({ page: page ?? 1, page_size: pageSize ?? 10 }).catch((e) =>
      console.error(e)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditingValues({
      currency_name: row.currency_name ?? "",
      currency_code: row.currency_code ?? "",
      currency_symbol: row.currency_symbol ?? "",
      is_hidden: !!row.is_hidden,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues({
      currency_name: "",
      currency_code: "",
      currency_symbol: "",
      is_hidden: false,
    });
  };

  const save = async (id) => {
    try {
      if (
        !editingValues.currency_name.trim() ||
        !editingValues.currency_symbol.trim()
      ) {
        // simple client-side guard: you can replace with nicer validation/UI
        alert("Please provide name and symbol");
        return;
      }

      await updateCurrency(id, {
        currency_name: editingValues.currency_name,
        currency_code: editingValues.currency_code,
        currency_symbol: editingValues.currency_symbol,
        is_hidden: !!editingValues.is_hidden,
      });

      setEditingId(null);
    } catch (err) {
      console.error("Failed to update", err);
      alert("Failed to save changes");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this currency?"))
      return;
    try {
      await softDeleteCurrency(id); // removes from list by default
    } catch (err) {
      console.error("Soft delete failed", err);
      alert("Failed to delete currency");
    }
  };

  // Pagination helpers
  const firstItemIndex = totalCount ? (page - 1) * pageSize + 1 : 1;
  const lastItemIndex = totalCount
    ? Math.min(page * pageSize, totalCount)
    : currencies.length;
  const displayTotal = totalCount ?? currencies.length;

  const goPrev = () => {
    if (page > 1) fetchPage(page - 1).catch((e) => console.error(e));
  };

  const goNext = () => {
    // If totalCount exists, check bounds
    if (totalCount && page * pageSize >= totalCount) return;
    fetchPage(page + 1).catch((e) => console.error(e));
  };

  return (
    <Box p={4} mr={4}>
      {/* Top header: left = header + back arrow, right = pagination info */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" sx={{ fontSize: "24px" }}>
            Configuration
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center">
          <Paper elevation={0} sx={{ px: 2, py: 0.5, borderRadius: 2 }}>
            <Typography variant="body2">
              {`${firstItemIndex}-${lastItemIndex} of ${displayTotal}`}
            </Typography>
          </Paper>

          <IconButton
            size="medium"
            onClick={goPrev}
            disabled={page <= 1 || loadingCurrencies}
            sx={{
              bgcolor: "white",
              border: "1px solid #ddd8d8ff",
              borderStartStartRadius: "8px",
              borderStartEndRadius: "0",
              borderEndStartRadius: "8px",
              borderEndEndRadius: "0",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            size="medium"
            onClick={goNext}
            disabled={
              loadingCurrencies ||
              (totalCount
                ? page * pageSize >= totalCount
                : currencies.length < pageSize)
            }
            sx={{
              bgcolor: "white",
              border: "1px solid #ddd8d8ff",
              borderEndEndRadius: "8px",
              borderStartEndRadius: "8px",
              borderEndStartRadius: "0",
              borderStartStartRadius: "0",
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* List container */}
      <TableContainer
        sx={{
          bgcolor: "white",
          p: 2,
          border: "1px solid #d8d8d9ff",
          borderRadius: "10px",
        }}
      >
        {/* Inner header with back arrow and title inside the list */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={() => {
                window.history.back();
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="subtitle1" color={"#3B7CED"} fontSize={"18px"}>
              Currency List
            </Typography>
          </Stack>
          <Box>{/* could place additional controls here */}</Box>
        </Box>

        <Box
          sx={{
            bgcolor: "white",
            border: "1px solid #d8d8d9ff",
            borderRadius: "10px",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "22%", p: 4 }}>Currency Name</TableCell>
                <TableCell sx={{ width: "22%" }}>Code</TableCell>
                <TableCell sx={{ width: "22%" }}>Symbol</TableCell>
                <TableCell sx={{ width: "34%" }}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currencies.map((row, idx) => {
                const isEditing = editingId === row.id;
                const bg = idx % 2 === 1 ? "white" : "rgba(0,0,0,0.03)"; // white & light gray
                return (
                  <TableRow key={row.id} sx={{ backgroundColor: bg }}>
                    <TableCell sx={{ p: 3 }}>
                      {isEditing ? (
                        <TextField
                          variant="standard"
                          value={editingValues.currency_name}
                          onChange={(e) =>
                            setEditingValues((p) => ({
                              ...p,
                              currency_name: e.target.value,
                            }))
                          }
                          fullWidth
                          InputProps={{ disableUnderline: false }}
                          size="large"
                        />
                      ) : (
                        <Typography>{row.currency_name}</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <TextField
                          variant="standard"
                          value={editingValues.currency_code}
                          onChange={(e) =>
                            setEditingValues((p) => ({
                              ...p,
                              currency_code: e.target.value,
                            }))
                          }
                          size="large"
                        />
                      ) : (
                        <Typography>{row.currency_code ?? "-"}</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <TextField
                          variant="standard"
                          value={editingValues.currency_symbol}
                          onChange={(e) =>
                            setEditingValues((p) => ({
                              ...p,
                              currency_symbol: e.target.value,
                            }))
                          }
                          size="large"
                        />
                      ) : (
                        <Typography>{row.currency_symbol}</Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => save(row.id)}
                            disabled={savingCurrencyId === row.id}
                          >
                            Save
                          </Button>

                          <IconButton
                            size="large"
                            onClick={cancelEdit}
                            aria-label="Cancel edit"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => startEdit(row)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="text"
                            size="Large"
                            color="primary"
                            onClick={() => handleSoftDelete(row.id)}
                            disabled={deletingCurrencyId === row.id}
                          >
                            Delete
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      {/* optional small helper text */}
      <Box mt={1}>
        <Typography variant="caption" color="text.secondary">
          Tip: Click <strong>Edit</strong> to convert row to editable inputs.
          Click <strong>Save</strong> to persist changes.
        </Typography>
      </Box>
    </Box>
  );
};

export default CurrencyPage;
