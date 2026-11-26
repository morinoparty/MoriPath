import {
    PlayerAvatar,
    PlayerAvatarGroup,
    Popover,
    Portal,
} from "@morinoparty/chlorophyll-react/components";
import { cx, sva } from "../../../../../styled-system/css";
import type { DiaryPlayer } from "../../-types/diary";

// 顔を並べる最大人数。超えた分は「+N」にまとめる (押せば人数に関係なく全員を一覧で見られる)
const MAX_VISIBLE_AVATARS = 3;

const diaryPlayersStyle = sva({
    slots: ["avatars", "trigger", "content", "list", "item", "name"],
    base: {
        avatars: {
            // 重なった顔の間のリングをページの地色にして、切り抜いたように見せる
            "--player-avatar-group-ring-color": "{colors.colorPalette.bg}",
        },
        // 顔の列ごと押せるようにして、32px の「+N」だけより押しやすくする
        trigger: {
            borderRadius: "lg",
        },
        content: {
            gap: "3",
            // 狭い画面でも、人数が多いときは一覧の中だけをスクロールさせる
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
        },
        name: {
            minWidth: "0",
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
    },
});

export interface DiaryPlayersProps {
    /** その出来事に居合わせたプレイヤー (1 人以上) */
    players: DiaryPlayer[];
    /** 最初から一覧を開いておくか (Storybook 用) */
    defaultOpen?: boolean;
    className?: string;
}

/**
 * ダイアリーの 1 件に居合わせたプレイヤーの顔。
 * 顔だけでは誰か分からないため、全員が並んでいても顔の列をボタンにし、押すと全員の顔と名前をポップオーバーで出す。
 * 並びきらないときは「+N」にまとめる
 */
export const DiaryPlayers = ({
    players,
    defaultOpen,
    className,
}: DiaryPlayersProps) => {
    const style = diaryPlayersStyle();

    return (
        // Esc や外側のタップで閉じてボタンにフォーカスを戻す動きは Ark UI の Popover に任せる。
        // タイムラインの各行で一覧を先に描かないよう、開いたときに初めて中身を作る
        <Popover.Root
            positioning={{ placement: "bottom-end" }}
            defaultOpen={defaultOpen}
            lazyMount
            unmountOnExit
        >
            <Popover.Trigger
                aria-label={`あそんでいたプレイヤーを見る (${players.length}人)`}
                className={cx(style.trigger, className)}
            >
                {/* 読み上げは aria-label で足りるため、顔の並びは装飾として隠す */}
                <PlayerAvatarGroup
                    players={players}
                    max={MAX_VISIBLE_AVATARS}
                    size="sm"
                    aria-hidden
                    className={style.avatars}
                />
            </Popover.Trigger>
            {/* タイムラインの顔の欄は高さ 0 ではみ出して描くため、ページの最前面に出す */}
            <Portal>
                <Popover.Positioner>
                    <Popover.Content className={style.content}>
                        <Popover.Title>
                            あそんでいたプレイヤー ({players.length}人)
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
                                    <span className={style.name}>
                                        {player.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
};
