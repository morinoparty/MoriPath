import { css } from "../../../styled-system/css";

export const Layout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <div
            className={css({
                maxWidth: "md",
                minHeight: "100vh",
                margin: "0 auto",
                textStyle: "body",
                bgColor: "var(--chakra-colors-color-palette-bg-subtle)",
                color: "var(--chakra-colors-color-palette-fg)",
            })}
        >
            <main>{children}</main>
        </div>
    );
};
