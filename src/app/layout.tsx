import type { Metadata } from "next";
import "./globals.css";
import { css, cx } from "@/styled-system/css";
import { Layout } from "~/components/layout";
import { Provider } from "~/components/ui/provider";
export const metadata: Metadata = {
    title: "MoriPath - もりのパーティ ポータルアプリ",
    description: "もりのパーティ ポータルアプリ",
};

export const experimental_ppr = true;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja" suppressHydrationWarning>
            <body
                className={cx(
                    css({
                        textStyle: "body",
                        maxWidth: "1600px",
                        margin: "0 auto",
                    }),
                )}
            >
                <Provider>
                    <Layout>{children}</Layout>
                </Provider>
            </body>
        </html>
    );
}
