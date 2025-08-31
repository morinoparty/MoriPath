import { css } from "@/styled-system/css";

export const Layout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <div
            className={css({
                maxWidth: "md",
                margin: "0 auto",
                textStyle: "body",
                bgColor: "var(--chakra-colors-bg-subtle)",
            })}
        >
            <main>{children}</main>
        </div>
    );
};
