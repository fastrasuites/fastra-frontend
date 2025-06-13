import React, { useCallback, useReducer, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Swal from "sweetalert2";
import InputField from "../../../../components/InputField/InputField";
import ImageUpload from "../../../../components/ImageUpload/ImageUpload";
import SignatureSection from "../../../../components/SignatureSection/SignatureSection";

// Constants
const LANGUAGE_OPTIONS = [
  { label: "English", value: "english" },
  // ... other languages
  { label: "Tiv", value: "tiv" },
];

const TIMEZONE_OPTIONS = [
  { label: "(UTC+01:00) Lagos, West Central Africa", value: "Africa/Lagos" },
  // ... other timezones
  { label: "(UTC+14:00) Line Islands", value: "Pacific/Kiritimati" },
];

const ROLE_OPTIONS = [
  { label: "Administrator", value: "administrator" },
  { label: "Manager", value: "manager" },
  { label: "Viewer", value: "viewer" },
];

const ACCESS_RIGHTS_FIELDS = [
  { name: "purchaseRequestApproval", label: "Purchase Request Approval" },
  { name: "inventory", label: "Inventory" },
  { name: "sales", label: "Sales" },
  { name: "humanResources", label: "Human Resources" },
  { name: "accounting", label: "Accounting" },
];

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const IMAGE_MAX_SIZE = 1 * 1024 * 1024; // 1 MB

// Initial form state
const initialState = {
  activeTab: 0,
  imageFile: null,
  imagePreview: "",
  name: "",
  role: "",
  email: "",
  phone: "",
  language: "",
  timezone: "",
  inAppNotification: false,
  emailNotification: false,
  signature: "",
  ...Object.fromEntries(ACCESS_RIGHTS_FIELDS.map((field) => [field.name, ""])),
};

// Action types
const ActionTypes = {
  SET_FIELD: "SET_FIELD",
  SET_IMAGE: "SET_IMAGE",
  SET_TAB: "SET_TAB",
  SET_SIGNATURE: "SET_SIGNATURE",
  RESET: "RESET",
};

// Reducer
function formReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_FIELD:
      return { ...state, [action.payload.name]: action.payload.value };
    case ActionTypes.SET_IMAGE:
      return {
        ...state,
        imageFile: action.payload.file,
        imagePreview: action.payload.preview,
      };
    case ActionTypes.SET_TAB:
      return { ...state, activeTab: action.payload };
    case ActionTypes.SET_SIGNATURE:
      return { ...state, signature: action.payload };
    case ActionTypes.RESET:
      return initialState;
    default:
      return state;
  }
}

// Access Rights Section
const AccessRightsSection = ({ state, handleChange }) => (
  <Box backgroundColor={"white"}>
    <Box color={"#A9B3BC"} pb={8}>
      <Button variant="outlined" size="large">
        Access Rights
      </Button>
      <Button variant="outlined" color="inherit" size="large">
        Sessions
      </Button>
      <Button variant="outlined" color="inherit" size="large">
        Allowed IP
      </Button>
      <Button variant="outlined" color="inherit" size="large">
        Preference
      </Button>
      <Button variant="outlined" color="inherit" size="large">
        Sales Preference
      </Button>
    </Box>

    <Typography color="#3B7CED" fontSize="20px">
      Application
    </Typography>
    <Box>
      {ACCESS_RIGHTS_FIELDS.map((field) => (
        <Box
          key={field.name}
          display="flex"
          alignItems="center"
          gap={3}
          mb={2}
          maxWidth={1250}
        >
          <Typography variant="subtitle2" whiteSpace="nowrap" minWidth={180}>
            {field.label}
          </Typography>
          <InputField
            config={{
              name: field.name,
              inputType: "select",
              options: ROLE_OPTIONS,
            }}
            value={state[field.name]}
            onChange={handleChange}
          />
        </Box>
      ))}
    </Box>
  </Box>
);

