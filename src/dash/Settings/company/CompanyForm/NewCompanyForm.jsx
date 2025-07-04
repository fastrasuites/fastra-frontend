import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Box, Button, Grid, Typography, IconButton } from "@mui/material";
import Swal from "sweetalert2";
import InputField from "../../../../components/InputField/InputField";
import ImageUpload from "../../../../components/ImageUpload/ImageUpload";
import { useUser } from "../../../../context/Settings/UserContext";
import { Plus, X } from "lucide-react";
import { useTenant } from "../../../../context/TenantContext";
import { useCompany } from "../../../../context/Settings/CompanyContext";

// Constants
export const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
];

export const TIMEZONE_OPTIONS = [
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

const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "technology" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Finance", value: "finance" },
  { label: "Retail", value: "retail" },
  { label: "Education", value: "education" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Transportation", value: "transportation" },
  { label: "Energy", value: "energy" },
  { label: "Hospitality", value: "hospitality" },
  { label: "Entertainment", value: "entertainment" },
];

const SIZE_OPTIONS = [
  { label: "1-10 employees", value: "1-10" },
  { label: "11-50 employees", value: "11-50" },
  { label: "51-200 employees", value: "51-200" },
  { label: "201-500 employees", value: "201-500" },
  { label: "501-1000 employees", value: "501-1000" },
  { label: "1001-5000 employees", value: "1001-5000" },
  { label: "5001+ employees", value: "5001+" },
];

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const IMAGE_MAX_SIZE = 1 * 1024 * 1024; // 1 MB

// Action types
const ActionTypes = {
  SET_FIELD: "SET_FIELD",
  SET_IMAGE: "SET_IMAGE",
  SET_ROLE: "SET_ROLE",
  ADD_ROLE: "ADD_ROLE",
  REMOVE_ROLE: "REMOVE_ROLE",
  RESET: "RESET",
  SET_STATE: "SET_STATE",
};

// Initial form state
const initialState = {
  imageFile: null,
  imagePreview: "",
  name: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  local_government: "",
  state: "",
  registration_number: "",
  tax_id: "",
  industry: "",
  language: "",
  timezone: "",
  size: "",
  roles: [""],
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
    case ActionTypes.SET_ROLE:
      const updatedRoles = [...state.roles];
      updatedRoles[action.payload.index] = action.payload.value;
      return { ...state, roles: updatedRoles };
    case ActionTypes.ADD_ROLE:
      return { ...state, roles: [...state.roles, ""] };
    case ActionTypes.REMOVE_ROLE:
      return {
        ...state,
        roles: state.roles.filter((_, i) => i !== action.payload),
      };
    case ActionTypes.RESET:
      return initialState;
    case ActionTypes.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// Basic Settings Tab Component
const BasicSettingsTab = ({
  state,
  dispatch,
  handleImageUpload,
  resetForm,
  allStates,
  selectedStatesLGA,
  handleSelectedState,
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: ActionTypes.SET_FIELD,
      payload: { name, value: type === "checkbox" ? checked : value },
    });
  };

  const handleRoleChange = (index) => (e) => {
    dispatch({
      type: ActionTypes.SET_ROLE,
      payload: { index, value: e.target.value },
    });
  };

  const localGovernmentOptions = selectedStatesLGA.map((lga) => ({
    label: lga,
    value: lga,
  }));

  console.log(state);

  return (
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
          <Box>
            <Button variant="text" sx={{ mr: 3 }} onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" size="large">
              Save
            </Button>
          </Box>
        </Box>

        <Box display="flex" gap={7} alignItems="center">
          <Grid item xs={1}>
            <ImageUpload
              imagePreview={state.imagePreview}
              onImageUpload={handleImageUpload}
            />
          </Grid>
          <Grid container item xs={10} gap="40px">
            <Grid item xs={5}>
              <Typography color="#1A1A1A" fontSize={16}>
                Company name
              </Typography>
              <Typography fontSize={20} color="#8C9AA8">
                {state.name}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Contact Information */}
      <Box borderBottom="1px solid #E2E6E9" pb={3}>
        <Typography color="#3B7CED" fontSize="20px">
          Contact Information
        </Typography>
        <Box display={"flex"} gap={"64px"} mt={2}>
          <Box display="flex" flexDirection="column" gap={1} my={2} flex={1}>
            <Typography
              color="#1A1A1A"
              fontSize={16}
              variant="subtitle2"
              gutterBottom
              flex={1}
            >
              Email
            </Typography>
            <Typography fontSize={20} color="#8C9AA8">
              {state.email}
            </Typography>
          </Box>
          <Box flex={1}>
            <InputField
              config={{
                name: "phone",
                label: "Phone Number",
                inputType: "tel",
                placeholder: "Enter your company phone number",
                required: false,
              }}
              value={state.phone}
              onChange={handleChange}
            />
          </Box>

          <Box flex={1}>
            <InputField
              config={{
                name: "website",
                label: "Website",
                inputType: "url",
                placeholder: "Enter your company website here",
                required: false,
              }}
              value={state.website}
              onChange={handleChange}
            />
          </Box>
        </Box>
        <Box display={"flex"} gap={"64px"} mt={2}>
          <InputField
            config={{
              name: "address",
              label: "Address",
              inputType: "text",
              placeholder: "Street & Number",
              required: false,
            }}
            value={state.address}
            onChange={handleChange}
          />

          <InputField
            config={{
              name: "local_government",
              label: "LGA",
              inputType: "select",
              options: localGovernmentOptions,
              placeholder: "Local Government",
              required: false,
            }}
            value={state.local_government}
            onChange={handleChange}
          />
          <InputField
            config={{
              name: "state",
              label: "State",
              inputType: "select",
              options: allStates.map((state) => ({
                label: state,
                value: state,
              })),
              placeholder: "State",
              required: false,
            }}
            value={state.state}
            onChange={(e) => {
              handleSelectedState(e.target.value);
              handleChange(e);
            }}
          />
        </Box>
      </Box>

      {/* Company Registration Info */}
      <Box borderBottom="1px solid #E2E6E9" pb={3}>
        <Typography color="#3B7CED" fontSize="20px">
          Company Registration Info
        </Typography>
        <Box display={"flex"} gap={"64px"} mt={2}>
          <InputField
            config={{
              name: "registration_number",
              label: "Registration Number",
              inputType: "text",
              placeholder: "Enter your company registration number",
              required: false,
            }}
            value={state.registration_number}
            onChange={handleChange}
          />

          <InputField
            config={{
              name: "tax_id",
              label: "Tax ID",
              inputType: "text",
              placeholder: "Enter your company Tax Identification Number",
              required: false,
            }}
            value={state.tax_id}
            onChange={handleChange}
          />
        </Box>
      </Box>

      {/* Other Information */}
      <Box borderBottom="1px solid #E2E6E9" pb={3} display="grid" gap={1}>
        <Typography color="#3B7CED" fontSize="20px">
          Other Information
        </Typography>
        <Box display="flex" gap={3} mt={2}>
          <InputField
            config={{
              name: "industry",
              label: "Industry",
              inputType: "select",
              options: INDUSTRY_OPTIONS,
              placeholder: "Select your company industry",
              required: false,
            }}
            value={state.industry}
            onChange={handleChange}
          />
          <InputField
            config={{
              name: "language",
              label: "Language",
              inputType: "select",
              options: LANGUAGE_OPTIONS,
              placeholder: "Select language",
              required: false,
            }}
            value={state.language}
            onChange={handleChange}
          />
          <InputField
            config={{
              name: "size",
              label: "Size",
              inputType: "select",
              options: SIZE_OPTIONS,
              placeholder: "Size",
              required: false,
            }}
            value={state.size}
            onChange={handleChange}
          />
        </Box>
      </Box>

      {/* Roles */}
      <Box borderBottom="1px solid #E2E6E9" pb={3}>
        <Typography color="#3B7CED" fontSize={20} mb={2}>
          Roles
        </Typography>
        <Box display="flex" gap={2} flexWrap={"wrap"}>
          {state.roles.map((role, idx) => (
            <Box
              key={idx}
              display="flex"
              alignItems="center"
              mb={2}
              gap={2}
              width={500}
            >
              <InputField
                config={{
                  name: `roles[${idx}]`,
                  label: `Role ${idx + 1}`,
                  inputType: "text",
                  placeholder: "Enter role",
                }}
                value={role}
                onChange={handleRoleChange(idx)}
              />
              <IconButton
                size="small"
                onClick={() =>
                  dispatch({ type: ActionTypes.REMOVE_ROLE, payload: idx })
                }
                disabled={state.roles.length === 1}
                sx={{ marginTop: "15px" }}
              >
                <X size={16} color="red" />
              </IconButton>
            </Box>
          ))}
          <Box display={"flex"} gap={2} alignContent={"center"}>
            <Button
              onClick={() => dispatch({ type: ActionTypes.ADD_ROLE })}
              variant="outlined"
              sx={{
                height: "40px",
                width: "40px",
                alignSelf: "center",
                border: "1px solid #C6CCD2",
                borderRadius: "50%",
                minWidth: "unset",
                padding: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Plus color="gray" />
            </Button>
            <Typography
              color="#8C9AA8"
              fontSize={14}
              sx={{ alignSelf: "center" }}
            >
              Add more Role
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Main Component
const NewCompany = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [allStatesAndLGA, setAllStatesAndLGA] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [selectedStatesLGA, setSelectedStatesLGA] = useState([]);
  const { tenantData } = useTenant();
  const user = tenantData?.user || {};
  const { updateCompany, getCompany, company: companyDetails } = useCompany();
  const initialCompanyDataRef = useRef(null);

  useEffect(() => {
    const fetchStatesAndLGA = async () => {
      try {
        const response = await fetch(
          "https://temikeezy.github.io/nigeria-geojson-data/data/lgas.json"
        );
        if (!response.ok) throw new Error("Failed to fetch states and LGAs");
        const data = await response.json();
        setAllStatesAndLGA(data);
      } catch (error) {
        console.error("Error fetching states and LGAs:", error);
      }
    };

    const fetchStates = async () => {
      try {
        const response = await fetch(
          "https://temikeezy.github.io/nigeria-geojson-data/data/states.json"
        );
        if (!response.ok) throw new Error("Failed to fetch states");
        const data = await response.json();
        setAllStates(data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    getCompany();
    fetchStates();
    fetchStatesAndLGA();
  }, []);
  useEffect(() => {
    if (companyDetails) {
      const formData = {
        name: companyDetails.name || tenantData?.tenant_company_name,
        email: companyDetails.email || user?.email || "",
        phone: companyDetails.phone || "",
        website: companyDetails.website || "",
        address: companyDetails.street_address || "",
        local_government: companyDetails.city || "",
        state: companyDetails.state || "",
        registration_number: companyDetails.registration_number || "",
        tax_id: companyDetails.tax_id || "",
        industry: companyDetails.industry || "",
        language: companyDetails.language || "",
        size: companyDetails.company_size || "",
        roles: companyDetails.roles?.length
          ? companyDetails.roles.map((r) => r.name)
          : [""],
        imagePreview: companyDetails.logo_url || "",
      };

      dispatch({ type: ActionTypes.SET_STATE, payload: formData });
      initialCompanyDataRef.current = formData;

      // Set LGAs for company's state
      if (companyDetails.state && allStatesAndLGA[companyDetails.state]) {
        setSelectedStatesLGA(allStatesAndLGA[companyDetails.state]);
      }
    }
  }, [companyDetails, allStatesAndLGA, user?.email]);

  const handleSelectedState = (stateName) => {
    dispatch({
      type: ActionTypes.SET_FIELD,
      payload: { name: "state", value: stateName },
    });
    dispatch({
      type: ActionTypes.SET_FIELD,
      payload: { name: "local_government", value: "" },
    });

    if (stateName && allStatesAndLGA[stateName]) {
      setSelectedStatesLGA(allStatesAndLGA[stateName]);
    } else {
      setSelectedStatesLGA([]);
    }
  };

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
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

  const resetForm = useCallback(() => {
    if (initialCompanyDataRef.current) {
      dispatch({
        type: ActionTypes.SET_STATE,
        payload: initialCompanyDataRef.current,
      });
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const formData = new FormData();
      if (state.imageFile) formData.append("logo_image", state.imageFile);
      formData.append("phone", state.phone);
      formData.append("website", state.website);
      formData.append("street_address", state.address);
      formData.append("city", state.local_government);
      formData.append("country", state.country || "nigeria");
      formData.append("zip_code", "10001");
      formData.append("state", state.state);
      formData.append("registration_number", state.registration_number);
      formData.append("tax_id", state.tax_id);
      formData.append("industry", state.industry);
      formData.append("language", state.language);
      formData.append("time_zone", state.timezone);
      formData.append("company_size", state.size);

      const rolesPayload = state.roles.map((name) => ({ name }));
      formData.append("roles", JSON.stringify(rolesPayload));
      for (let [key, val] of formData.entries()) {
        console.log(key, "→", val);
      }

      try {
        const res = await updateCompany(formData);
        if (res.success) {
          dispatch({
            type: ActionTypes.SET_IMAGE,
            payload: { file: state.imageFile, preview: res.data.logo_url },
          });
          Swal.fire({
            icon: "success",
            title: "Updated",
            text: "Company profile updated.",
          });
        } else throw new Error(res.error);
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error", text: err.message });
      }
    },
    [state, updateCompany]
  );

  return (
    <Box p={6}>
      <Typography variant="h5" mb={2}>
        New Company
      </Typography>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <BasicSettingsTab
          state={state}
          dispatch={dispatch}
          handleImageUpload={handleImageUpload}
          resetForm={resetForm}
          allStates={allStates}
          selectedStatesLGA={selectedStatesLGA}
          handleSelectedState={handleSelectedState}
        />

        <Box mt={4}>
          <Button type="submit" variant="contained" color="primary">
            Save Company
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default NewCompany;
