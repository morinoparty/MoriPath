import { Link } from "@tanstack/react-router";
import { sva } from "../../../styled-system/css";
import type { SessionData } from "../../lib/server-functions";
import { LoginStatus } from "../login-status";
import { Notification } from "../notification";

interface HeaderProps {
    session: SessionData;
}

export const headerStyle = sva({
    slots: ["root", "logoLink", "logoImage", "indicator"],
    base: {
        root: {
            display: "flex",
            height: "102px",
            margin: "0 auto",
            padding: "16px 24px 8px 24px",
            justifyContent: "space-between",
            alignItems: "flex-end",
            bgColor: "var(--chakra-colors-color-palette-500)",
            width: "100%",
            flexShrink: 0,
        },
        logoLink: {
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
        },
        logoImage: {
            width: "100%",
            height: "44px",
            fill: "red",
            aspectRatio: 34 / 40,
        },
        indicator: {
            display: "flex",
            alignItems: "center",
            gap: "24px",
        },
    },
});

export const Header = ({ session }: HeaderProps) => {
    const style = headerStyle();
    return (
        <div className={style.root}>
            <Link to="/" className={style.logoLink}>
                <img
                    className={style.logoImage}
                    src="/moripa.svg"
                    alt="MoriPath"
                    width={200}
                    height={200}
                />
            </Link>
            <div className={style.indicator}>
                <Notification />
                <LoginStatus session={session} />
            </div>
        </div>
    );
};
