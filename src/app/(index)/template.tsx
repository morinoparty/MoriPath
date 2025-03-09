import { css } from "@/styled-system/css";
import { Footer } from "~/components/footer/footer";
import { Header } from "~/components/header/header";
import { Layout } from "~/components/layout";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Layout>
                <div
                    className={css({
                        paddingBottom: "var(--sizes-footer-height)",
                    })}
                >
                    <Header />
                    <div
                        className={css({
                            minH: "calc(100vh - 80px - var(--sizes-footer-height))",
                        })}
                    >
                        {children}
                    </div>

                    <Footer />
                </div>{" "}
            </Layout>
        </>
    );
}
