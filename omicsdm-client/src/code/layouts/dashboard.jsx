import React from "react";
import { IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Outlet, useParams, useLocation, Navigate } from "react-router";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer, useActivePage, Account } from "@toolpad/core";

import { useSession } from "../SessionContext";
import Copyright from "./Copyright";
import AppTitle from "./AppTitle";
import AccountSwitcher from "./AccountSwitcher";

const ROUTES_NOT_REQUIRING_AUTH = ["/", "/home", "/login"];
const DOCS_LINK =
  "https://cnag-biomedical-informatics.github.io/omicsdm-documentation";
const REPO_LINK =
  "https://github.com/CNAG-Biomedical-Informatics/omicsdm-client";

 const customIconButton = (href, ariaLabel, IconComponent) => (
    <IconButton
      variant="contained"
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={ariaLabel}
    >
      <IconComponent />
    </IconButton>
);

export default function Layout() {
  const { session } = useSession();
  const location = useLocation();
  const activePage = useActivePage() || {};

  console.log("session", session);
  console.log("location.pathname", location.pathname);
  console.log(!session, "!session");
  if (!session) {
    console.log("session is NULL");
    console.log("location.pathname", location.pathname);
  }

  if (!session && !ROUTES_NOT_REQUIRING_AUTH.includes(location.pathname)) {
    const redirectTo = `/login?redirect=${location.pathname}`;
    return <Navigate to={redirectTo} replace />;
  }

  let title = activePage?.title;
  console.log("activePage", activePage);

  let analysisId = null;
  if (activePage.path === "/analyses/view") {
    const params = useParams();
    console.log("params", params);
    if (params.analysisId) {
      analysisId = params.analysisId;
    }
  }

  const breadcrumbs = [];
  if (analysisId) {
    title = "";
    const path = `${activePage.path}/${analysisId}`;
    breadcrumbs.push({
      title: `Analysis ${analysisId}`,
      path,
    });
  }

  return (
    <DashboardLayout
      slots={{
        appTitle: AppTitle,
        toolbarAccount: () => <>
          {customIconButton(DOCS_LINK, "Documentation", MenuBookIcon)}
          {customIconButton(REPO_LINK, "GitHub", GitHubIcon)}
          <Account 
            slots={{
              popoverContent: AccountSwitcher
            }}/>
        </> 
      }}
    >
      <PageContainer title={title} breadcrumbs={breadcrumbs}>
        <Outlet />
        <Copyright sx={{ my: 4 }} />
      </PageContainer>
    </DashboardLayout>
  );
}
