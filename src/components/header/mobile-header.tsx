import { css } from "@/styled-system/css";
import { Logo } from "~/components/logo/logo";
import { LoginButton } from "./login-button";

export const MobileHeader = async () => {
    return (
        <div
            className={css({
                display: "flex",
                height: "56px",
                margin: "0 auto",
                padding: "40px 0px",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
            })}
        >
            <Logo />
            <LoginButton />
        </div>
    );
};
