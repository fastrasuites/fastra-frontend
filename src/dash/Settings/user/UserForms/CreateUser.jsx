import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import InputField from "../../../../components/InputField/InputField";
import ImageUpload from "../../../../components/ImageUpload/ImageUpload";
import SignatureSection from "../../../../components/SignatureSection/SignatureSection";
import { useUser } from "../../../../context/Settings/UserContext";
import { useHistory, useLocation } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import { useCompany } from "../../../../context/Settings/CompanyContext";

// Constants
const TIMEZONE_OPTIONS = [
  {
    label: "(UTC-08:00) Pacific Time (US & Canada)",
    value: "America/Los_Angeles",
  },
  {
    label: "(UTC-05:00) Eastern Time (US & Canada)",
    value: "America/New_York",
  },
  { label: "(UTC-03:00) Brasilia", value: "America/Sao_Paulo" },
  { label: "(UTC+00:00) London, Dublin", value: "Europe/London" },
  { label: "(UTC+01:00) Lagos, West Central Africa", value: "Africa/Lagos" },
  { label: "(UTC+01:00) Berlin, Rome, Paris", value: "Europe/Paris" },
  { label: "(UTC+02:00) Cairo", value: "Africa/Cairo" },
  { label: "(UTC+03:00) Moscow", value: "Europe/Moscow" },
  { label: "(UTC+04:00) Dubai", value: "Asia/Dubai" },
  { label: "(UTC+05:30) New Delhi", value: "Asia/Kolkata" },
  { label: "(UTC+07:00) Bangkok", value: "Asia/Bangkok" },
  { label: "(UTC+08:00) Beijing, Singapore", value: "Asia/Shanghai" },
  { label: "(UTC+09:00) Tokyo", value: "Asia/Tokyo" },
  { label: "(UTC+10:00) Sydney", value: "Australia/Sydney" },
  { label: "(UTC+12:00) Auckland", value: "Pacific/Auckland" },
  { label: "(UTC+14:00) Line Islands", value: "Pacific/Kiritimati" },
];
const LANGUAGE_OPTIONS = [{ label: "English", value: "en" }];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const IMAGE_MAX_SIZE = 1 * 1024 * 1024; // 1 MB
const REQUIRED_FIELDS = [
  "name",
  "role",
  "email",
  "phone",
  "language",
  "timezone",
  "signature",
];

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
  accessGroups: {},
};

// Action types
const ActionTypes = {
  SET_FIELD: "SET_FIELD",
  SET_IMAGE: "SET_IMAGE",
  SET_TAB: "SET_TAB",
  SET_ACCESS_GROUP: "SET_ACCESS_GROUP",
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
    case ActionTypes.SET_ACCESS_GROUP: {
      const { application, accessCode } = action.payload;
      return {
        ...state,
        accessGroups: {
          ...state.accessGroups,
          [application]: accessCode,
        },
      };
    }
    case ActionTypes.SET_SIGNATURE:
      return { ...state, signature: action.payload };
    case ActionTypes.RESET:
      return initialState;
    default:
      return state;
  }
}

// Access Rights Section Component
const AccessRightsSection = ({
  state,
  handleAccessGroupChange,
  accessGroupRights,
}) => {
  return (
    <Box backgroundColor="white">
      <Box color="#A9B3BC" pb={8}>
        <Button variant="outlined" size="large">
          Access Rights
        </Button>
        {/* <Button variant="outlined" color="inherit" size="large">
          Sessions
        </Button> */}
      </Box>

      <Typography color="#3B7CED" fontSize="20px">
        Application
      </Typography>
      <Box>
        {accessGroupRights.length > 0 ? (
          accessGroupRights.map((appGroup) => (
            <Box
              key={appGroup.application}
              display="flex"
              alignItems="center"
              gap={3}
              mb={2}
              maxWidth={1250}
            >
              <Typography
                variant="subtitle2"
                whiteSpace="nowrap"
                minWidth={180}
                textTransform={"capitalize"}
              >
                {appGroup?.application}
              </Typography>
              <InputField
                config={{
                  name: appGroup.application,
                  inputType: "select",
                  options: appGroup.access_groups.map((group) => ({
                    label: group.group_name,
                    value: group.access_code,
                  })),
                }}
                value={state.accessGroups[appGroup.application] || ""}
                onChange={(e) =>
                  handleAccessGroupChange(appGroup.application, e.target.value)
                }
              />
            </Box>
          ))
        ) : (
          <Typography>No access groups available</Typography>
        )}
      </Box>
    </Box>
  );
};

// Basic Settings Tab Component
const BasicSettingsTab = ({
  state,
  handleChange,
  handleImageUpload,
  handleClearSignature,
  handleEndSignature,
  handleUploadSignature,
  roles = [],
  companyName,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    gap="32px"
    p={3}
    border="1px solid #E2E6E9"
    borderRadius="0 4px 4px 4px"
    backgroundColor="white"
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
                options: roles.map((role) => ({
                  label: role.name,
                  value: role.id,
                })),
                required: true,
              }}
              value={state.role}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </Grid>
    </Box>

    {/* Contact Information */}
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

    {/* Company Name */}
    <Box borderBottom="1px solid #E2E6E9" pb={3}>
      <Typography color="#3B7CED" fontSize="20px" mb={3}>
        Company Name
      </Typography>
      <Typography c fontSize="16px" mb={3}>
        {companyName}
      </Typography>
    </Box>

    {/* Preference */}
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

