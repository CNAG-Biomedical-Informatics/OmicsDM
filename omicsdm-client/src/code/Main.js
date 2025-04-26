/**
  Main function for the omicsdm-client application.

  This file is part of omicsdm

  Last modified: Feb/23/2025

  Copyright (C) 2024-2025 Ivo Christopher Leist - CNAG (Ivo.leist@cnag.eu)

  License: GPL-3.0 license
*/

import React from "react";

import { HashRouter } from "react-router";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from "./App";

const queryClient = new QueryClient()

export default function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster />
        <App />
      </HashRouter>
    </QueryClientProvider>
  );
}