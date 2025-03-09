import { cva } from "@/styled-system/css";

export const Layout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const layoutStyle = cva({
        base: {
            maxWidth: "lg",
            margin: "0 auto",
            padding: "0 24px",
            bgColor: "var(--colors-bg-base)",
        },
    });
    return (
        <div className={layoutStyle()}>
            <main>{children}</main>
        </div>
    );
};
