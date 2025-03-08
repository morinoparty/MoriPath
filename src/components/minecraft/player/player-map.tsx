import { css } from "@/styled-system/css";
import { Text } from "~/components/ui/text";
import { uuidToName } from "~/utils/player-helpers";

type props = {
    uuid: string;
};

export const PlayerMap = async ({ uuid }: props) => {
    return (
        <div
            className={css({
                display: "flex",
                padding: "4px 10px 4px 4px",
                alignItems: "center",
                gap: "4px",
                borderRadius: "md",
                border: "0.5px solid var(--colors-border)",
                boxSizing: "border-box",
                minWidth: 0, // 追加: flexアイテムが小さくなるのを許可
            })}
        >
            <img
                className={css({
                    width: "28px",
                    height: "28px",
                    flexShrink: 0, // 追加: 画像サイズ固定
                    borderRadius: "md",
                })}
                src={`https://crafthead.net/avatar/${uuid}`}
                alt={uuid}
            />

            <Text
                className={css({
                    fontSize: "14px",
                    fontStyle: "normal",
                    lineHeight: "normal",
                })}
            >
                {await uuidToName(uuid)}
            </Text>
        </div>
    );
};
