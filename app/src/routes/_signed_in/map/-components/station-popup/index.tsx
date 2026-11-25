import { Skeleton } from "@morinoparty/chlorophyll-react/components";
import { sva } from "../../../../../../styled-system/css";
import type { StationLine, StationNumbering } from "../../-types/station";
import { MapPopupCard } from "../map-popup-card";
import { NumberingBadge } from "../numbering-badge";

const stationPopupStyle = sva({
    slots: ["name", "badges", "lines", "line", "lineMark", "skeleton"],
    base: {
        name: {
            // Leaflet の CSS がポップアップ内の <p> に付ける余白を消す
            m: "0",
            fontSize: "md",
            fontWeight: "bold",
            color: "colorPalette.fg",
            lineHeight: "1.4",
        },
        badges: {
            display: "flex",
            flexWrap: "wrap",
            gap: "1",
            mt: "2",
        },
        lines: {
            display: "flex",
            flexDirection: "column",
            gap: "1.5",
            mt: "3",
            pt: "3",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "border.muted",
        },
        line: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            fontSize: "sm",
            fontWeight: "bold",
            color: "fg",
        },
        lineMark: {
            // 路線の色はデータ由来なので CSS 変数で受け取る
            width: "4px",
            height: "16px",
            borderRadius: "full",
            bg: "var(--line-color, {colors.colorPalette.solid})",
            flexShrink: 0,
        },
        skeleton: {
            height: "16px",
            width: "120px",
        },
    },
});

export interface StationPopupProps {
    name: string;
    numberings: StationNumbering[];
    /** 乗り入れている路線。読み込み中は null */
    lines: StationLine[] | null;
}

/** 駅をタップしたときの駅名・ナンバリング・乗り入れている路線 */
export const StationPopup = ({
    name,
    numberings,
    lines,
}: StationPopupProps) => {
    const style = stationPopupStyle();
    const badges = numberings.filter((numbering) => numbering.code !== null);
    return (
        <MapPopupCard>
            <p className={style.name}>{name}</p>
            {badges.length > 0 && (
                <div className={style.badges}>
                    {badges.map((numbering) => (
                        <NumberingBadge
                            key={numbering.code}
                            code={numbering.code ?? ""}
                            color={numbering.color}
                        />
                    ))}
                </div>
            )}
            {lines === null ? (
                <div className={style.lines}>
                    <Skeleton className={style.skeleton} />
                </div>
            ) : (
                lines.length > 0 && (
                    <ul className={style.lines} aria-label="乗り入れている路線">
                        {lines.map((line) => (
                            <li key={line.name} className={style.line}>
                                <span
                                    className={style.lineMark}
                                    style={
                                        line.color
                                            ? ({
                                                  "--line-color": line.color,
                                              } as React.CSSProperties)
                                            : undefined
                                    }
                                    aria-hidden
                                />
                                {line.name}
                            </li>
                        ))}
                    </ul>
                )
            )}
        </MapPopupCard>
    );
};
