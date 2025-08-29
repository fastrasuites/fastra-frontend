// UnitOfMeasurePage.jsx
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
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { usePurchase } from "../../context/PurchaseContext";

const emptyValues = {
  unit_name: "",
  unit_symbol: "",
  unit_category: "",
  is_hidden: false,
};

const emptyFieldErrors = {
  unit_name: null,
  unit_symbol: null,
  unit_category: null,
};

const UnitOfMeasurePage = () => {
  const {
    unitsOfMeasure = [],
    fetchUnits,
    updateUnit,
    loadingUnits,
    savingUnitId,
    deletingUnitId,
    softDeleteUnit,
  } = usePurchase();

  const [editingKey, setEditingKey] = useState(null);
  const [editingValues, setEditingValues] = useState(emptyValues);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);

  // stable row key helper
  const getRowKey = (row, idx) => row?.id ?? row?.url ?? `idx-${idx}`;

  // Attempt to get numeric id from row (id property or last numeric segment of url)
  const getIdFromRow = (row) => {
    if (!row) return null;
    if (typeof row.id === "number" && !Number.isNaN(row.id)) return row.id;
    if (typeof row.id === "string" && /^\d+$/.test(row.id))
      return Number(row.id);

    const url = row.url || row.detail || row.resource_uri || "";
    if (typeof url === "string") {
      const m = url.match(/\/(\d+)\/?$/);
      if (m) return Number(m[1]);
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchUnits();
      } catch (err) {
        console.error("Failed to fetch units:", err);
        Swal.fire({
          icon: "error",
          title: "Failed to load units",
          text: err?.message || "An error occurred while fetching units.",
          toast: true,
          position: "top-end",
          timer: 4000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (row, idx) => {
    const key = getRowKey(row, idx);
    setEditingKey(key);
    setEditingValues({
      unit_name: row.unit_name ?? "",
      unit_symbol: row.unit_symbol ?? "",
      unit_category: row.unit_category ?? "",
      is_hidden: !!row.is_hidden,
    });
    setFieldErrors(emptyFieldErrors);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditingValues(emptyValues);
    setFieldErrors(emptyFieldErrors);
  };

  const parseFieldErrors = (errData) => {
    const parsed = { ...emptyFieldErrors };
    if (!errData || typeof errData !== "object") return parsed;
    if (errData.unit_name) parsed.unit_name = joinErrorValue(errData.unit_name);
    if (errData.unit_symbol)
      parsed.unit_symbol = joinErrorValue(errData.unit_symbol);
    if (errData.unit_category)
      parsed.unit_category = joinErrorValue(errData.unit_category);
    return parsed;
  };

  const joinErrorValue = (val) => {
    if (Array.isArray(val)) return val.join(" ");
    if (typeof val === "string") return val;
    return JSON.stringify(val);
  };

  const handleSave = async (row, idx) => {
    // client-side validation
    if (!editingValues.unit_name.trim() || !editingValues.unit_symbol.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please provide unit name and symbol.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
      setFieldErrors({
        unit_name: !editingValues.unit_name.trim()
          ? "Unit name is required."
          : null,
        unit_symbol: !editingValues.unit_symbol.trim()
          ? "Unit symbol is required."
          : null,
        unit_category: null,
      });
      return;
    }

    const id = getIdFromRow(row);
    if (id === null) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Item has no id — cannot save. (no numeric id found in object)",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // call context's updateUnit (it performs PATCH and updates context)
      await updateUnit(id, {
        unit_name: editingValues.unit_name,
        unit_symbol: editingValues.unit_symbol,
        unit_category: editingValues.unit_category,
        is_hidden: !!editingValues.is_hidden,
      });
      await fetchUnits();
      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Unit updated successfully.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });

      // Clear edit state (updateUnit already updated context state)
      setEditingKey(null);
      setEditingValues(emptyValues);
      setFieldErrors(emptyFieldErrors);
    } catch (err) {
      Swal.close();
      console.error("Save failed", err);

      // try to parse field errors (DRF style)
      const errData = err?.response?.data ?? err?.response ?? null;
      const parsed = parseFieldErrors(errData);
      setFieldErrors(parsed);

      const serverMsg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to save changes.";
      Swal.fire({ icon: "error", title: "Save failed", text: serverMsg });
    }
  };

  const handleDelete = async (row, idx) => {
    const id = getIdFromRow(row);
    if (id === null) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: "Item has no id — cannot delete. (no numeric id found in object)",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete unit",
      text: "Are you sure you want to permanently delete this unit of measure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await softDeleteUnit(id); // context should delete and update local list

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Unit removed successfully.",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false,
      });

      // if deleted row was editing, clear
      const key = getRowKey(row, idx);
      if (editingKey === key) {
        setEditingKey(null);
        setEditingValues(emptyValues);
        setFieldErrors(emptyFieldErrors);
      }
    } catch (err) {
      Swal.close();
      console.error("Delete failed", err);
      const serverMsg =
        err?.response?.data?.detail || err?.message || "Failed to delete unit.";
      Swal.fire({ icon: "error", title: "Delete failed", text: serverMsg });
    }
  };

  return (
    <Box p={4} mr={4}>
      {/* Top header */}
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

        <Stack direction="row" alignItems="center" spacing={1}>
          <Paper elevation={0} sx={{ px: 2, py: 0.5, borderRadius: 2 }}>
            <Typography variant="body2">{`${unitsOfMeasure.length} items`}</Typography>
          </Paper>
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
        component={Paper}
      >
        {/* Inner header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton size="small" onClick={() => window.history.back()}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="subtitle1" color={"#3B7CED"} fontSize={"18px"}>
              Unit List
            </Typography>
          </Stack>
          <Box />
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
                <TableCell sx={{ width: "35%", p: 4 }}>Unit Name</TableCell>
                <TableCell sx={{ width: "20%" }}>Symbol</TableCell>
                <TableCell sx={{ width: "25%" }}>Category</TableCell>
                <TableCell sx={{ width: "20%" }}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingUnits ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    Loading…
                  </TableCell>
                </TableRow>
              ) : unitsOfMeasure.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    No units found.
                  </TableCell>
                </TableRow>
              ) : (
                unitsOfMeasure.map((row, idx) => {
                  const key = getRowKey(row, idx);
                  const isEditing = editingKey === key;
                  const bg = idx % 2 === 1 ? "white" : "rgba(0,0,0,0.03)";

                  // disable other row actions while an edit is active
                  const isOtherRowBeingEdited =
                    editingKey !== null && !isEditing;

                  return (
                    <TableRow key={key} sx={{ backgroundColor: bg }}>
                      <TableCell sx={{ p: 3 }}>
                        {isEditing ? (
                          <TextField
                            variant="standard"
                            value={editingValues.unit_name}
                            onChange={(e) =>
                              setEditingValues((p) => ({
                                ...p,
                                unit_name: e.target.value,
                              }))
                            }
                            fullWidth
                            size="small"
                            error={Boolean(fieldErrors.unit_name)}
                            helperText={fieldErrors.unit_name ?? ""}
                          />
                        ) : (
                          <Typography>{row.unit_name}</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <TextField
                            variant="standard"
                            value={editingValues.unit_symbol}
                            onChange={(e) =>
                              setEditingValues((p) => ({
                                ...p,
                                unit_symbol: e.target.value,
                              }))
                            }
                            size="small"
                            error={Boolean(fieldErrors.unit_symbol)}
                            helperText={fieldErrors.unit_symbol ?? ""}
                          />
                        ) : (
                          <Typography>{row.unit_symbol ?? "-"}</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        {isEditing ? (
                          <TextField
                            variant="standard"
                            value={editingValues.unit_category}
                            onChange={(e) =>
                              setEditingValues((p) => ({
                                ...p,
                                unit_category: e.target.value,
                              }))
                            }
                            size="small"
                            error={Boolean(fieldErrors.unit_category)}
                            helperText={fieldErrors.unit_category ?? ""}
                          />
                        ) : (
                          <Typography>{row.unit_category ?? "-"}</Typography>
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
                              size="small"
                              onClick={() => handleSave(row, idx)}
                              disabled={savingUnitId === getIdFromRow(row)}
                            >
                              Save
                            </Button>

                            <IconButton
                              size="small"
                              onClick={cancelEdit}
                              aria-label="Cancel edit"
                              disabled={savingUnitId === getIdFromRow(row)}
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
                              size="small"
                              onClick={() => startEdit(row, idx)}
                              disabled={
                                loadingUnits ||
                                isOtherRowBeingEdited ||
                                savingUnitId === getIdFromRow(row)
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              variant="text"
                              size="small"
                              color="primary"
                              onClick={() => handleDelete(row, idx)}
                              disabled={
                                deletingUnitId === getIdFromRow(row) ||
                                loadingUnits ||
                                isOtherRowBeingEdited ||
                                savingUnitId === getIdFromRow(row)
                              }
                            >
                              Delete
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>

      {/* helper */}
      <Box mt={1}>
        <Typography variant="caption" color="text.secondary">
          Tip: Click <strong>Edit</strong> to convert row to editable inputs.
          Click <strong>Save</strong> to persist changes.
        </Typography>
      </Box>
    </Box>
  );
};

export default UnitOfMeasurePage;
