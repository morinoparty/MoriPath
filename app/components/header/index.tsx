import { Link } from "@tanstack/react-router";
import type { PropsWithChildren, ReactNode } from "react";
import { sva } from "../../../styled-system/css";
import type { SessionData } from "../../lib/server-functions";
import { LoginStatus } from "../login-status";
import { Notification } from "../notification";

import { ColorModeButton } from "../ui/color-mode";
import { PaletteButton } from "../ui/palette";

interface HeaderProps {
    session: SessionData;
}

const headerStyle = sva({
    slots: ["root", "logoLink", "logoImage", "actions"],
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
            aspectRatio: 34 / 40,
        },
        actions: {
            display: "flex",
            alignItems: "center",
            gap: "24px",
        },
    },
});

interface RootProps extends PropsWithChildren {
    className?: string;
}

const Root = ({ children, className }: RootProps) => {
    const style = headerStyle();
    return <div className={className ?? style.root}>{children}</div>;
};

interface LogoProps {
    to?: string;
    src?: string;
    alt?: string;
}

const Logo = ({ to = "/", src = "/moripa.svg", alt = "MoriPath" }: LogoProps) => {
    const style = headerStyle();
    return (
        <Link to={to} className={style.logoLink}>
            <img
                className={style.logoImage}
                src={src}
                alt={alt}
                width={200}
                height={200}
            />
        </Link>
    );
};

interface ActionsProps {
    children: ReactNode;
}

const Actions = ({ children }: ActionsProps) => {
    const style = headerStyle();
    return <div className={style.actions}>{children}</div>;
};

// Legacy default export for backward compatibility
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
            <div className={style.actions}>
                <ColorModeButton />
                <PaletteButton />
                <Notification />
                <LoginStatus.Root session={session}>
                    <LoginStatus.Menu.Root session={session}>
                        <LoginStatus.Menu.Trigger>
                            <LoginStatus.Avatar />
                        </LoginStatus.Menu.Trigger>
                        <LoginStatus.Menu.Content>
                            <LoginStatus.Menu.ProfileItem />
                            <LoginStatus.Menu.SettingsItem />
                            <LoginStatus.Menu.Separator />
                            <LoginStatus.Menu.LogoutItem />
                        </LoginStatus.Menu.Content>
                    </LoginStatus.Menu.Root>
                </LoginStatus.Root>
            </div>
        </div>
    );
};

// Compound Component exports
Header.Root = Root;
Header.Logo = Logo;
Header.Actions = Actions;
