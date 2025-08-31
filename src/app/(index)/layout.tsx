import { Header } from "@/src/components/header";
import { Layout } from "@/src/components/layout";

export default function IndexLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Layout>
            <Header />
            {children}
        </Layout>
    );
}
