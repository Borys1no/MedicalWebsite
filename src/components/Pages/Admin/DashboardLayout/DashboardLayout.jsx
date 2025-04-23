import React from "react";
import { Box, Toolbar } from "@mui/material";
import SideBar from "../SideBar/SideBar";
const drawerWidth = 240;

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
