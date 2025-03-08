import { css } from "@/styled-system/css";
import { Logo } from "~/components/logo/logo";
import { Status } from "./status";

export const MobileHeader = async () => {
    return (
        <div
            className={css({
                display: "flex",
                height: "var(--sizes-header-height)",
                margin: "0 auto",
                padding: "40px 0px",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
            })}
        >
            <Logo />
            <Status />
        </div>
    );
};
