import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { TableActionButton } from "../../../components/dataTable/TopToolbar";

const ShareDataMenu = ({ table, setAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemClick = (action) => {
    if (action) {
      setAction(action);
      table.setCreatingRow(true); // Opens Material-React-Table dialog
    }
    setAnchorEl(null);
  };

  const menuItems = [
    { label: "Share", action: "share with groups" },
    { label: "Unshare", action: "unshare with groups" },
  ];

  return (
    <>
      <TableActionButton
        table={table}
        handleClick={handleMenuClick}
        startIcon={<ShareIcon />}
        btnText="Share/Unshare Selection"
        tooltip="Share/Unshare selection with all or selected groups"
      />
      <Menu
        id="shared-data-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {menuItems.map((item) => (
          <MenuItem key={item.action} onClick={() => handleItemClick(item.action)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ShareDataMenu;
