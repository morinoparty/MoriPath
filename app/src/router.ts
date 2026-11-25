import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchInterval: false,
                refetchIntervalInBackground: false,
            },
        },
    });
    const router = createRouter({
        routeTree,
        context: { queryClient },
        defaultPreload: "intent",
        // pendingComponent (スケルトン) は、すぐ終わる読み込みでは出さず、出したら点滅しない長さだけ残す
        defaultPendingMs: 250,
        defaultPendingMinMs: 400,
    });
    setupRouterSsrQueryIntegration({
        router,
        queryClient,
    });

    return router;
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
