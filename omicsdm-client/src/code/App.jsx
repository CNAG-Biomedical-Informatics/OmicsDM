import React, { useState, useMemo, useCallback } from "react";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { Outlet, useNavigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "react-error-boundary";

import { userAndAdminNav } from "./routesNavGenerator";
import ErrorFallback from "./errors/ErrorFallback";
import { SessionContext } from "./SessionContext";
import { SnackbarProvider } from "./snackbarContext";
import auth from "./Auth";

const queryClient = new QueryClient();

export default function App() {
  const navigate = useNavigate();
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

  const navigation = session
    ? session.user.isAdmin
      ? userAndAdminNav.adminNav
      : userAndAdminNav.userNav
    : userAndAdminNav.userNav;

  return (
    <SessionContext.Provider value={sessionContextValue}>
      <ReactRouterAppProvider
        navigation={navigation}
        session={session}
        authentication={{ signIn, signOut }}
      >
        <SnackbarProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools />
              <Outlet />
            </QueryClientProvider>
          </ErrorBoundary>
        </SnackbarProvider>
      </ReactRouterAppProvider>
    </SessionContext.Provider>
  );
}
