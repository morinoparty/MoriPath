import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import {
    IconButton,
    PlayerPhraseCard,
} from "@morinoparty/chlorophyll-react/components";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { sva } from "../../../../../styled-system/css";
import type { OnlinePlayer } from "../../-types/online-player";
import { OnlineStrip } from "../online-strip";

// 開いているあいだフレーズの基準時刻を進める間隔。フレーズ自体は 5 分ごとに切り替わる
const PHRASE_CLOCK_INTERVAL_MS = 60 * 1000;

const onlinePlayersSheetStyle = sva({
    slots: [
        "backdrop",
        "positioner",
        "content",
        "handle",
        "header",
        "heading",
        "title",
        "description",
        "close",
        "list",
    ],
    base: {
        // パレットの文字色を薄く敷いて、後ろのホームを沈める
        backdrop: {
            position: "fixed",
            inset: "0",
            zIndex: "overlay",
            bg: "colorPalette.fg/32",
            _open: {
                animationName: "drawerFadeIn",
                animationDuration: "normal",
                animationTimingFunction: "easeOut",
            },
            // 閉じるアニメーションの終わりで Ark UI が DOM を外す
            _closed: {
                animationName: "modalDialogFadeOut",
                animationDuration: "fast",
                animationTimingFunction: "easeIn",
            },
        },
        // シートを画面下の中央に寄せるだけのレイヤー。シートの外のクリックは暗幕へ通す
        positioner: {
            position: "fixed",
            inset: "0",
            zIndex: "modal",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pointerEvents: "none",
        },
        content: {
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "5",
            width: "full",
            // ホームの本文と同じ幅に収め、人数が多いときはシートの中だけをスクロールする
            maxWidth: "md",
            maxHeight: "85dvh",
            overflowY: "auto",
            overscrollBehavior: "contain",
            paddingX: "6",
            paddingTop: "3",
            // ホームインジケーターのある端末では、その分だけ下を空ける
            paddingBottom:
                "max(token(spacing.10), env(safe-area-inset-bottom))",
            bg: "bg.panel",
            borderTopRadius: "3xl",
            boxShadow: "floating",
            outline: "none",
            _open: {
                animationName: "sheetSlideUp",
                animationDuration: "normal",
                animationTimingFunction: "emphasizedDecelerate",
            },
            _closed: {
                animationName: "sheetSlideDown",
                animationDuration: "fast",
                animationTimingFunction: "emphasizedAccelerate",
            },
            // 動きを減らす設定では、滑らせずにその場でフェードさせる
            _motionReduce: {
                _open: { animationName: "drawerFadeIn" },
                _closed: { animationName: "modalDialogFadeOut" },
            },
        },
        // 下から引き出したシートであることを示す取っ手 (操作はできない飾り)
        handle: {
            alignSelf: "center",
            flexShrink: "0",
            width: "10",
            height: "1",
            borderRadius: "full",
            bg: "colorPalette.fg.muted",
            opacity: "0.3",
        },
        header: {
            display: "flex",
            alignItems: "flex-start",
            gap: "3",
        },
        heading: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "0.5",
            minWidth: "0",
            lineHeight: "1.4",
        },
        title: {
            textStyle: "xl",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        description: {
            textStyle: "sm",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        close: {
            flexShrink: "0",
            bg: "colorPalette.surface.subtle",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "4",
            listStyle: "none",
        },
    },
});

interface OnlinePlayersSheetProps {
    players: OnlinePlayer[];
    /** フレーズの基準時刻 (ms)。Storybook などで固定したいときだけ渡す */
    referenceTime?: number;
}

/**
 * フレーズ付きのプレイヤー一覧。Dialog.Content の中に置き、Root の lazyMount で
 * 開いたときに初めてクライアントで描かれるため、現在時刻から作るフレーズが
 * サーバーの描画とずれる (ハイドレーションの不一致) ことはない
 */
const OnlinePlayersList = ({
    players,
    referenceTime,
}: OnlinePlayersSheetProps) => {
    const style = onlinePlayersSheetStyle();
    // 開いた時刻を基準にし、開いたままでも 5 分の区切りをまたげばフレーズが替わるよう時計を進める
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(
            () => setNow(Date.now()),
            PHRASE_CLOCK_INTERVAL_MS,
        );
        return () => clearInterval(timer);
    }, []);

    return (
        <ul className={style.list}>
            {players.map((player) => (
                <li key={player.id}>
                    {/* フレーズは morino.party のフッターと同じく Chlorophyll の randomPhrase で作る */}
                    <PlayerPhraseCard.Root
                        playerId={player.id}
                        playerName={player.name}
                        referenceTime={referenceTime ?? now}
                    >
                        <PlayerPhraseCard.Avatar />
                        <PlayerPhraseCard.Body>
                            <PlayerPhraseCard.Phrase />
                            <PlayerPhraseCard.Name />
                        </PlayerPhraseCard.Body>
                    </PlayerPhraseCard.Root>
                </li>
            ))}
        </ul>
    );
};

// 下から開くシート本体 (暗幕・見出し・閉じるボタン・一覧)
const OnlinePlayersSheet = ({
    players,
    referenceTime,
}: OnlinePlayersSheetProps) => {
    const style = onlinePlayersSheetStyle();

    return (
        <Portal>
            <Dialog.Backdrop className={style.backdrop} />
            <Dialog.Positioner className={style.positioner}>
                <Dialog.Content className={style.content}>
                    <div className={style.handle} aria-hidden />
                    <div className={style.header}>
                        <div className={style.heading}>
                            <Dialog.Title className={style.title}>
                                こんな人たちも遊んでる
                            </Dialog.Title>
                            <Dialog.Description className={style.description}>
                                {players.length}人がプレイ中
                            </Dialog.Description>
                        </div>
                        <Dialog.CloseTrigger asChild>
                            <IconButton
                                variant="ghost"
                                shape="circle"
                                aria-label="閉じる"
                                className={style.close}
                            >
                                <XIcon />
                            </IconButton>
                        </Dialog.CloseTrigger>
                    </div>
                    <OnlinePlayersList
                        players={players}
                        referenceTime={referenceTime}
                    />
                </Dialog.Content>
            </Dialog.Positioner>
        </Portal>
    );
};

export interface OnlinePlayersProps {
    /** いまオンラインのプレイヤー */
    players: OnlinePlayer[];
    /** 最初から一覧を開いておくか (Storybook 用) */
    defaultOpen?: boolean;
    /** フレーズの基準時刻 (ms)。Storybook などで固定したいときだけ渡す */
    referenceTime?: number;
}

/**
 * ホームのオンライン帯と、押すと下から開くオンライン一覧のシート。
 * 誰もいないときは開くものがないため、押せない帯だけを出す
 */
export const OnlinePlayers = ({
    players,
    defaultOpen,
    referenceTime,
}: OnlinePlayersProps) => {
    if (players.length === 0) {
        return <OnlineStrip players={players} />;
    }

    return (
        // フォーカストラップ・Esc で閉じる・背景のスクロール止めは Ark UI の Dialog に任せる
        <Dialog.Root defaultOpen={defaultOpen} lazyMount unmountOnExit>
            <Dialog.Trigger asChild>
                <OnlineStrip players={players} />
            </Dialog.Trigger>
            <OnlinePlayersSheet
                players={players}
                referenceTime={referenceTime}
            />
        </Dialog.Root>
    );
};
