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
                borderRadius: "lg",
                // maxWidth: "256px" を削除
                border: "0.5px solid var(--colors-border)",
                minWidth: 0,
                flexShrink: 0,
                overflow: "hidden",
                width: "100%", // コンテンツに合わせて幅を調整
            })}
        >
            <img
                className={css({
                    width: "28px",
                    height: "28px",
                    flexShrink: 0,
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
                    flexShrink: 0,
                    // whiteSpace: "nowrap" を削除
                    // textOverflow: "ellipsis" を削除
                })}
            >
                {await uuidToName(uuid)}
            </Text>
        </div>
    );
};