// Main Component
const CreateUser = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const sigPadRef = useRef(null);

  // Handlers
  const handleTabChange = useCallback(
    (index) => dispatch({ type: ActionTypes.SET_TAB, payload: index }),
    []
  );

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: ActionTypes.SET_FIELD,
      payload: { name, value: type === "checkbox" ? checked : value },
    });
  }, []);

  const handleClearSignature = useCallback(() => {
    dispatch({ type: ActionTypes.SET_SIGNATURE, payload: "" });
  }, []);

  const handleEndSignature = useCallback((signatureData) => {
    dispatch({ type: ActionTypes.SET_SIGNATURE, payload: signatureData });
  }, []);

  const handleUploadSignature = useCallback((signatureData) => {
    dispatch({ type: ActionTypes.SET_SIGNATURE, payload: signatureData });
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_SIZE) {
      Swal.fire({
        icon: "error",
        title: "Invalid Image",
        text: "Please upload a JPEG/PNG under 1 MB.",
      });
      return;
    }

    dispatch({
      type: ActionTypes.SET_IMAGE,
      payload: { file, preview: URL.createObjectURL(file) },
    });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (
        sigPadRef.current &&
        !sigPadRef.current.isEmpty() &&
        !state.signature
      ) {
        const dataURL = sigPadRef.current.toDataURL("image/png");
        dispatch({ type: ActionTypes.SET_SIGNATURE, payload: dataURL });
      }
      const requiredFields = [
        "name",
        "role",
        "email",
        "phone",
        "language",
        "timezone",
        "imagePreview",
        "signature",
      ];

      const missing = requiredFields.filter((key) => !state[key]);
      if (missing.length) {
        Swal.fire({
          icon: "warning",
          title: "Missing fields",
          text: `Please fill out: ${missing.join(", ")}`,
        });
        return;
      }
      console.log("Signature:", state);
      Swal.fire({
        icon: "success",
        title: "User Created",
        text: `${state.name} has been successfully created.`,
      });
      dispatch({ type: ActionTypes.RESET });
    },
    [state]
  );

  // Form Sections
  const renderBasicSettings = () => (
    <Box
      display="flex"
      flexDirection="column"
      gap="32px"
      p={3}
      border="1px solid #E2E6E9"
      borderRadius="0 4px 4px 4px"
      backgroundColor={"white"}
    >
      <Box borderBottom="1px solid #E2E6E9" pb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography color="#3B7CED" fontSize="20px">
            Basic Information
          </Typography>
          <Box>
            <Button variant="text" sx={{ mr: 3 }}>
              Cancel
            </Button>
            <Button variant="contained" size="large">
              Save
            </Button>
          </Box>
        </Box>

        <Grid container gap="40px">
          <Grid item xs={1}>
            <ImageUpload
              imagePreview={state.imagePreview}
              onImageUpload={handleImageUpload}
            />
          </Grid>

          <Grid container item xs={10} gap="40px">
            <Grid item xs={5}>
              <InputField
                config={{
                  name: "name",
                  label: "Name",
                  inputType: "text",
                  placeholder: "Firstname Lastname",
                  required: true,
                }}
                value={state.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={5}>
              <InputField
                config={{
                  name: "role",
                  label: "Role",
                  inputType: "select",
                  options: ROLE_OPTIONS,
                  required: true,
                }}
                value={state.role}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box borderBottom="1px solid #E2E6E9" pb={3}>
        <Typography color="#3B7CED" fontSize="20px">
          Contact Information
        </Typography>
        <Grid container gap="40px" mt={2}>
          <Grid item xs={12} md={4}>
            <InputField
              config={{
                name: "email",
                label: "Email",
                inputType: "email",
                placeholder: "Enter your company email address",
                required: true,
              }}
              value={state.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InputField
              config={{
                name: "phone",
                label: "Phone Number",
                inputType: "tel",
                placeholder: "Enter your company phone number",
                required: true,
              }}
              value={state.phone}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </Box>

      <Box borderBottom="1px solid #E2E6E9" pb={3}>
        <Typography color="#3B7CED" fontSize="20px" mb={3}>
          Company Name
        </Typography>
        <Button variant="outlined">Company name</Button>
      </Box>

      <Box borderBottom="1px solid #E2E6E9" pb={3} display="grid" gap={1}>
        <Typography color="#3B7CED" fontSize="20px">
          Preference
        </Typography>
        <Grid container gap="40px" mt={2}>
          <Grid item xs={12} md={4}>
            <InputField
              config={{
                name: "language",
                label: "Language",
                inputType: "select",
                options: LANGUAGE_OPTIONS,
                placeholder: "Select language",
                required: true,
              }}
              value={state.language}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <InputField
              config={{
                name: "timezone",
                label: "Timezone",
                inputType: "select",
                options: TIMEZONE_OPTIONS,
                placeholder: "Select timezone",
                required: true,
              }}
              value={state.timezone}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box display="flex" flexDirection="column" mt={2}>
          <Box display="flex" alignItems="center" gap={3}>
            <Typography variant="subtitle2" color="#7A8A98">
              In-App Notifications
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="inAppNotification"
                  checked={state.inAppNotification}
                  onChange={handleChange}
                  sx={{ color: "#C6CCD2" }}
                />
              }
            />
          </Box>

          <Box display="flex" alignItems="center" gap={3}>
            <Typography variant="subtitle2" color="#7A8A98">
              Email Notifications
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  name="emailNotification"
                  checked={state.emailNotification}
                  onChange={handleChange}
                  sx={{ color: "#C6CCD2" }}
                />
              }
            />
          </Box>
        </Box>
      </Box>

      <SignatureSection
        signature={state.signature}
        onClear={handleClearSignature}
        onEnd={handleEndSignature}
        onUpload={handleUploadSignature}
      />
    </Box>
  );

  const renderAccessRights = () => (
    <Box
      backgroundColor={"white"}
      p={3}
      border={"2px solid #E2E6E9"}
      borderRadius={"4px"}
    >
      <Box borderBottom="1px solid #E2E6E9" pb={1}>
        <Typography color="#3B7CED" fontSize="20px">
          Access Rights
        </Typography>
      </Box>

      <Box display="flex" width="100%" alignItems="center" gap={6} my={4}>
        <Grid item xs={1}>
          <ImageUpload
            imagePreview={state.imagePreview}
            onImageUpload={handleImageUpload}
            isAccessRight={true}
          />
        </Grid>

        <Box maxWidth={450} flex={1}>
          <InputField
            config={{
              name: "name",
              label: "Name",
              inputType: "text",
              placeholder: "Firstname Lastname",
              required: true,
            }}
            value={state.name}
            onChange={handleChange}
          />

          <InputField
            config={{
              name: "role",
              label: "Role",
              inputType: "select",
              options: ROLE_OPTIONS,
              required: true,
            }}
            value={state.role}
            onChange={handleChange}
          />
        </Box>
      </Box>

      <AccessRightsSection state={state} handleChange={handleChange} />
    </Box>
  );

  return (
    <Box p={6}>
      <Typography variant="h5" mb={2}>
        New User
      </Typography>

      {/* Tab Buttons */}
      <Box color="#A9B3BC">
        <Button
          variant="outlined"
          color={state.activeTab === 0 ? "primary" : "inherit"}
          onClick={() => handleTabChange(0)}
          sx={{ borderRadius: "4px 4px 0px 0px" }}
        >
          Basic Settings
        </Button>
        <Button
          variant="outlined"
          color={state.activeTab === 1 ? "primary" : "inherit"}
          onClick={() => handleTabChange(1)}
          sx={{ borderRadius: "4px 4px 0px 0px" }}
        >
          Access Rights
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        {state.activeTab === 1 ? renderAccessRights() : renderBasicSettings()}

        <Box mt={4}>
          <Button type="submit" variant="contained" color="primary">
            Save User
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateUser;
