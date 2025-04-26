import React, { useState, useMemo, useCallback } from "react";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Outlet, useNavigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";

import { userAndAdminNav } from "./routesNavGenerator";
import ErrorFallback from "./errors/ErrorFallback";

import { SessionContext } from "./SessionContext";

import auth from "./Auth";

export default function App() {
  const nav = userAndAdminNav.adminNav;
  const navigate = useNavigate();
  console.log("nav", nav);

  const [session, setSession] = useState(null);

  const signIn = useCallback(() => {
    navigate("/login?redirect=/home");
  }, [navigate]);

  const signOut = useCallback(() => {
    auth.logout();
    setSession(null);
  }, [navigate]);

  const sessionContextValue = useMemo(
    () => ({ session, setSession }),
    [session, setSession]
  );

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ReactRouterAppProvider
        navigation={
          session
            ? session.user.isAdmin
              ? userAndAdminNav.adminNav
              : userAndAdminNav.userNav
            : userAndAdminNav.userNav
        }
        session={session}
        authentication={{ signIn, signOut }}
      >
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <QueryClientProvider client={new QueryClient()}>
            <ReactQueryDevtools />
            <Outlet />
          </QueryClientProvider>
        </ErrorBoundary>
      </ReactRouterAppProvider>
    </SessionContext.Provider>
  );
}
