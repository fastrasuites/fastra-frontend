import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import { useUser } from "../../../../context/Settings/UserContext";
import { useParams } from "react-router-dom";

const UserInfo = () => {
  const [state, setState] = useState({ activeTab: 1 });
  const { getSingleUser, singleUser } = useUser();
  const { id } = useParams();

  useEffect(() => {
    getSingleUser(id);
  }, [getSingleUser, id]);

  const handleTabChange = (tabIndex) => {
    setState((prevState) => ({ ...prevState, activeTab: tabIndex }));
  };

  console.log(singleUser);

  return (
    <Box p={4}>
      <Typography variant="h5" fontSize="24px" mb={2}>
        New User
      </Typography>

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

      <Box
        sx={{
          border: "1px solid #E0E0E0",
          borderRadius: "4px",
          backgroundColor: "#FFFFFF",
          padding: "16px",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography color="#3B7CED" fontSize="20px" pb={2}>
            Access Rights
          </Typography>
          <Box>
            <Button>Cancel</Button>
            <Button variant="contained" disableElevation>
              Edit
            </Button>
          </Box>
        </Box>

        <Box display="flex" width="100%" alignItems="center" gap={6} my={4}>
          <Grid item xs={1}>
            <img
              src="https://i.pinimg.com/736x/6b/08/ab/6b08ab9dc9f305652657a5aead75742e.jpg"
              alt="profile"
              style={{
                width: "164px",
                height: "146px",
                borderRadius: "20px",
                objectFit: "cover",
              }}
            />
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
  );
};

export default UserInfo;
