import React from "react";
import { createHashRouter, useParams } from "react-router";

// icons
import HomeIcon from "@mui/icons-material/Home";

// Data submission icons
import AddBoxIcon from "@mui/icons-material/AddBox"; //Add project
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder"; //Add dataset
import FileUploadIcon from "@mui/icons-material/FileUpload"; //Upload files

// Data management icons
import BackupTableIcon from "@mui/icons-material/BackupTable"; //Browse datasets
import DownloadingIcon from "@mui/icons-material/Downloading"; //Download files

// Data analysis icons
import PostAddIcon from "@mui/icons-material/PostAdd"; //Add analysis templates
import AddToQueueIcon from "@mui/icons-material/AddToQueue"; //Run analyses
import InsertChartIcon from "@mui/icons-material/InsertChart"; //View analyses

// admin icons
import AppRegistrationIcon from "@mui/icons-material/AppRegistration"; //Edit project metadata
import EditNoteIcon from "@mui/icons-material/EditNote"; //Edit dataset metadata
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline"; //Edit file metadata

// views
import Home from "./views/home/Home";

// Data submission, management and analysis
import Submit from "./views/submission/components/Submit";
import SelectProject from "./views/submission/submit-datasets/SelectProject";
import SummaryInserted from "./views/submission/submit-datasets/summary-inserted/SummaryInserted";
import TableViewFunctional from "./views/management/components/TableViewFunctional";

// Data analysis
import AnalysisTemplates from "./views/management/admin-view/AnalysisTemplates";
import AnalysisSubmissionView from "./views/analysis/submission/AnalysisSubmissionView";
import AnalysisResultsView from "./views/analysis/AnalysisResultsView";

import App from "./App";
import Layout from "./layouts/dashboard";
import Error40X from "./errors/Error40X";
import Login from "./Login";

import auth from "./Auth";

const ROUTES_NOT_REQUIRING_AUTH = ["home", "login"];

const navAndComponents = [
  {
    segment: "home",
    title: "Home",
    icon: <HomeIcon />,
    Component: Home,
    requiresAuth: false,
  },
  {
    kind: "header",
    title: "Data Submission",
  },
  {
    segment: "submitprojects",
    title: "Create Projects",
    icon: <AddBoxIcon />,
    Component: Submit,
    requiresAdmin: true,
  },
  {
    segment: "createdatasets/selectproject",
    title: "Create Datasets",
    icon: <CreateNewFolderIcon />,
    Component: SelectProject,
  },
  {
    segment: "uploadfiles/selectproject",
    title: "Upload Files",
    icon: <FileUploadIcon />,
    Component: SelectProject,
  },
  { kind: "divider" },
  { kind: "header", title: "Data Management" },
  {
    segment: "datasets",
    title: "Browse and Share Datasets",
    icon: <BackupTableIcon />,
    Component: TableViewFunctional,
  },
  {
    segment: "files",
    title: "Download Files",
    icon: <DownloadingIcon />,
    Component: TableViewFunctional,
  },
  { kind: "divider" },
  { kind: "header", title: "Analysis" },
  {
    segment: "admin/analysistemplates",
    title: "Add Analysis Templates",
    icon: <PostAddIcon />,
    requiresAdmin: true,
    Component: AnalysisTemplates,
  },
  {
    segment: "configureanalysis",
    title: "Run Analyses",
    icon: <AddToQueueIcon />,
    Component: AnalysisSubmissionView,
  },
  {
    segment: "analyses/view/:analysisId?",
    title: "View Analyses",

    icon: <InsertChartIcon />,
    pattern: "analyses/view{/:analysisId}?",
    Component: () => {
      const { analysisId } = useParams();
      return analysisId ? <AnalysisResultsView /> : <TableViewFunctional />;
    },
  },
  { kind: "divider", requiresAdmin: true },
  { kind: "header", title: "Administrate", requiresAdmin: true },
  {
    segment: "admin/projects",
    title: "Edit Project Metadata",
    icon: <AppRegistrationIcon />,
    requiresAdmin: true,
    Component: TableViewFunctional,
  },
  {
    segment: "admin/datasets",
    title: "Edit Dataset Metadata",
    icon: <EditNoteIcon />,
    requiresAdmin: true,
    Component: TableViewFunctional,
  },
  {
    segment: "admin/files",
    title: "Edit File Metadata",
    icon: <DriveFileRenameOutlineIcon />,
    requiresAdmin: true,
    Component: TableViewFunctional,
  },
];