// Access Rights Tab Component
const AccessRightsTab = ({
  state,
  handleChange,
  handleImageUpload,
  handleAccessGroupChange,
  accessGroupRights,
  roles,
}) => (
  <Box
    backgroundColor="white"
    p={3}
    border="2px solid #E2E6E9"
    borderRadius="4px"
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
            options: roles.map((role) => ({
              label: role.name,
              value: role.id,
            })),
            required: true,
          }}
          value={state.role}
          onChange={handleChange}
        />
      </Box>
    </Box>

    <AccessRightsSection
      state={state}
      handleAccessGroupChange={handleAccessGroupChange}
      accessGroupRights={accessGroupRights}
    />
  </Box>
);

// Main Component
const CreateUser = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const location = useLocation();
  const fromStepModal =
    location.state?.fromStepModal ||
    localStorage.getItem("fromStepModal") === "true";
  const {
    createUser,
    getAccessGroups,
    accessGroups: accessGroupRights,
  } = useUser();
  const { company, getCompany } = useCompany();

  const roles = company?.roles || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([getCompany(), getAccessGroups()]);
      } catch (err) {
        setError("Failed to load initial data");
        console.error("Initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getAccessGroups, getCompany]);

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

  const handleAccessGroupChange = useCallback((application, accessCode) => {
    dispatch({
      type: ActionTypes.SET_ACCESS_GROUP,
      payload: { application, accessCode },
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

    if (!IMAGE_TYPES.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload a JPEG, PNG, or JPG image.",
      });
      return;
    }

    if (file.size > IMAGE_MAX_SIZE) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Please upload an image smaller than 1MB.",
      });
      return;
    }

    dispatch({
      type: ActionTypes.SET_IMAGE,
      payload: { file, preview: URL.createObjectURL(file) },
    });
  }, []);

  function dataURLtoFile(dataurl, filename) {
    try {
      const arr = dataurl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);

      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting signature:", error);
      return null;
    }
  }

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate required fields
      const missingFields = REQUIRED_FIELDS.filter(
        (key) =>
          !state[key] || (Array.isArray(state[key]) && state[key].length === 0)
      );

      if (missingFields.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: `Please fill in all required fields: ${missingFields.join(
            ", "
          )}`,
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Append all user data
      formData.append("name", state.name);
      formData.append("email", state.email);
      formData.append("company_role", state.role);
      formData.append("phone_number", state.phone);
      formData.append("language", state.language);
      formData.append("timezone", state.timezone);
      formData.append("in_app_notifications", state.inAppNotification);
      formData.append("email_notifications", state.emailNotification);

      // Append image file if exists
      if (state.imageFile) {
        formData.append("user_image_image", state.imageFile);
      }

      // Handle signature
      if (state.signature) {
        const signatureFile = dataURLtoFile(state.signature, "signature.png");
        if (signatureFile) {
          formData.append("signature_image", signatureFile);
        }
      }

      // Append access codes
      Object.values(state.accessGroups).forEach((code) => {
        if (code) formData.append("access_codes", code);
      });

      // Append profile image
      if (state.imageFile) {
        formData.append("image", state.imageFile);
      }

      try {
        const res = await createUser(formData);
        if (res?.success) {
          Swal.fire({
            icon: "success",
            title: "User Created",
            text: `${state.name} was created successfully`,
            showConfirmButton: false,
            timer: 2000,
          });

          if (fromStepModal) {
            localStorage.removeItem("fromStepModal");
            history.push(`/${tenant_schema_name}/dashboard`, {
              fromStepModal: false,
            });
          } else {
            setTimeout(() => {
              window.history.back();
            }, 2000);
          }
        } else {
          throw new Error(res?.error || "Failed to create user");
        }
      } catch (error) {
        console.error("User creation error:", error);
        Swal.fire({
          icon: "error",
          title: "Creation Failed",
          text:
            error.message || "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [state, createUser, history, tenant_schema_name, fromStepModal]
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} textAlign="center">
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

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
        {state.activeTab === 0 ? (
          <BasicSettingsTab
            state={state}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            handleClearSignature={handleClearSignature}
            handleEndSignature={handleEndSignature}
            handleUploadSignature={handleUploadSignature}
            roles={roles}
            companyName={accessGroupRights.tenant_company_name}
          />
        ) : (
          <AccessRightsTab
            state={state}
            handleChange={handleChange}
            handleImageUpload={handleImageUpload}
            handleAccessGroupChange={handleAccessGroupChange}
            accessGroupRights={accessGroupRights.data}
            roles={roles}
          />
        )}

        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            onClick={() => history.goBack()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : (
              "Save User"
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateUser;
