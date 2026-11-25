import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
    createRootRouteWithContext,
    HeadContent,
    Outlet,
    Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Layout } from "../components/layout";
import { Provider } from "../components/ui/provider";
import { getMcApiUrlFn } from "../lib/server-functions/get-mc-api-url";
import { getMinecraftAssetsUrlFn } from "../lib/server-functions/get-mc-assets-url";
import appCss from "../style/app.css?url";

// loader から TanStack Query のキャッシュを温められるよう、router の context の型を宣言する
interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                // viewport-fit=cover で env(safe-area-inset-*) を有効にし、TabBar をホームインジケーターの上に置く
                content:
                    "width=device-width, initial-scale=1, viewport-fit=cover",
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
                // 表示名 (fonts.display) 用の Outfit SemiBold
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Outfit:wght@600&display=swap",
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
    // MC_API_URL / MC_ASSETS_URL は deploy ごとにしか変わらないため再取得しない
    loader: async () => {
        const [mcApiUrl, minecraftAssetsUrl] = await Promise.all([
            getMcApiUrlFn(),
            getMinecraftAssetsUrlFn(),
        ]);
        return { mcApiUrl, minecraftAssetsUrl };
    },
    staleTime: Number.POSITIVE_INFINITY,
    component: RootComponent,
});

function RootComponent() {
    const { mcApiUrl, minecraftAssetsUrl } = Route.useLoaderData();
    return (
        <RootDocument>
            <Provider
                mcApiUrl={mcApiUrl}
                minecraftAssetsUrl={minecraftAssetsUrl}
            >
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
