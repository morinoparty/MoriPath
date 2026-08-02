import type { ReactNode } from "react";
import { sva } from "../../../../../styled-system/css";

interface CardSquareProps {
    icon: ReactNode;
    label: string;
    value: string;
}

const cardSquareStyle = sva({
    slots: ["root", "header", "iconWrapper", "label", "value"],
    base: {
        root: {
            bg: "white",
            borderRadius: "24px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            aspectRatio: "1",
        },
        header: {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
        },
        iconWrapper: {
            color: "var(--chakra-colors-color-palette-500)",
            width: "24px",
            height: "24px",
        },
        label: {
            color: "var(--chakra-colors-color-palette-500)",
            fontSize: "16px",
            fontWeight: "bold",
        },
        value: {
            color: "var(--chakra-colors-color-palette-700)",
            fontSize: "28px",
            fontWeight: "bold",
        },
    },
});

export const CardSquare: React.FC<CardSquareProps> = ({
    icon,
    label,
    value,
}) => {
    const style = cardSquareStyle();

    return (
        <div className={style.root}>
            <div className={style.header}>
                <div className={style.iconWrapper}>{icon}</div>
                <p className={style.label}>{label}</p>
            </div>
            <p className={style.value}>{value}</p>
        </div>
    );
};
