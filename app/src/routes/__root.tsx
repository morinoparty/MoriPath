import { TanStackDevtools } from "@tanstack/react-devtools";
import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Layout } from "../components/layout";
import { Provider } from "../components/ui/provider";
import { getMcApiUrlFn } from "../lib/server-functions/get-mc-api-url";
import appCss from "../style/app.css?url";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "MoriPath - もりのパーティ ポータルアプリ",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                type: "text/css",
                href: appCss,
            },
            {
                rel: "stylesheet",
                href: "https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap",
            },
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://shogo82148.github.io/genjyuugothic-subsets/GenJyuuGothicL-P-Medium/GenJyuuGothicL-P-Medium.css",
            },
            {
                rel: "stylesheet",
                type: "text/css",
                href: "https://shogo82148.github.io/genjyuugothic-subsets/GenJyuuGothicL-P-Bold/GenJyuuGothicL-P-Bold.css",
            },
        ],
    }),
    // MC_API_URL は deploy ごとにしか変わらないため再取得しない
    loader: async () => ({ mcApiUrl: await getMcApiUrlFn() }),
    staleTime: Number.POSITIVE_INFINITY,
    component: RootComponent,
});

function RootComponent() {
    const { mcApiUrl } = Route.useLoaderData();
    return (
        <RootDocument>
            <Provider mcApiUrl={mcApiUrl}>
                <Layout>
                    <Outlet />
                </Layout>
            </Provider>
        </RootDocument>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}

                {import.meta.env.DEV && (
                    <TanStackDevtools
                        config={{
                            position: "bottom-right",
                        }}
                        plugins={[
                            {
                                name: "Tanstack Router",
                                render: <TanStackRouterDevtoolsPanel />,
                            },
                        ]}
                    />
                )}
                <Scripts />
            </body>
        </html>
    );
}