// factory function that returns a loader
// without it, the loader would be called
// at the time of the route creation
function createEnforceLoginLoader(path, navAndComponents) {
  return function loader() {
    // console.log("protectedLoader path", path);
    // console.log("auth.user.authenticated", auth.user.authenticated);
    // if (!auth.user.authenticated) {
    //   return redirect(`/login?redirect=/${path}`);
    // }

    const navItem = navAndComponents.find((item) => item.segment === path);
    const isNotAdmin = !auth.getUserGroups().includes("admin");
    if (navItem?.requiresAdmin && isNotAdmin) {
      console.log("Forbidden");
      throw new Response("Forbidden", { status: 403 });
    }
    return null;
  };
}

const generateRoutes = (navAndComponents, routesNotInNav) => {
  const navigationWithoutHeaders = navAndComponents.filter(
    (item) => item.Component
  );
  console.log("generateRoutes navigation", navigationWithoutHeaders);

  const createRouteObject = (path, Component) => {
    const routeObject = { path, Component };
    if (ROUTES_NOT_REQUIRING_AUTH.includes(path)) {
      return routeObject;
    }

    routeObject.loader = createEnforceLoginLoader(path, navAndComponents);
    routeObject.errorElement = <Error40X errorCode={403} />;
    return routeObject;
  };

  const routesWithNav = navigationWithoutHeaders.map((item) => {
    return createRouteObject(item.segment, item.Component);
  });

  const routesWithoutNav = Object.values(routesNotInNav).flatMap(
    ({ path, Component }) =>
      (Array.isArray(path) ? path : [path]).map((p) =>
        createRouteObject(p, Component)
      )
  );

  const mergedRoutes = [...routesWithNav, ...routesWithoutNav];
  console.log("mergedRoutes", mergedRoutes);
  return mergedRoutes;
};

const routesNotInNav = {
  submit: {
    path: ["submitdatasets", "submitfiles"],

    Component: Submit,
  },
  summaryInserted: {
    path: ["projectsubmitted", "datasetsubmitted", "filesubmitted"],
    Component: SummaryInserted,
  },
  Login: {
    path: "login",
    Component: Login,
  },
};

const generateNavigation = (navAndComponents) => {
  // check each item in the navAndComponents and check if item.segment contains ":"
  // if it does remove everything after ":" including ":"
  navAndComponents.forEach((item) => {
    console.log("item", item);
    const { segment } = item;
    if (segment?.includes(":")) {
      item.segment = segment.split("/:")[0];
    }
  });

  const navMap = {
    userNav: navAndComponents.filter((item) => !item.requiresAdmin),
    adminNav: navAndComponents,
  };

  // drop in both arrays the keys "Component" and "requiresAdmin" and "requiresAuth"
  const dropKeys = (nav) => {
    return nav.map(
      ({ Component, requiresAdmin, requiresAuth, ...rest }) => rest
    );
  };

  return {
    userNav: dropKeys(navMap.userNav),
    adminNav: dropKeys(navMap.adminNav),
  };
};

const routes = generateRoutes(navAndComponents, routesNotInNav);
console.log("routes", routes);

const hashRouter = createHashRouter([
  {
    Component: App, // root layout route
    errorElement: <Error40X />,
    children: [
      {
        path: "/",
        Component: Layout,
        children: generateRoutes(navAndComponents, routesNotInNav),
      },
    ],
  },
]);

console.log("hashRouter", hashRouter);

const userAndAdminNav = generateNavigation(navAndComponents);
export { hashRouter, userAndAdminNav };
