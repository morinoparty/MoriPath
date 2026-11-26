import { ChevronRight } from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";
import { NumberingBadge } from "../../../-components/numbering-badge";
import { towns } from "../../-functions/town-stations";
import type { LineSummary } from "../../-types/transit";
import { TownThumbs } from "../town-thumbs";

/** 路線一覧の行と経路の区間で共通の見た目 (色の帯・名前・方面) */
export const lineRowStyle = sva({
    slots: [
        "root",
        "bar",
        "text",
        "nameRow",
        "name",
        "subName",
        "spacer",
        "count",
        "countNumber",
        "countUnit",
        "direction",
        "directionText",
        "tag",
        "chevron",
    ],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "full",
            padding: "12px",
            borderRadius: "20px",
            bg: "colorPalette.surface.subtle",
            textAlign: "left",
            color: "colorPalette.fg",
        },
        // 路線の色はデータ由来なので CSS 変数で受け取る
        bar: {
            flexShrink: 0,
            width: "6px",
            height: "40px",
            borderRadius: "3px",
            bg: "var(--line-color, {colors.colorPalette.solid})",
        },
        text: {
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        },
        nameRow: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            minWidth: "0",
        },
        // 長い路線名は 1 行に収めて省略する
        name: {
            minWidth: "0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "15px",
            fontWeight: "bold",
            lineHeight: "1.3",
            color: "colorPalette.fg",
        },
        subName: {
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: "medium",
            color: "fg.muted",
            whiteSpace: "nowrap",
        },
        spacer: {
            flex: "1",
        },
        count: {
            display: "flex",
            alignItems: "baseline",
            gap: "1px",
            flexShrink: 0,
            whiteSpace: "nowrap",
        },
        countNumber: {
            textStyle: "display",
            fontSize: "16px",
            fontWeight: "semibold",
            lineHeight: "1",
            color: "colorPalette.fg",
        },
        countUnit: {
            fontSize: "11px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        direction: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: "0",
        },
        directionText: {
            minWidth: "0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        tag: {
            flexShrink: 0,
            px: "6px",
            py: "1px",
            borderRadius: "full",
            bg: "colorPalette.surface",
            fontSize: "10px",
            fontWeight: "bold",
            color: "colorPalette.fg",
            whiteSpace: "nowrap",
        },
        chevron: {
            flexShrink: 0,
            width: "18px",
            height: "18px",
            color: "fg.muted",
        },
    },
    variants: {
        // ボタンとして押せる行 (区間の行は押せない)
        interactive: {
            true: {
                root: {
                    cursor: "pointer",
                    transitionProperty: "background",
                    transitionDuration: "fast",
                    _hover: { bg: "colorPalette.surface.hover" },
                    _active: { bg: "colorPalette.surface.active" },
                    _focusVisible: {
                        outline: "2px solid {colors.colorPalette.solid}",
                        outlineOffset: "2px",
                    },
                },
            },
        },
        // 特集カードの中に埋め込むときはカードの面をそのまま使う
        embedded: {
            true: {
                root: {
                    bg: "transparent",
                    px: "4px",
                    py: "12px",
                    _hover: { bg: "transparent" },
                    _active: { bg: "transparent" },
                },
            },
        },
    },
});

/** 路線の色を CSS 変数で渡す style (色が無ければブランド色) */
export const lineColorStyle = (color: string | null) =>
    color ? ({ "--line-color": color } as React.CSSProperties) : undefined;

export interface LineRowProps {
    summary: LineSummary;
    /** 特集カードの中に置くとき */
    embedded?: boolean;
    onClick: () => void;
}

/** 路線一覧の 1 行。色の帯・路線名・駅数・方面と通る街を並べる */
export const LineRow = ({
    summary,
    embedded = false,
    onClick,
}: LineRowProps) => {
    const { line, passesFrom, firstName, lastName } = summary;
    const style = lineRowStyle({ interactive: true, embedded });
    return (
        <button
            type="button"
            className={style.root}
            style={lineColorStyle(line.color)}
            onClick={onClick}
        >
            <span className={style.bar} aria-hidden />
            <span className={style.text}>
                <span className={style.nameRow}>
                    {line.prefix && (
                        <NumberingBadge
                            code={line.prefix}
                            color={line.color}
                            layout="inline"
                        />
                    )}
                    <span className={style.name}>{line.name}</span>
                    {line.subName && (
                        <span className={style.subName}>{line.subName}</span>
                    )}
                    <span className={style.spacer} />
                    <span className={style.count}>
                        <span className={style.countNumber}>
                            {line.stationIds.length}
                        </span>
                        <span className={style.countUnit}>駅</span>
                    </span>
                </span>
                <span className={style.direction}>
                    <TownThumbs towns={line.towns.map((slug) => towns[slug])} />
                    <span className={style.directionText}>
                        {`${firstName} ⇄ ${lastName}`}
                    </span>
                    {passesFrom && <span className={style.tag}>出発駅</span>}
                </span>
            </span>
            <ChevronRight className={style.chevron} aria-hidden />
        </button>
    );
};
