import { Text } from "@chakra-ui/react";
import { sva } from "../../../styled-system/css";

type Props = {
    uuid?: string;
    name?: string;
    size?: "xl" | "lg" | "md";
};

const playerMapStyle = sva({
    slots: ["root", "avatar", "name"],
    base: {
        root: {
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "8px",
            boxSizing: "border-box",
            bgColor: "var(--chakra-colors-color-palette-bg-subtle)",
            border: "2px solid var(--chakra-colors-white)",
            flexShrink: "0",
            minWidth: 0,
            overflow: "hidden",
        },
        avatar: {
            flexShrink: 0,
            borderRadius: "6px",
            objectFit: "cover",
            border: "0.5px solid color-mix(in oklab, var(--chakra-colors-border) 40%, transparent)",
        },
        name: {
            fontVariationSettings: "'wght' 600",
            fontWeight: "600",
            fontSize: "sm",
            color: "var(--chakra-colors-color-palette-fg)",
            flexShrink: 0,
            lineHeight: "1",
        },
    },
    variants: {
        size: {
            xl: {
                root: {
                    gap: "8px",
                    height: "52px",
                    padding: "0 12px 0 0",
                },
                avatar: {
                    width: "48px",
                    height: "48px",
                },
                name: {
                    fontSize: "xl",
                },
            },
            lg: {
                root: {
                    gap: "6px",
                    height: "36px",
                    padding: "0 8px 0 0",
                },
                avatar: {
                    width: "36px",
                    height: "36px",
                },
                name: {
                    fontSize: "sm",
                    fontWeight: "bold",
                },
            },
            md: {
                root: {
                    gap: "6px",
                    height: "36px",
                    padding: "0 8px 0 0",
                },
                avatar: {
                    width: "32px",
                    height: "32px",
                },
                name: {
                    fontSize: "sm",
                },
            },
        },
    },
    defaultVariants: {
        size: "md",
    },
});

// プレイヤーのスキン画像と名前を表示するだけのプレゼンテーションコンポーネント
// 名前の取得自体は親コンポーネント側（例: OnlineStatus）で行う
export const PlayerMap = ({
    uuid = "389b1a68-f647-4dd0-a421-61b6c22fdebe",
    name = "Chocolatt",
    size = "md",
}: Props) => {
    const style = playerMapStyle({ size });
    const avatarSize = size === "xl" ? 48 : 32;
    return (
        <div className={style.root}>
            <img
                className={style.avatar}
                src={`https://crafthead.net/avatar/${uuid}`}
                alt={uuid}
                width={avatarSize}
                height={avatarSize}
            />

            <Text className={style.name}>{name}</Text>
        </div>
    );
};
