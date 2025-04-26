/**
  Index.js for the omicsdm-client application.

  This file is part of omicsdm

  Last modified: Feb/23/2025

  Copyright (C) 2024-2025 Ivo Christopher Leist - CNAG (Ivo.leist@cnag.eu)

  License: GPL-3.0 license
*/
import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
// import { createBrowserRouter, RouterProvider } from 'react-router';
import "./index.css";
// import Main from "./code/Main";

import Home from "./code/views/home/Home";

import App from "./code/App2";
import Layout from './code/layouts/dashboard'

const container = document.getElementById('root');
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    console.error('Uncaught error:', error
      + '\nError info:', errorInfo);
  },
  onCaughtError: (error, errorInfo) => {
    console.error('Caught error:', error
      + '\nError info:', errorInfo);
  }
});

// const router = createHashRouter([
//   {
//     Component: App2, // root layout route
//   },
// ]);

const router = createHashRouter([
  {
    Component: App, // root layout route
    children: [
      {
        path: '/',
        Component: Layout,
        children: [
          { path: '/', component: Home },
        ],
      },
    ],
  },
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
