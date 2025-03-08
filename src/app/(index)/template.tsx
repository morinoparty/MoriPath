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
                    {children}
                    <Footer />
                </div>{" "}
            </Layout>
        </>
    );
}
