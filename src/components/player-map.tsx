import { Text } from "@chakra-ui/react";
import { css } from "@/styled-system/css";
import { uuidToName } from "~/lib/player-helpers";

type props = {
    uuid?: string;
    size?: number;
};

export const PlayerMap = async ({
    uuid = "389b1a68-f647-4dd0-a421-61b6c22fdebe",
    size = 32,
}: props) => {
    return (
        <>
            <div
                className={css({
                    display: "inline-flex",
                    padding: "4px 10px 4px 4px",
                    alignItems: "center",
                    borderRadius: "lg",
                    border: "0.5px solid var(--colors-border-default)",
                    bgColor: "#ffffff",
                    flexShrink: "0",
                    minWidth: 0,
                    overflow: "hidden",
                })}
                style={{ gap: `${size / 3}px` }}
            >
                <img
                    className={css({
                        flexShrink: 0,
                        borderRadius: "md",
                    })}
                    style={{ width: `${size}px`, height: `${size}px` }}
                    src={`https://crafthead.net/avatar/${uuid}`}
                    alt={uuid}
                />

                <Text
                    className={css({
                        fontSize: "lg",
                        fontVariationSettings: "'wght' 600",
                        color: "var(--chakra-colors-color-palette-500)",
                        flexShrink: 0,
                    })}
                >
                    {await uuidToName(uuid)}
                </Text>
            </div>
        </>
    );
};
