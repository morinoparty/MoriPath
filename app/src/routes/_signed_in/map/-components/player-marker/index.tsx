import {
    PlayerAvatar,
    PlayerMap,
} from "@morinoparty/chlorophyll-react/components";
import { sva } from "../../../../../../styled-system/css";

const playerMarkerStyle = sva({
    slots: ["root", "self"],
    base: {
        root: {
            // 座標の位置にマーカーの中心を合わせる
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            "& > *": {
                boxShadow: "chrome",
            },
        },
        self: {
            // 自分は名前を付けず、白いフチの顔だけで目立たせる
            display: "block",
            p: "2px",
            bg: "bg.panel",
            borderRadius: "l2",
            lineHeight: 0,
            "& img": {
                imageRendering: "pixelated",
            },
        },
    },
});

export interface PlayerMarkerProps {
    playerId: string;
    playerName: string;
    /** ログイン中のプレイヤー本人か */
    isSelf?: boolean;
}

/** 地図上のプレイヤー。自分は顔だけ、ほかのプレイヤーは顔と名前のチップで出す */
export const PlayerMarker = ({
    playerId,
    playerName,
    isSelf = false,
}: PlayerMarkerProps) => {
    const style = playerMarkerStyle();
    return (
        <div className={style.root}>
            {isSelf ? (
                <span className={style.self}>
                    <PlayerAvatar
                        playerId={playerId}
                        playerName={playerName}
                        size="md"
                    />
                </span>
            ) : (
                <PlayerMap playerId={playerId} playerName={playerName} />
            )}
        </div>
    );
};
