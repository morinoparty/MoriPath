import {
    IconButton,
    PlayerAvatar,
} from "@morinoparty/chlorophyll-react/components";
import { XIcon } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";

const followIndicatorStyle = sva({
    slots: ["root", "body", "status", "name", "close"],
    base: {
        // 地図の上に浮かぶ小さな札。ほかのクロムと同じ白い面 + 影の丸い形にする
        root: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            width: "max-content",
            maxWidth: "100%",
            py: "1",
            ps: "1",
            pe: "1",
            bg: "bg.panel",
            borderRadius: "full",
            boxShadow: "chrome",
            "& img": {
                imageRendering: "pixelated",
            },
        },
        body: {
            display: "flex",
            flexDirection: "column",
            minWidth: "0",
            lineHeight: "1.3",
        },
        status: {
            textStyle: "xs",
            fontWeight: "bold",
            color: "colorPalette.fg",
            // 見失っているあいだは控えめな色にする
            "&[data-missing]": {
                color: "fg.muted",
            },
        },
        name: {
            textStyle: "sm",
            fontWeight: "bold",
            color: "fg",
            // 長い名前は 1 行で切る
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        close: {
            flexShrink: "0",
        },
    },
});

export interface FollowIndicatorProps {
    /** 追いかけている人の UUID。分からない (URL で名前だけ指された) ときは名前でアバターを引く */
    playerId?: string;
    playerName: string;
    /** 地図に見当たらない (オフライン・地図から隠れている) か */
    isMissing?: boolean;
    /** 追いかけるのをやめる */
    onDismiss: () => void;
}

/** 地図が追いかけているプレイヤーを知らせ、やめるボタンを添える札 */
export const FollowIndicator = ({
    playerId,
    playerName,
    isMissing = false,
    onDismiss,
}: FollowIndicatorProps) => {
    const style = followIndicatorStyle();
    return (
        // 追いかけている人が替わったり見失ったりしたことを読み上げる (output は role=status を持つ)
        <output className={style.root}>
            <PlayerAvatar
                playerId={playerId ?? playerName}
                playerName={playerName}
                size="sm"
            />
            <span className={style.body}>
                <span
                    className={style.status}
                    data-missing={isMissing ? "" : undefined}
                >
                    {isMissing ? "地図に見当たりません" : "追いかけています"}
                </span>
                <span className={style.name}>{playerName}</span>
            </span>
            <IconButton
                variant="ghost"
                shape="circle"
                size="sm"
                aria-label="追いかけるのをやめる"
                className={style.close}
                onClick={onDismiss}
            >
                <XIcon />
            </IconButton>
        </output>
    );
};
