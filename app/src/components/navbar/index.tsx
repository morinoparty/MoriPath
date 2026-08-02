import { Link, useLocation } from "@tanstack/react-router";
import { Home, MapPin, User } from "lucide-react";
import type { ReactNode } from "react";
import { sva } from "../../../styled-system/css";

interface NavItemProps {
    to: string;
    icon: ReactNode;
    label: string;
    isActive?: boolean;
}

const navbarStyle = sva({
    slots: ["root", "container", "item", "icon", "label"],
    base: {
        root: {
            bg: "white",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            paddingTop: "12px",
            paddingBottom: "20px",
            paddingX: "32px",
            width: "100%",
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "md",
        },
        container: {
            display: "flex",
            alignItems: "center",
            width: "100%",
        },
        item: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            flex: 1,
            minWidth: 0,
            textDecoration: "none",
        },
        icon: {
            width: "24px",
            height: "24px",
            color: "var(--chakra-colors-color-palette-500)",
        },
        label: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "var(--chakra-colors-color-palette-500)",
            textAlign: "center",
            lineHeight: "1",
        },
    },
    variants: {
        active: {
            true: {
                icon: {
                    opacity: 1,
                },
            },
            false: {
                icon: {
                    opacity: 0.6,
                },
            },
        },
    },
});

const NavItem = ({ to, icon, label, isActive = false }: NavItemProps) => {
    const style = navbarStyle({ active: isActive });

    return (
        <Link to={to} className={style.item}>
            <div className={style.icon}>{icon}</div>
            <span className={style.label}>{label}</span>
        </Link>
    );
};

export const Navbar = () => {
    const location = useLocation();
    const style = navbarStyle();

    const isActive = (path: string) => {
        if (path === "/") {
            return location.pathname === "/";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className={style.root}>
            <div className={style.container}>
                <NavItem
                    to="/"
                    icon={<Home />}
                    label="ホーム"
                    isActive={isActive("/")}
                />
                <NavItem
                    to="/map"
                    icon={<MapPin />}
                    label="マップ"
                    isActive={isActive("/map")}
                />
                <NavItem
                    to="/my-page"
                    icon={<User />}
                    label="あなた"
                    isActive={isActive("/my-page")}
                />
            </div>
        </nav>
    );
};
