import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router";

const menuItems = [
  { text: "Total Calendar", path: "/system/" },
  { text: "Training Calendar", path: "/system/trainings" },
  { text: "Executive Visits Calendar", path: "/system/executive-visits" },
  { text: "Activities Calendar", path: "/system/activities" },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer =
    (state: boolean | ((prevState: boolean) => boolean)) => () => {
      setOpen(state);
    };

  return (
    <>
      <IconButton
        onClick={toggleDrawer(!open)}
        sx={{
          position: "absolute",
          top: 35,
          left: 20,
          zIndex: 1300,
          backgroundColor: "white",
        }}
      >
        <MenuIcon fontSize={"large"}/>
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <List
          sx={{
            mt: 12,
          }}
        >
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
