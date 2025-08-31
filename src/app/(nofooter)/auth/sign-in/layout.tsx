import { Layout } from "@/src/components/layout";
import { css } from "@/styled-system/css";
export default function IndexLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Layout>
            <div
                className={css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minH: "calc(100vh)",
                })}
            >
                {children}
            </div>
        </Layout>
    );
}
