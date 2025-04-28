import { Header } from "~/components/header/header";
import { Layout } from "~/components/layout";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Layout>
        <Header />
        {children}
      </Layout>
    </>
  );
}
