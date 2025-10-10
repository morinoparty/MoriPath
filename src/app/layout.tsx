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
            <head>
                <link
                    href="https://shogo82148.github.io/genjyuugothic-subsets/GenJyuuGothicL-P-Medium/GenJyuuGothicL-P-Medium.css"
                    type="text/css"
                    rel="stylesheet"
                />

                <link
                    href="https://shogo82148.github.io/genjyuugothic-subsets/GenJyuuGothicL-P-Bold/GenJyuuGothicL-P-Bold.css"
                    type="text/css"
                    rel="stylesheet"
                />
            </head>
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
