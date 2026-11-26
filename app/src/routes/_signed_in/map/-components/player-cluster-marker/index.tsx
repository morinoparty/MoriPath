import {
    PlayerAvatar,
    PlayerAvatarGroup,
    Popover,
    Portal,
} from "@morinoparty/chlorophyll-react/components";
import L from "leaflet";
import { useCallback } from "react";
import { sva } from "../../../../../../styled-system/css";

// チップに並べる顔の最大人数。超えた分は「+N」にまとめる
const MAX_VISIBLE_AVATARS = 3;

const playerClusterMarkerStyle = sva({
    slots: ["root", "trigger", "avatars", "count", "content", "list", "item"],
    base: {
        // 座標の位置にチップの中心を合わせる (1 人のときの PlayerMarker と同じ)
        root: {
            position: "absolute",
            left: 0,
            top: 0,
            transform: "translate(-50%, -50%)",
        },
        // 1 人分の名前チップと同じ白いピルに、顔の並びと人数を載せる
        trigger: {
            display: "flex",
            alignItems: "center",
            gap: "1.5",
            padding: "1",
            paddingRight: "3",
            bg: "bg.panel",
            borderRadius: "full",
            boxShadow: "chrome",
            cursor: "pointer",
            whiteSpace: "nowrap",
            _focusVisible: {
                outline: "2px solid",
                outlineColor: "colorPalette.focusRing",
            },
        },
        avatars: {
            // 重なった顔の間のリングをチップの地色にして、切り抜いたように見せる
            "--player-avatar-group-ring-color": "{colors.bg.panel}",
            "& img": {
                imageRendering: "pixelated",
            },
        },
        count: {
            textStyle: "sm",
            fontWeight: "bold",
            color: "fg.default",
        },
        content: {
            gap: "3",
            // 人数が多いときは一覧の中だけをスクロールさせる
            maxHeight: "min(20rem, var(--available-height))",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "2.5",
            minHeight: "0",
            overflowY: "auto",
            listStyle: "none",
        },
        item: {
            display: "flex",
            alignItems: "center",
            gap: "2.5",
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
    },
});

export interface PlayerClusterMarkerProps {
    /** 同じ場所に重なっているプレイヤー (2 人以上) */
    players: { id: string; name: string }[];
}

/**
 * 地図上で重なり合うプレイヤーを 1 つにまとめたチップ。
 * 顔の並びと人数だけを出し、押すと全員の顔と名前をポップオーバーで出す
 */
export const PlayerClusterMarker = ({ players }: PlayerClusterMarkerProps) => {
    const style = playerClusterMarkerStyle();
    // チップを押したときのクリックが地図まで伝わり、路線や駅の当たり判定が走らないようにする
    const stopPropagation = useCallback((element: HTMLButtonElement | null) => {
        if (element) {
            L.DomEvent.disableClickPropagation(element);
            L.DomEvent.disableScrollPropagation(element);
        }
    }, []);

    return (
        <div className={style.root}>
            <Popover.Root
                positioning={{ placement: "bottom" }}
                lazyMount
                unmountOnExit
            >
                <Popover.Trigger
                    ref={stopPropagation}
                    aria-label={`ここにいるプレイヤーを見る (${players.length}人)`}
                    className={style.trigger}
                >
                    {/* 読み上げは aria-label で足りるため、顔の並びは装飾として隠す */}
                    <PlayerAvatarGroup
                        players={players}
                        max={MAX_VISIBLE_AVATARS}
                        size="sm"
                        aria-hidden
                        className={style.avatars}
                    />
                    <span className={style.count} aria-hidden>
                        {players.length}人
                    </span>
                </Popover.Trigger>
                {/* 地図のマーカーの重なり順に埋もれないよう、ページの最前面に出す */}
                <Portal>
                    <Popover.Positioner>
                        <Popover.Content className={style.content}>
                            <Popover.Title>
                                ここにいるプレイヤー ({players.length}人)
                            </Popover.Title>
                            <ul className={style.list}>
                                {players.map((player) => (
                                    <li key={player.id} className={style.item}>
                                        {/* 名前を横に文字で出すため、顔は装飾にして読み上げを重ねない */}
                                        <PlayerAvatar
                                            playerId={player.id}
                                            playerName={player.name}
                                            size="sm"
                                            decorative
                                        />
                                        {player.name}
                                    </li>
                                ))}
                            </ul>
                        </Popover.Content>
                    </Popover.Positioner>
                </Portal>
            </Popover.Root>
        </div>
    );
};
