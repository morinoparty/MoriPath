import { Button } from "@morinoparty/chlorophyll-react/components";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { css, sva } from "../../../../../../../styled-system/css";
import {
    InlineSkeleton,
    Skeleton,
    skeletonKeys,
} from "../../../../../../components/skeleton";
import { formatDuration } from "../../-functions/format-duration";
import { stationMapSearch } from "../../-functions/station-map-search";
import { towns } from "../../-functions/town-stations";
import type { TransitRoute, TransitRouteState } from "../../-types/transit";
import { RouteSegmentRow } from "../route-segment-row";
import { TransitNotice, type TransitNoticeKind } from "../transit-notice";

const routeResultStyle = sva({
    slots: [
        "root",
        "summary",
        "endpoints",
        "total",
        "pills",
        "pill",
        "list",
        "item",
        "transfer",
        "action",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
        },
        // 所要時間と乗りかえ回数のまとめ
        summary: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: "20px",
            borderRadius: "panel",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
        },
        endpoints: {
            fontSize: "14px",
            fontWeight: "bold",
        },
        total: {
            textStyle: "display",
            fontSize: "32px",
            fontWeight: "semibold",
            lineHeight: "1.1",
        },
        pills: {
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
        },
        pill: {
            px: "10px",
            py: "2px",
            borderRadius: "full",
            bg: "colorPalette.surface",
            fontSize: "12px",
            fontWeight: "bold",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        },
        item: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
        },
        // 区間のあいだの乗りかえ駅
        transfer: {
            paddingX: "18px",
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        action: {
            width: "full",
            borderRadius: "full",
        },
    },
});

/** 経路の状態ごとに出す案内 (ok 以外) */
const noticeKinds: Record<
    Exclude<TransitRouteState["status"], "ok">,
    TransitNoticeKind
> = {
    noRoute: "noRoute",
    sameStation: "sameStation",
    stationNotFound: "stationNotFound",
    unavailable: "routeUnavailable",
    error: "routeError",
};

export interface RouteResultProps {
    state: TransitRouteState;
    onRetry: () => void;
}

/** 出発と到着が決まったときの経路。失敗したときは案内を出す */
export const RouteResult = ({ state, onRetry }: RouteResultProps) => {
    if (state.status !== "ok") {
        return (
            <TransitNotice
                kind={noticeKinds[state.status]}
                onRetry={state.status === "error" ? onRetry : undefined}
            />
        );
    }
    return <RouteDetail route={state.route} />;
};

const RouteDetail = ({ route }: { route: TransitRoute }) => {
    const style = routeResultStyle();
    // 乗った駅の数。乗りかえ駅を二重に数えないよう、各区間の駅間の数を足す
    const railStops = route.segments.reduce(
        (sum, segment) =>
            segment.kind === "rail"
                ? sum + Math.max(segment.stopCount - 1, 0)
                : sum,
        0,
    );
    // ワールドが分からない駅は地図に出せないので、ボタンを出さない
    const mapSearch = route.to ? stationMapSearch(route.to) : null;
    return (
        <div className={style.root}>
            <section className={style.summary} aria-label="経路のまとめ">
                <p className={style.endpoints}>
                    {`${route.fromName} → ${route.toName}`}
                </p>
                <p className={style.total}>
                    {formatDuration(route.totalSeconds)}
                </p>
                <div className={style.pills}>
                    <span className={style.pill}>
                        {route.transfers > 0
                            ? `乗りかえ ${route.transfers}回`
                            : "乗りかえなし"}
                    </span>
                    <span className={style.pill}>{`${railStops}駅`}</span>
                </div>
            </section>
            <ol className={style.list} aria-label="乗る区間">
                {route.segments.map((segment, i) => {
                    const prev = i > 0 ? route.segments[i - 1] : null;
                    // 電車どうしのつなぎ目だけ「〇〇で乗りかえ」を挟む (徒歩の前後は歩く区間がつなぎを表す)
                    const showTransfer =
                        prev !== null &&
                        prev.kind === "rail" &&
                        segment.kind === "rail";
                    return (
                        // oxlint-disable-next-line react/no-array-index-key -- 区間には ID が無く、同じ経路の中で並びは変わらない
                        <li key={i} className={style.item}>
                            {showTransfer && (
                                <p className={style.transfer}>
                                    {`${prev.toName} で乗りかえ`}
                                </p>
                            )}
                            <RouteSegmentRow
                                segment={segment}
                                towns={
                                    segment.kind === "rail"
                                        ? segment.towns.map(
                                              (slug) => towns[slug],
                                          )
                                        : []
                                }
                            />
                        </li>
                    );
                })}
            </ol>
            {mapSearch && (
                <Button asChild intent="secondary" className={style.action}>
                    <Link to="/map" search={mapSearch}>
                        <MapPin />
                        到着駅を地図で見る
                    </Link>
                </Button>
            )}
        </div>
    );
};

// 区間の行の場所取り (区間の行と同じ大きさの柔らかい面)
const segmentSkeletonStyle = css({
    height: "72px",
    borderRadius: "panel",
});

// 読み込み中に並べる区間の数 (実際の経路の数とは関係なく、場所取りの見た目だけ)
const LOADING_SEGMENTS = 2;

/** 経路を調べているあいだの場所取り。まとめのカードと区間の行の形だけを出す */
export const RouteResultLoading = () => {
    const style = routeResultStyle();
    return (
        <output className={style.root} aria-busy>
            <span className={css({ srOnly: true })}>経路をしらべています</span>
            <div className={style.summary} aria-hidden>
                <InlineSkeleton width="10em" />
                <InlineSkeleton
                    width="6em"
                    className={css({ fontSize: "32px" })}
                />
                <InlineSkeleton width="8em" />
            </div>
            <div className={style.list} aria-hidden>
                {skeletonKeys(LOADING_SEGMENTS).map((key) => (
                    <Skeleton key={key} className={segmentSkeletonStyle} />
                ))}
            </div>
        </output>
    );
};
