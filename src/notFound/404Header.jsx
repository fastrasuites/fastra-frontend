import React from "react";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from "../../src/image/logo.svg";

const Navbar404 = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "transparent",boxShadow: "none", borderBottom: "1px solid #ddd", padding: "10px 0" }}>
      <Container>
        <Toolbar disableGutters sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              <img src={Logo} alt="Logo" style={{ height: "40px" }} />
            </Link>
          </Typography>

          
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
             <button style={{ border: "2px solid #3b7ced", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", color: "#3b7ced", fontSize: "1rem", backgroundColor: "#fff" }}> Contact Us</button>
            </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar404;
