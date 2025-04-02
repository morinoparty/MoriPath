import { css } from "@/styled-system/css";
import { Text } from "~/components/ui/text";
import { uuidToName } from "~/utils/player-helpers";

type props = {
    uuid: string;
    size?: number;
};

export const PlayerMap = async ({ uuid, size = 28 }: props) => {
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
                style={{ gap: `${size / 4}px` }}
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
                        fontStyle: "normal",
                        lineHeight: "normal",
                        flexShrink: 0,
                    })}
                    style={{
                        fontSize: `${size / 2}px`,
                    }}
                >
                    {await uuidToName(uuid)}
                </Text>
            </div>
        </>
    );
};
