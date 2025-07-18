import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Chip,
} from "@mui/material";
import Swal from "sweetalert2";
import { useUser } from "../../../../context/Settings/UserContext";
import { useParams, useHistory } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import { useTenant } from "../../../../context/TenantContext";
import { SettingsIcon } from "lucide-react";

const UserInfo = () => {
  const history = useHistory();
  const [state, setState] = useState({ activeTab: 0 });
  const { getSingleUser, singleUser, isLoading, error, resetPassword } =
    useUser();
  const { tenantData } = useTenant();
  const { id } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await getSingleUser(id);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Data Load Error",
          text: `Failed to load user data: ${err.message || "Unknown error"}`,
        });
      }
    };

    fetchUserData();
  }, [getSingleUser, id]);

  const handleResetPassword = async () => {
    if (!singleUser?.email) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No email associated with this user.",
      });
      return;
    }

    try {
      const result = await resetPassword(singleUser.email);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Password reset instructions have been sent to the user's email.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: result.error || "Failed to reset password",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while resetting the password.",
      });
    }
  };

  const handleTabChange = (tabIndex) => {
    setState((prevState) => ({ ...prevState, activeTab: tabIndex }));
  };

  const handleEdit = () => {
    history.push(`/${tenantData?.tenant_schema_name}/settings/user/${id}/edit`);
  };

  // Format boolean values for display
  const formatBoolean = (value) => (value ? "Yes" : "No");

  // Format language for display
  const formatLanguage = (lang) => {
    if (lang === "en") return "English";
    return lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : "Not provided";
  };
  console.log("singleUser", singleUser);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>
          Loading user data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="80vh"
        textAlign="center"
        p={3}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Data Load Error
        </Typography>
        <Typography variant="body1" mb={3}>
          {error.message || "Failed to load user information"}
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

  if (!singleUser) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Typography variant="h5">No user information available</Typography>
      </Box>
    );
  }
  console.log(singleUser);
  return (
    <Box p={6}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight={500}>
          User Profile
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{
            backgroundColor: "#3B7CED",
            color: "white",
            "&:hover": { backgroundColor: "#2d63c0" },
          }}
        >
          Edit Information
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between">
        <Box color="#A9B3BC">
          {/* Tab Buttons */}
          <Button
            variant="outlined"
            color={state.activeTab === 0 ? "primary" : "inherit"}
            onClick={() => handleTabChange(0)}
            sx={{
              borderRadius: "4px 4px 0 0",
              borderBottom:
                state.activeTab === 0 ? "2px solid #3B7CED" : "none",
            }}
          >
            Basic Settings
          </Button>
          <Button
            variant="outlined"
            color={state.activeTab === 1 ? "primary" : "inherit"}
            onClick={() => handleTabChange(1)}
            sx={{
              borderRadius: "4px 4px 0 0",
              borderBottom:
                state.activeTab === 1 ? "2px solid #3B7CED" : "none",
            }}
          >
            Access Rights
          </Button>
        </Box>
        <Box>
          <Button
            variant="text"
            startIcon={<SettingsIcon size={16} />}
            label="Reset Password"
            onClick={handleResetPassword}
          >
            Reset password
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "4px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Basic Settings Tab */}
        {state.activeTab === 0 && (
          <Box
            borderRadius="4px"
            backgroundColor="white"
            boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
          >
            {/* Profile Section */}
            <Box
              p={3}
              display="flex"
              gap={4}
              alignItems="center"
              borderBottom="1px solid #E2E6E9"
            >
              {singleUser.user_image ? (
                <img
                  src={`data:image/png;base64,${singleUser.user_image}`}
                  alt="User"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #E2E6E9",
                  }}
                />
              ) : (
                <Box
                  width={120}
                  height={120}
                  borderRadius="50%"
                  bgcolor="#F5F7FA"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  border="1px dashed #C6CCD2"
                >
                  <Typography color="#8C9AA8" fontSize={12}>
                    No photo
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography fontSize={14} color="#8C9AA8">
                  Full Name
                </Typography>
                <Typography fontSize={24} color="#1A1A1A">
                  {singleUser.first_name} {singleUser.last_name}
                </Typography>

                <Typography fontSize={14} color="#8C9AA8" mt={2}>
                  Role
                </Typography>
                <Typography fontSize={18} color="#1A1A1A">
                  {singleUser.company_role_details?.name || "Not provided"}
                </Typography>
              </Box>
            </Box>

            {/* Contact Information */}
            <Box p={3} borderBottom="1px solid #E2E6E9">
              <Typography
                color="#3B7CED"
                fontSize="20px"
                fontWeight={500}
                mb={3}
              >
                Contact Information
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography fontSize={14} color="#8C9AA8">
                    Email
                  </Typography>
                  <Typography fontSize={18} color="#1A1A1A">
                    {singleUser.email || "Not provided"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontSize={14} color="#8C9AA8">
                    Phone Number
                  </Typography>
                  <Typography fontSize={18} color="#1A1A1A">
                    {singleUser.phone_number || "Not provided"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Preferences */}
            <Box p={3} borderBottom="1px solid #E2E6E9">
              <Typography
                color="#3B7CED"
                fontSize="20px"
                fontWeight={500}
                mb={3}
              >
                Preferences
              </Typography>

              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Typography fontSize={14} color="#8C9AA8">
                    Language
                  </Typography>
                  <Typography fontSize={18} color="#1A1A1A">
                    {formatLanguage(singleUser.language)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography fontSize={14} color="#8C9AA8">
                    Timezone
                  </Typography>
                  <Typography fontSize={18} color="#1A1A1A">
                    {singleUser.timezone || "Not provided"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography fontSize={14} color="#8C9AA8">
                    In-App Notifications
                  </Typography>
                  <Typography fontSize={18} color="#1A1A1A">
                    {formatBoolean(singleUser.in_app_notifications)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography fontSize={14} color="#8C9AA8">
                    Email Notifications
                  </Typography>
                  <Typography fontSize={18} color="#1A1A1A">
                    {formatBoolean(singleUser.email_notifications)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Signature */}
            <Box p={3}>
              <Typography
                color="#3B7CED"
                fontSize="20px"
                fontWeight={500}
                mb={3}
              >
                Signature
              </Typography>

              {singleUser.signature ? (
                <Box
                  border="1px solid #E2E6E9"
                  borderRadius="4px"
                  p={2}
                  maxWidth={300}
                >
                  <img
                    src={`data:image/png;base64,${singleUser.signature}`}
                    alt="Signature"
                    style={{ maxWidth: "100%" }}
                  />
                </Box>
              ) : (
                <Typography color="#8C9AA8" fontStyle="italic">
                  No signature available
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Access Rights Tab */}
        {state.activeTab === 1 && (
          <Box p={4}>
            <Box
              sx={{
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
                padding: "16px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography color="#3B7CED" fontSize="20px" pb={2}>
                  Access Rights
                </Typography>
              </Box>

              <Box
                display="flex"
                width="100%"
                alignItems="center"
                gap={6}
                my={4}
              >
                <Grid item xs={1}>
                  {singleUser.user_image ? (
                    <img
                      src={`data:image/png;base64,${singleUser.user_image}`}
                      alt="User"
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: "20px",
                        objectFit: "cover",
                        border: "1px solid #E2E6E9",
                      }}
                    />
                  ) : (
                    <Box
                      width={120}
                      height={120}
                      borderRadius="20px"
                      bgcolor="#F5F7FA"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      border="1px dashed #C6CCD2"
                    >
                      <Typography color="#8C9AA8" fontSize={12}>
                        No photo
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Box
                  maxWidth={450}
                  flex={1}
                  sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <Box>
                    <Typography variant="h6" fontSize="16px" color="#B3B3B3">
                      Name
                    </Typography>
                    <Typography color="#1A1A1A">
                      {singleUser?.first_name} {singleUser?.last_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h6" fontSize="16px" color="#B3B3B3">
                      Email
                    </Typography>
                    <Typography color="#1A1A1A">{singleUser?.email}</Typography>
                  </Box>
                </Box>
              </Box>

              <Box backgroundColor="white">
                <Box color="#A9B3BC" pb={4}>
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
                    Preferences
                  </Button>
                  <Button variant="outlined" color="inherit" size="large">
                    Sales Preferences
                  </Button>
                </Box>

                <Typography color="#3B7CED" fontSize="20px" pb={2}>
                  Application Accesses
                </Typography>

                {singleUser?.application_accesses?.map((access, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    mb={2}
                    maxWidth={1250}
                  >
                    <Typography
                      variant="subtitle2"
                      whiteSpace="nowrap"
                      fontSize="16px"
                      minWidth={200}
                    >
                      {access.application}
                    </Typography>
                    <Typography whiteSpace="nowrap" minWidth={180}>
                      {access.group_name}
                    </Typography>
                    <Typography whiteSpace="nowrap" minWidth={250}>
                      Access Code: {access.access_code}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserInfo;

// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   Typography,
//   CircularProgress,
//   Grid,
//   Chip,
// } from "@mui/material";
// import Swal from "sweetalert2";
// import { useUser } from "../../../../context/Settings/UserContext";
// import { useParams, useHistory } from "react-router-dom";
// import EditIcon from "@mui/icons-material/Edit";

// const UserInfo = () => {
//   const history = useHistory();
//   const [state, setState] = useState({ activeTab: 0 });
//   const { getSingleUser, singleUser, isLoading, error } = useUser();
//   const { id } = useParams();

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         await getSingleUser(id);
//       } catch (err) {
//         Swal.fire({
//           icon: "error",
//           title: "Data Load Error",
//           text: `Failed to load user data: ${err.message || "Unknown error"}`,
//         });
//       }
//     };

//     fetchUserData();
//   }, [getSingleUser, id]);

//   const handleTabChange = (tabIndex) => {
//     setState((prevState) => ({ ...prevState, activeTab: tabIndex }));
//   };

//   const handleEdit = () => {
//     history.push(`/settings/user/edit/${id}`);
//   };

//   // Format boolean values for display
//   const formatBoolean = (value) => (value ? "Yes" : "No");

//   // Format language for display
//   const formatLanguage = (lang) => {
//     if (lang === "en") return "English";
//     return lang ? lang.charAt(0).toUpperCase() + lang.slice(1) : "Not provided";
//   };

//   if (isLoading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         height="80vh"
//       >
//         <CircularProgress size={60} />
//         <Typography variant="h6" ml={2}>
//           Loading user data...
//         </Typography>
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box
//         display="flex"
//         flexDirection="column"
//         justifyContent="center"
//         alignItems="center"
//         height="80vh"
//         textAlign="center"
//         p={3}
//       >
//         <Typography variant="h5" color="error" gutterBottom>
//           Data Load Error
//         </Typography>
//         <Typography variant="body1" mb={3}>
//           {error.message || "Failed to load user information"}
//         </Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => window.location.reload()}
//         >
//           Retry
//         </Button>
//       </Box>
//     );
//   }

//   if (!singleUser) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         height="80vh"
//       >
//         <Typography variant="h5">No user information available</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box p={6}>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={4}
//       >
//         <Typography variant="h4" fontWeight={500}>
//           User Profile
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<EditIcon />}
//           onClick={handleEdit}
//           sx={{
//             backgroundColor: "#3B7CED",
//             color: "white",
//             "&:hover": { backgroundColor: "#2d63c0" },
//           }}
//         >
//           Edit Information
//         </Button>
//       </Box>

//       {/* Tab Buttons */}
//       <Box color="#A9B3BC" mb={2}>
//         <Button
//           variant="outlined"
//           color={state.activeTab === 0 ? "primary" : "inherit"}
//           onClick={() => handleTabChange(0)}
//           sx={{
//             borderRadius: "4px 4px 0 0",
//             borderBottom: state.activeTab === 0 ? "2px solid #3B7CED" : "none",
//           }}
//         >
//           Basic Settings
//         </Button>
//         <Button
//           variant="outlined"
//           color={state.activeTab === 1 ? "primary" : "inherit"}
//           onClick={() => handleTabChange(1)}
//           sx={{
//             borderRadius: "4px 4px 0 0",
//             borderBottom: state.activeTab === 1 ? "2px solid #3B7CED" : "none",
//           }}
//         >
//           Access Rights
//         </Button>
//       </Box>

//       {/* Basic Settings Tab */}
//       {state.activeTab === 0 && (
//         <Box
//           border="1px solid #E2E6E9"
//           borderRadius="4px"
//           backgroundColor="white"
//           boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
//         >
//           {/* Profile Section */}
//           <Box
//             p={3}
//             display="flex"
//             gap={4}
//             alignItems="center"
//             borderBottom="1px solid #E2E6E9"
//           >
//             {singleUser.user_image ? (
//               <img
//                 src={`data:image/png;base64,${singleUser.user_image}`}
//                 alt="User"
//                 style={{
//                   width: 120,
//                   height: 120,
//                   borderRadius: "50%",
//                   objectFit: "cover",
//                   border: "1px solid #E2E6E9",
//                 }}
//               />
//             ) : (
//               <Box
//                 width={120}
//                 height={120}
//                 borderRadius="50%"
//                 bgcolor="#F5F7FA"
//                 display="flex"
//                 justifyContent="center"
//                 alignItems="center"
//                 border="1px dashed #C6CCD2"
//               >
//                 <Typography color="#8C9AA8" fontSize={12}>
//                   No photo
//                 </Typography>
//               </Box>
//             )}

//             <Box>
//               <Typography fontSize={14} color="#8C9AA8">
//                 Full Name
//               </Typography>
//               <Typography fontSize={24} color="#1A1A1A">
//                 {singleUser.first_name} {singleUser.last_name}
//               </Typography>

//               <Typography fontSize={14} color="#8C9AA8" mt={2}>
//                 Role
//               </Typography>
//               <Typography fontSize={18} color="#1A1A1A">
//                 {singleUser.company_role_details?.name || "Not provided"}
//               </Typography>
//             </Box>
//           </Box>

//           {/* Contact Information */}
//           <Box p={3} borderBottom="1px solid #E2E6E9">
//             <Typography color="#3B7CED" fontSize="20px" fontWeight={500} mb={3}>
//               Contact Information
//             </Typography>

//             <Grid container spacing={4}>
//               <Grid item xs={12} md={6}>
//                 <Typography fontSize={14} color="#8C9AA8">
//                   Email
//                 </Typography>
//                 <Typography fontSize={18} color="#1A1A1A">
//                   {singleUser.email || "Not provided"}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Typography fontSize={14} color="#8C9AA8">
//                   Phone Number
//                 </Typography>
//                 <Typography fontSize={18} color="#1A1A1A">
//                   {singleUser.phone_number || "Not provided"}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Preferences */}
//           <Box p={3} borderBottom="1px solid #E2E6E9">
//             <Typography color="#3B7CED" fontSize="20px" fontWeight={500} mb={3}>
//               Preferences
//             </Typography>

//             <Grid container spacing={4}>
//               <Grid item xs={12} md={4}>
//                 <Typography fontSize={14} color="#8C9AA8">
//                   Language
//                 </Typography>
//                 <Typography fontSize={18} color="#1A1A1A">
//                   {formatLanguage(singleUser.language)}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <Typography fontSize={14} color="#8C9AA8">
//                   Timezone
//                 </Typography>
//                 <Typography fontSize={18} color="#1A1A1A">
//                   {singleUser.timezone || "Not provided"}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <Typography fontSize={14} color="#8C9AA8">
//                   In-App Notifications
//                 </Typography>
//                 <Typography fontSize={18} color="#1A1A1A">
//                   {formatBoolean(singleUser.in_app_notifications)}
//                 </Typography>
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <Typography fontSize={14} color="#8C9AA8">
//                   Email Notifications
//                 </Typography>
//                 <Typography fontSize={18} color="#1A1A1A">
//                   {formatBoolean(singleUser.email_notifications)}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Box>

//           {/* Signature */}
//           <Box p={3}>
//             <Typography color="#3B7CED" fontSize="20px" fontWeight={500} mb={3}>
//               Signature
//             </Typography>

//             {singleUser.signature ? (
//               <Box
//                 border="1px solid #E2E6E9"
//                 borderRadius="4px"
//                 p={2}
//                 maxWidth={300}
//               >
//                 <img
//                   src={`data:image/png;base64,${singleUser.signature}`}
//                   alt="Signature"
//                   style={{ maxWidth: "100%" }}
//                 />
//               </Box>
//             ) : (
//               <Typography color="#8C9AA8" fontStyle="italic">
//                 No signature available
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       )}

//       {/* Access Rights Tab */}
//       {state.activeTab === 1 && (
//         <Box
//           border="1px solid #E2E6E9"
//           borderRadius="4px"
//           backgroundColor="white"
//           boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
//         >
//           <Box p={3} borderBottom="1px solid #E2E6E9">
//             <Typography color="#3B7CED" fontSize="20px" fontWeight={500}>
//               Access Rights
//             </Typography>
//           </Box>

//           <Box p={3} display="flex" width="100%" alignItems="center" gap={6}>
//             {singleUser.user_image ? (
//               <img
//                 src={`data:image/png;base64,${singleUser.user_image}`}
//                 alt="User"
//                 style={{
//                   width: 120,
//                   height: 120,
//                   borderRadius: "20px",
//                   objectFit: "cover",
//                   border: "1px solid #E2E6E9",
//                 }}
//               />
//             ) : (
//               <Box
//                 width={120}
//                 height={120}
//                 borderRadius="20px"
//                 bgcolor="#F5F7FA"
//                 display="flex"
//                 justifyContent="center"
//                 alignItems="center"
//                 border="1px dashed #C6CCD2"
//               >
//                 <Typography color="#8C9AA8" fontSize={12}>
//                   No photo
//                 </Typography>
//               </Box>
//             )}

//             <Box>
//               <Typography fontSize={14} color="#8C9AA8">
//                 Full Name
//               </Typography>
//               <Typography fontSize={20} color="#1A1A1A">
//                 {singleUser.first_name} {singleUser.last_name}
//               </Typography>

//               <Typography fontSize={14} color="#8C9AA8" mt={2}>
//                 Role
//               </Typography>
//               <Typography fontSize={18} color="#1A1A1A">
//                 {singleUser.company_role_details?.name || "Not provided"}
//               </Typography>
//             </Box>
//           </Box>

//           <Box p={3} backgroundColor="white">
//             <Typography color="#3B7CED" fontSize="20px" fontWeight={500} mb={3}>
//               Application Accesses
//             </Typography>

//             {singleUser.application_accesses?.length > 0 ? (
//               <Box>
//                 {singleUser.application_accesses.map((access, index) => (
//                   <Box
//                     key={index}
//                     display="flex"
//                     alignItems="center"
//                     gap={4}
//                     mb={3}
//                     p={2}
//                     border="1px solid #E2E6E9"
//                     borderRadius="4px"
//                     bgcolor="#F9FAFB"
//                   >
//                     <Box flex={1}>
//                       <Typography fontSize={14} color="#8C9AA8">
//                         Application
//                       </Typography>
//                       <Typography
//                         fontSize={16}
//                         color="#1A1A1A"
//                         textTransform="capitalize"
//                       >
//                         {access.application}
//                       </Typography>
//                     </Box>

//                     <Box flex={1}>
//                       <Typography fontSize={14} color="#8C9AA8">
//                         Group
//                       </Typography>
//                       <Typography fontSize={16} color="#1A1A1A">
//                         {access.group_name}
//                       </Typography>
//                     </Box>

//                     <Box flex={1}>
//                       <Typography fontSize={14} color="#8C9AA8">
//                         Access Code
//                       </Typography>
//                       <Chip
//                         label={access.access_code}
//                         sx={{
//                           backgroundColor: "#F0F7FF",
//                           color: "#3B7CED",
//                           fontWeight: 500,
//                         }}
//                       />
//                     </Box>
//                   </Box>
//                 ))}
//               </Box>
//             ) : (
//               <Typography color="#8C9AA8" fontStyle="italic">
//                 No access rights defined
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default UserInfo;
