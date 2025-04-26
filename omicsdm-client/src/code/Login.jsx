/**
  Helper functions for the Login

  This file is part of omicsdm-client

  Last modified: Jan/04/2024

  Copyright (C) 2023-2024 Ivo Christopher Leist - CNAG (Ivo.leist@cnag.eu)

  License: GPL-3.0 license
*/

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Typography } from "@mui/material";
import Keycloak from "keycloak-js";

import auth from "./Auth";
import { useSession } from "./SessionContext";

const kcConfig = {
  realm: "Shinyproxy",
  "auth-server-url": "http://localhost:8080/",
  resource: "omicsdm",
};

// const kcConfig =
//   process.env.NODE_ENV === "production"
//     ? JSON.parse(window.REACT_APP_KC_CONFIG.replace(/'/g, '"'))
//     : JSON.parse(import.meta.env.VITE_KC_CONFIG);

const keycloakConfig = {
  realm: kcConfig.realm,
  url: kcConfig["auth-server-url"],
  clientId: kcConfig.resource,
};

// Helper function to extract query params from the hash fragment
const getRedirectFromHash = () => {
  const hash = window.location.hash;
  if (hash.includes("?")) {
    const queryString = hash.split("?")[1];
    const params = new URLSearchParams(queryString);
    return params.get("redirect");
  }
  return null;
};

const Login = () => {
  const { setSession } = useSession();
  const [loading, setLoading] = useState(true);

  const keycloakRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (keycloakRef.current) return; // Prevent re-initialization
    keycloakRef.current = new Keycloak(keycloakConfig);

    keycloakRef.current
      .init({ onLoad: "login-required" })
      .then((authResult) => {
        console.log("Keycloak init success:", authResult);
        auth.setToken({
          authenticated: authResult,
          keycloak: keycloakRef.current,
        });
        setLoading(false);

        const parsedIdToken = keycloakRef.current.idTokenParsed;
        console.log("Parsed ID Token:", parsedIdToken);
        setSession({
          user: {
            name: parsedIdToken.preferred_username,
            email: parsedIdToken.email,
            isAdmin: parsedIdToken.group.includes("/admin"),
            groups: parsedIdToken.group,
          },
        });

        if (authResult) {
          const redirect = getRedirectFromHash();
          navigate(redirect);
        }
      })
      .catch((error) => {
        console.error("Keycloak init failed:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Typography variant="body2" sx={{ padding: "0px 0px 0px 20px" }}>
        Authenticating...
      </Typography>
    );
  }
};

export default Login;
