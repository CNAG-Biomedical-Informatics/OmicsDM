/**
  Index.js for the omicsdm-client application.

  This file is part of omicsdm

  Last modified: Feb/23/2025

  Copyright (C) 2024-2025 Ivo Christopher Leist - CNAG (Ivo.leist@cnag.eu)

  License: GPL-3.0 license
*/
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import { hashRouter } from "./code/routesNavGenerator";

const container = document.getElementById("root");
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    console.error("Uncaught error:", error + "\nError info:", errorInfo);
  },
  onCaughtError: (error, errorInfo) => {
    console.error("Caught error:", error + "\nError info:", errorInfo);
  },
});

root.render(
  <StrictMode>
    <RouterProvider router={hashRouter} />
  </StrictMode>
);
