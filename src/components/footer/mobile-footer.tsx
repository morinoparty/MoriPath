import { css } from "@/styled-system/css";
import { Bell, Hammer, SquareKanban } from "lucide-react";
import Link from "next/link";

const items = [
    { icon: <Bell />, label: "おしらせ", link: "/notification", active: true },
    { icon: <SquareKanban />, label: "やること", link: "/todo", active: true },
    { icon: <Hammer />, label: "実装予定", link: "/message", active: false },
];

export const MobileFooter = () => {
    return (
        <div
            className={css({
                display: "flex",
                width: "100%",
                height: "48px",
                padding: "0px var(--spacings-radii-10, 40px)",
                justifyContent: "space-between",
                alignItems: "center",
                position: "absolute",
                bottom: 0,
                marginBottom: "8px",
            })}
        >
            {items.map((item, index) => (
                <Link
                    href={item.active ? item.link : "#"}
                    key={item.link}
                    className={css({
                        display: "flex",
                        height: "48px",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        color: item.active
                            ? "inherit"
                            : "var(--colors-fg-disabled)",
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
                            width: "48px",
                            height: "28px",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            flexShrink: 0,
                            textAlign: "right",
                            fontSize: "12px",
                            fontStyle: "normal",
                            fontWeight: 400,
                            lineHeight: "44px /* 366.667% */",
                            letterSpacing: "-0.72px",
                        })}
                    >
                        {item.label}
                    </div>
                </Link>
            ))}
        </div>
    );
};
