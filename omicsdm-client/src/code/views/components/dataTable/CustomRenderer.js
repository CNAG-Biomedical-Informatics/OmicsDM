import React from "react";
import { Button, Link, Tooltip } from "@mui/material";

const TruncatedLink = ({ href, children }) => {
  return (
    <Tooltip title={children} arrow>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          display: "inline-block",
          width: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
        }}
      >
        {children}
      </Link>
    </Tooltip>
  );
};

const UrlCopyBtn = ({ row }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => {
        navigator.clipboard.writeText(row.original.url);
      }}
    >
      Copy url
    </Button>
  )
}

export {
  TruncatedLink,
  UrlCopyBtn,
}