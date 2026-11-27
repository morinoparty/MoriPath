import { sva } from "../../../../../../../styled-system/css";
import type { Town } from "../../-types/town";
import type {
    LineSummary,
    TransitLine,
    TransitStation,
} from "../../-types/transit";
import { FeaturedLineCard } from "../featured-line-card";
import { LineRow } from "../line-row";

const lineListStyle = sva({
    slots: ["root", "heading", "title", "subtitle", "list"],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        },
        heading: {
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            columnGap: "8px",
        },
        title: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        subtitle: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        },
    },
});

export interface LineListProps {
    /** 並べる路線 (出発駅を通る路線が先) */
    summaries: LineSummary[];
    fromStation: TransitStation | null;
    /** いちばん上の路線を写真つきのカードで出すとき、その路線と端の街の駅の街 (1〜2 つ) */
    featured: { line: TransitLine; towns: Town[] } | null;
    onOpenLine: (lineSlug: string) => void;
}

/** 「路線からえらぶ」の路線一覧 */
export const LineList = ({
    summaries,
    fromStation,
    featured,
    onOpenLine,
}: LineListProps) => {
    const style = lineListStyle();
    return (
        <section
            className={style.root}
            aria-labelledby="transit-line-list-title"
        >
            <div className={style.heading}>
                <h2 id="transit-line-list-title" className={style.title}>
                    どの路線の駅？
                </h2>
                <p className={style.subtitle}>
                    {`${summaries.length}路線`}
                    {fromStation && ` · ${fromStation.name}を通る路線が上`}
                </p>
            </div>
            <ul className={style.list}>
                {summaries.map((summary, i) => (
                    <li key={summary.line.id}>
                        {/* 特集はいちばん上の路線だけ */}
                        {i === 0 && featured?.line.id === summary.line.id ? (
                            <FeaturedLineCard
                                summary={summary}
                                towns={featured.towns}
                                onClick={() => onOpenLine(summary.line.slug)}
                            />
                        ) : (
                            <LineRow
                                summary={summary}
                                onClick={() => onOpenLine(summary.line.slug)}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
};
