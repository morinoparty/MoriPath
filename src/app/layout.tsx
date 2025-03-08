import type { Metadata } from "next";
import "./globals.css";
import { css, cx } from "@/styled-system/css";
import { Footer } from "~/components/footer/footer";
import { Header } from "~/components/header/header";
import { fonts } from "~/lib/fonts";

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
                        // bgColor: "#EAF2EF",
                    }),
                    fonts,
                )}
            >
                {/*<ThemeProvider*/}
                {/*    enableSystem={false}*/}
                {/*    defaultTheme={"light"}*/}
                {/*    value={{*/}
                {/*        light: "light",*/}
                {/*        dark: "dark",*/}
                {/*    }}*/}
                {/*>*/}
                <div
                    className={css({
                        maxWidth: "lg",
                        margin: "0 auto",
                        height: "max(100vh, 100%)",
                        padding: "0 32px",
                        bgColor: "var(--colors-bg-base)",
                    })}
                >
                    <Header />
                    {children}
                    <Footer />
                </div>
                {/*</ThemeProvider>*/}
            </body>
        </html>
    );
}
