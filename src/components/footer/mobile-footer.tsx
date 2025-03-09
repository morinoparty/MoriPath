"use client";
import { css } from "@/styled-system/css";
import { Bell, ClipboardCheck, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
    { icon: <Home />, label: "ホーム", link: "/", active: true },
    { icon: <ClipboardCheck />, label: "やること", link: "/todo", active: true },
    { icon: <Bell />, label: "おしらせ", link: "/notification", active: true },
    // { icon: <Hammer />, label: "WIP", link: "/message", active: false },
];

export const MobileFooter = () => {
    const currentPath = usePathname();
    return (
        <>
            <div
                className={css({
                    display: "flex",
                    width: "100%",
                    height: "var(--sizes-footer-height, 2.5rem)",
                    maxWidth: "lg",
                    margin: "0 auto",
                    justifyContent: "space-between",
                    alignItems: "center",
                    position: "fixed", // Changed to fixed
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px",
                    zIndex: 1000, // Ensure it stays on top
                    bgColor: "var(--colors-bg-base)",
                    borderTop: "1px solid var(--colors-border-default)",
                })}
            >
                {items.map((item) => (
                    <Link
                        href={item.active ? item.link : "#"}
                        key={item.link}
                        className={css({
                            display: "flex",
                            height: "48px",
                            width: "100%",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            color: item.link === currentPath ? "inherit" : "var(--colors-fg-disabled)",
                            pointerEvents: item.active ? "auto" : "none",
                        })}
                    >
                        <div
                            className={css({
                                width: "var(--spacings-radii-6, 24px)",
                                height: "var(--spacings-radii-6, 24px)",
                                flexShrink: 0,
                            })}
                        >
                            {item.icon}
                        </div>
                        <div
                            className={css({
                                display: "flex",
                                width: "100%",
                                height: "28px",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                flexShrink: 0,
                                textAlign: "center",
                                fontSize: "12px",
                                fontStyle: "normal",
                                fontWeight: 400,
                                lineHeight: "44px /* 366.667% */",
                            })}
                        >
                            {item.label}
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};
