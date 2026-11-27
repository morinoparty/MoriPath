import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import {
    Drawer,
    IconButton,
    PlayerAvatar,
    Spinner,
} from "@morinoparty/chlorophyll-react/components";
import { Users, XIcon } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { SheetDragArea } from "../../../../../components/sheet-drag-area";
import type {
    MapPlayerEntry,
    MapPlayerEntryGroup,
} from "../../-types/map-player-entry";

const playerListSheetStyle = sva({
    slots: [
        "trigger",
        "backdrop",
        "positioner",
        "content",
        "header",
        "title",
        "close",
        "groups",
        "group",
        "groupTitle",
        "groupCount",
        "list",
        "row",
        "body",
        "name",
        "note",
        "message",
    ],
    base: {
        // 地図の上に浮かぶクロムなので、ワールド切り替えと同じ白い面 + 影のボタンにする
        trigger: {
            // ホームのパーティ切り替えと同じ 40px にそろえる
            width: "40px",
            height: "40px",
            bg: "bg.panel",
            borderWidth: "0",
            borderRadius: "l3",
            boxShadow: "chrome",
            color: "colorPalette.fg",
            "& svg": {
                width: "20px",
                height: "20px",
            },
        },
        // パレットの文字色を薄く敷いて、後ろの地図を沈める
        backdrop: {
            bg: "colorPalette.fg/32",
        },
        // 画面の幅いっぱいではなく、操作ボタンと同じ幅で中央に寄せる
        positioner: {
            alignItems: "center",
        },
        // 開閉のアニメーションと中のスクロールは Chlorophyll の Drawer に任せ、余白と幅だけを決める
        content: {
            gap: "5",
            maxWidth: "md",
            paddingX: "6",
            // ホームインジケーターのある端末では、その分だけ下を空ける
            paddingBottom:
                "max(token(spacing.10), env(safe-area-inset-bottom))",
            borderTopRadius: "3xl",
        },
        header: {
            display: "flex",
            alignItems: "center",
            gap: "3",
        },
        title: {
            flex: "1",
            minWidth: "0",
            textStyle: "xl",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        close: {
            flexShrink: "0",
            bg: "colorPalette.surface.subtle",
        },
        groups: {
            display: "flex",
            flexDirection: "column",
            gap: "6",
        },
        group: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
        },
        // ワールド名は一覧の区切りなので、タイトルより控えめに出す
        groupTitle: {
            display: "flex",
            alignItems: "baseline",
            gap: "1.5",
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg.muted",
        },
        groupCount: {
            fontWeight: "medium",
            fontVariantNumeric: "tabular-nums",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "1",
            listStyle: "none",
        },
        // 1 行が 1 つのボタン。指で押しやすいよう高さを取り、押せない行は薄くする
        row: {
            display: "flex",
            alignItems: "center",
            gap: "3",
            width: "100%",
            minHeight: "14",
            px: "2",
            py: "1.5",
            borderRadius: "panel",
            textAlign: "start",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: {
                bg: "colorPalette.surface.subtle",
            },
            _active: {
                bg: "colorPalette.surface",
            },
            _disabled: {
                cursor: "default",
                opacity: 0.5,
                bg: "transparent",
            },
            "& img": {
                imageRendering: "pixelated",
            },
        },
        body: {
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "0.5",
            minWidth: "0",
        },
        name: {
            textStyle: "md",
            fontWeight: "bold",
            lineHeight: "1.3",
            color: "fg",
            // 長い名前は 1 行で切る
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        note: {
            textStyle: "xs",
            fontWeight: "medium",
            color: "fg.muted",
        },
        message: {
            display: "grid",
            placeItems: "center",
            minHeight: "24",
            textStyle: "sm",
            color: "fg.muted",
            textAlign: "center",
        },
    },
});

export interface PlayerListSheetProps {
    /** 見出しごとに分けたプレイヤー */
    groups: MapPlayerEntryGroup[];
    /** 一覧を取っているあいだ */
    isLoading?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** 地図に出ている人を選んだ */
    onSelectPlayer: (
        entry: Extract<MapPlayerEntry, { status: "onMap" }>,
    ) => void;
}

/** 行の 2 行目。地図に出ていない人だけ、その理由を出す */
const entryNote = (entry: MapPlayerEntry) =>
    entry.status === "offMap" ? entry.reason : null;

/** 一覧の 1 行。地図に出ている人だけを押せるボタンにする */
const PlayerRow = ({
    entry,
    onSelectPlayer,
}: {
    entry: MapPlayerEntry;
    onSelectPlayer: PlayerListSheetProps["onSelectPlayer"];
}) => {
    const style = playerListSheetStyle();
    const note = entryNote(entry);
    const isOnMap = entry.status === "onMap";
    return (
        <button
            type="button"
            className={style.row}
            // 地図に出ていない人は位置が分からないので押せなくする
            disabled={!isOnMap}
            onClick={() => {
                if (entry.status === "onMap") {
                    onSelectPlayer(entry);
                }
            }}
        >
            <PlayerAvatar
                playerId={entry.id}
                playerName={entry.name}
                size="sm"
            />
            <span className={style.body}>
                <span className={style.name}>{entry.name}</span>
                {note && <span className={style.note}>{note}</span>}
            </span>
        </button>
    );
};

/**
 * オンラインのプレイヤー一覧 (地図の右上のボタンから下に開くシート)。
 * 地図に出ている人を押すと、その人がいまいる場所へ地図を移す。地図に出ていない人は押せない行で出す
 */
export const PlayerListSheet = ({
    groups,
    isLoading = false,
    open,
    onOpenChange,
    onSelectPlayer,
}: PlayerListSheetProps) => {
    const style = playerListSheetStyle();
    const total = groups.reduce((sum, group) => sum + group.entries.length, 0);

    return (
        // フォーカストラップ・Esc で閉じる・背景のスクロール止めは Drawer (Ark UI の Dialog) に任せる
        <Drawer.Root
            placement="bottom"
            open={open}
            onOpenChange={(details) => onOpenChange(details.open)}
            lazyMount
            unmountOnExit
        >
            <Drawer.Trigger asChild>
                <IconButton
                    variant="outline"
                    size="lg"
                    className={style.trigger}
                    aria-label="プレイヤーを探す"
                >
                    <Users aria-hidden />
                </IconButton>
            </Drawer.Trigger>
            <Portal>
                <Drawer.Backdrop className={style.backdrop} />
                <Drawer.Positioner className={style.positioner}>
                    <Drawer.Content className={style.content}>
                        {/* つまみと見出しをつかんで下へ引くと閉じる */}
                        <SheetDragArea>
                            <Drawer.Handle />
                            {/* Drawer は Ark UI の Dialog なので、見出しと閉じるボタンは Dialog の部品で Content に結び付ける */}
                            <div className={style.header}>
                                <Dialog.Title className={style.title}>
                                    プレイヤー
                                </Dialog.Title>
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
                        </SheetDragArea>
                        {total === 0 ? (
                            <div className={style.message}>
                                {isLoading ? (
                                    <Spinner aria-label="プレイヤーを読み込み中" />
                                ) : (
                                    "オンラインのプレイヤーはいません"
                                )}
                            </div>
                        ) : (
                            <div className={style.groups}>
                                {groups.map((group) => (
                                    <section
                                        key={group.key}
                                        className={style.group}
                                    >
                                        <h3 className={style.groupTitle}>
                                            {group.label}
                                            <span className={style.groupCount}>
                                                {group.entries.length}人
                                            </span>
                                        </h3>
                                        <ul className={style.list}>
                                            {group.entries.map((entry) => (
                                                <li key={entry.id}>
                                                    <PlayerRow
                                                        entry={entry}
                                                        onSelectPlayer={
                                                            onSelectPlayer
                                                        }
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                ))}
                            </div>
                        )}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};
