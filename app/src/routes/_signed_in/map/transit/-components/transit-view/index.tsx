import { Await } from "@tanstack/react-router";
import { useMemo } from "react";
import { css } from "../../../../../../../styled-system/css";
import { buildRoutePath } from "../../-functions/build-route-path";
import { indexTransitNetwork } from "../../-functions/index-transit-network";
import {
    lineStationRows,
    lineTerminalTowns,
    summarizeLines,
} from "../../-functions/line-summaries";
import { searchStations } from "../../-functions/match-stations";
import { findNearbyStations, townOf } from "../../-functions/nearby-stations";
import { resolveTransitHero } from "../../-functions/resolve-transit-hero";
import { towns } from "../../-functions/town-stations";
import {
    chooseStation,
    modeOf,
    resolveActiveSlot,
    slotLabel,
    type TransitSearch,
} from "../../-functions/transit-search";
import type { Town } from "../../-types/town";
import type {
    DisabledStation,
    SelfPosition,
    TransitMode,
    TransitNetwork,
    TransitNetworkIndex,
    TransitRouteState,
    TransitSlot,
    TransitStation,
} from "../../-types/transit";
import type { TransitHero } from "../../-types/transit-hero";
import { LineList } from "../line-list";
import { LineStationPicker } from "../line-station-picker";
import { ModeTabs } from "../mode-tabs";
import { RouteResult, RouteResultLoading } from "../route-result";
import { StationSearch } from "../station-search";
import { StationSlots } from "../station-slots";
import { TransitBackButton } from "../transit-back-button";
import { TransitHeroBackground, TransitHeroHeadline } from "../transit-hero";
import { TransitNotice } from "../transit-notice";
import { TransitNoticePage } from "../transit-notice-page";

// タブバーを出さない下層ページなので、画面いっぱいに地の色を敷く。
// 上 (見出しと出発・到着の枠) は動かさず、その下 (タブと一覧) だけをスクロールさせるため、ページ (window) ではなく
// 画面に固定した縦並びの中でスクロールさせる。Layout の minHeight: 100vh はモバイルで 100dvh より高く、
// window がスクロールすると上がずれるので、画面に固定して Layout と同じ幅で中央に置く
const rootStyle = css({
    position: "fixed",
    inset: "0",
    maxWidth: "md",
    marginX: "auto",
    display: "flex",
    flexDirection: "column",
    bg: "colorPalette.bg",
    overflow: "hidden",
    // 背景の層と中身の重なりをこの中に閉じる
    isolation: "isolate",
});

// 一覧の頭に置くタブ。一覧との間を空ける
const tabsStyle = css({
    paddingTop: "0.5",
    paddingBottom: "3.5",
});

// 動かさない上の部分 (見出しと出発・到着の枠)。背景の層より上に重ねる
const headStyle = css({
    position: "relative",
    zIndex: 1,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3.5",
    paddingX: "6",
    paddingTop: "calc(env(safe-area-inset-top) + {spacing.4})",
    paddingBottom: "3.5",
});

// スクロールするのはここだけ。端まで行ってもページ全体を引っぱらない
const scrollStyle = css({
    position: "relative",
    zIndex: 1,
    flex: "1",
    minHeight: "0",
    overflowY: "auto",
    overscrollBehavior: "contain",
    display: "flex",
    flexDirection: "column",
    paddingX: "6",
    paddingBottom:
        "max({spacing.6}, calc(env(safe-area-inset-bottom) + {spacing.2}))",
    // 中身を縮めず、収まらない分はスクロールで見せる
    "& > *": { flexShrink: 0 },
});

export interface TransitViewProps {
    /** 駅と路線。API を使えなければ null */
    network: TransitNetwork | null;
    /** squaremap の公開 URL。街の駅でない駅の地図を見出しに出すのに使う。取れなければ null */
    worldMapUrl: string | null;
    /** 出発と到着が決まっているときの経路。loader は待たずに Promise で渡すので、届くまで場所取りを出す */
    route: Promise<TransitRouteState | null> | TransitRouteState | null;
    search: TransitSearch;
    /** さいきん選んだ駅の slug (新しい順) */
    recentSlugs: readonly string[];
    /** 地図に出ている自分の位置 */
    selfPosition: SelfPosition | null;
    onEditSlot: (slot: TransitSlot) => void;
    onSwap: () => void;
    onModeChange: (mode: TransitMode) => void;
    onLineChange: (lineSlug: string | undefined) => void;
    onQueryChange: (q: string) => void;
    /** 駅を枠に入れたときの次の URL の状態と、その駅の slug (さいきん選んだ駅に足す) */
    onConfirmStation: (next: TransitSearch, slug: string) => void;
    onRetryRoute: () => void;
}

/** 乗換案内の画面。駅の選び方 (路線・駅名) と経路を、URL の状態に合わせて出し分ける */
export const TransitView = (props: TransitViewProps) => {
    const { network } = props;
    const index = useMemo(
        () => (network ? indexTransitNetwork(network) : null),
        [network],
    );

    // 駅の情報が無いときは見出しだけを出し、使えない旨を伝える
    if (!index) {
        return (
            <TransitNoticePage>
                <TransitNotice kind="unavailable" />
            </TransitNoticePage>
        );
    }
    return <TransitBody {...props} index={index} />;
};

const TransitBody = ({
    index,
    worldMapUrl,
    route,
    search,
    recentSlugs,
    selfPosition,
    onEditSlot,
    onSwap,
    onModeChange,
    onLineChange,
    onQueryChange,
    onConfirmStation,
    onRetryRoute,
}: TransitViewProps & { index: TransitNetworkIndex }) => {
    const stations = index.network.stations;
    const activeSlot = resolveActiveSlot(search, index);
    const mode = modeOf(search);
    const query = search.q ?? "";
    const stationOf = (slug: string | undefined) =>
        (slug && index.stationBySlug.get(slug)) || null;
    const fromStation = stationOf(search.from);
    const toStation = stationOf(search.to);

    // 検索の当たりは URL の検索語から作る (入力欄の文字は 1 フレーム以内に URL へ追いつく)
    const matches = useMemo(
        () => searchStations(stations, query),
        [stations, query],
    );
    const nearby = useMemo(
        () =>
            selfPosition ? findNearbyStations(stations, selfPosition) : null,
        [stations, selfPosition],
    );

    // 経路の線は、経路が届いてから地図に引く (Promise は経路と索引が変わったときだけ作り直す)
    const routePath = useMemo(
        () =>
            route instanceof Promise
                ? route.then((state) => buildRoutePath(state, index))
                : buildRoutePath(route, index),
        [route, index],
    );
    // 出発と到着が決まって経路を見ているときは、経路全体が収まる地図を出す (同じワールドのときだけ)。
    // それ以外は出発の駅 (無ければ到着の駅) で決め、写真はその駅が街の駅のときだけ、
    // それ以外の駅は地図、駅が無ければブロックの風景にする
    const hero: TransitHero =
        activeSlot === null &&
        fromStation &&
        toStation &&
        worldMapUrl &&
        fromStation.worldId &&
        fromStation.worldId === toStation.worldId
            ? {
                  kind: "route",
                  from: fromStation,
                  to: toStation,
                  worldId: fromStation.worldId,
                  baseUrl: worldMapUrl,
                  path: routePath,
              }
            : resolveTransitHero(fromStation ?? toStation, worldMapUrl);
    // 検索の入力中は一覧を広く見せるため、写真を細くする
    const compact = mode === "search" && query !== "" && activeSlot !== null;

    const currentOfActive =
        activeSlot === "from"
            ? fromStation
            : activeSlot === "to"
              ? toStation
              : null;
    const selectedId = currentOfActive?.id ?? null;
    // もう一方の枠に入っている駅は選べないようにする (同じ駅どうしの経路を作らない)
    const otherSlot: TransitSlot | null =
        activeSlot === "from" ? "to" : activeSlot === "to" ? "from" : null;
    const otherStation =
        otherSlot === "from"
            ? fromStation
            : otherSlot === "to"
              ? toStation
              : null;
    const disabled: DisabledStation | null =
        otherSlot && otherStation
            ? { id: otherStation.id, label: slotLabel[otherSlot] }
            : null;

    const select = (station: TransitStation) => {
        if (activeSlot === null) return;
        // 押した駅をすぐ枠に入れる (確定ボタンを挟まない)。
        // もう一方が決まっていれば経路へ、決まっていなければもう一方の枠を選ぶ画面へ進む
        onConfirmStation(
            chooseStation(search, index, activeSlot, station.slug),
            station.slug,
        );
    };

    return (
        <div className={rootStyle}>
            <TransitHeroBackground hero={hero} compact={compact} />
            <TransitBackButton />
            <div className={headStyle}>
                <TransitHeroHeadline hero={hero} compact={compact} />
                <StationSlots
                    from={fromStation}
                    to={toStation}
                    activeSlot={activeSlot}
                    onEditSlot={onEditSlot}
                    onSwap={onSwap}
                />
            </div>
            <div
                // 枠・モード・路線 (経路なら出発・到着) が変わったら一覧の頭から見せる (window のスクロールのようには戻らないため)。
                // 検索語は入れない (1 文字ごとに作り直すと入力欄のフォーカスが外れる)
                key={
                    activeSlot === null
                        ? `route|${search.from}|${search.to}`
                        : `${activeSlot}|${mode}|${search.line ?? ""}`
                }
                className={scrollStyle}
            >
                {/* 動かさないのは出発・到着の枠まで。タブは一覧といっしょにスクロールさせ、写真と一覧の場所を広く取る */}
                {activeSlot !== null && (
                    <div className={tabsStyle}>
                        <ModeTabs value={mode} onValueChange={onModeChange} />
                    </div>
                )}
                {activeSlot === null ? (
                    // 両方決まったら経路を出す
                    route instanceof Promise ? (
                        <Await
                            // 出発・到着が変わったら場所取りを出し直す (前の経路を出したまま待たない)
                            key={`${search.from}|${search.to}`}
                            promise={route}
                            fallback={<RouteResultLoading />}
                        >
                            {(state) =>
                                state && (
                                    <RouteResult
                                        state={state}
                                        onRetry={onRetryRoute}
                                    />
                                )
                            }
                        </Await>
                    ) : (
                        route && (
                            <RouteResult state={route} onRetry={onRetryRoute} />
                        )
                    )
                ) : mode === "line" ? (
                    <LinePane
                        index={index}
                        lineSlug={search.line}
                        fromStation={fromStation}
                        selectedId={selectedId}
                        disabled={disabled}
                        onLineChange={onLineChange}
                        onSelect={select}
                    />
                ) : (
                    <StationSearch
                        // 枠が変わったら (駅を決めたら) 入力欄を作り直し、前の検索語を残さない
                        key={activeSlot}
                        query={query}
                        matches={matches}
                        recent={recentSlugs
                            .map((slug) => stationOf(slug))
                            .filter((s): s is TransitStation => s !== null)}
                        nearby={nearby}
                        selfTownLabel={
                            nearby?.[0]
                                ? (townOf(nearby[0].station)?.label ?? null)
                                : null
                        }
                        lines={index.lineById}
                        activeSlot={activeSlot}
                        selectedId={selectedId}
                        disabled={disabled}
                        onQueryChange={onQueryChange}
                        onSelect={select}
                    />
                )}
            </div>
        </div>
    );
};

/** 「路線からえらぶ」。路線を開いていれば路線図、そうでなければ路線一覧 */
const LinePane = ({
    index,
    lineSlug,
    fromStation,
    selectedId,
    disabled,
    onLineChange,
    onSelect,
}: {
    index: TransitNetworkIndex;
    lineSlug: string | undefined;
    fromStation: TransitStation | null;
    selectedId: string | null;
    disabled: DisabledStation | null;
    onLineChange: (lineSlug: string | undefined) => void;
    onSelect: (station: TransitStation) => void;
}) => {
    const line = lineSlug ? index.lineBySlug.get(lineSlug) : undefined;
    const fromId = fromStation?.id ?? null;
    const summaries = useMemo(
        () => summarizeLines(index, fromId),
        [index, fromId],
    );
    if (line) {
        return (
            <LineStationPicker
                line={line}
                rows={lineStationRows(line, index)}
                selectedId={selectedId}
                disabled={disabled}
                onBack={() => onLineChange(undefined)}
                onSelect={onSelect}
            />
        );
    }
    // 出発駅を通る路線がいちばん上にあり、端の駅が街の駅なら、その街の写真つきで大きく出す
    const top = summaries[0];
    const featured = (() => {
        if (!fromStation || !top?.passesFrom) return null;
        // 街の駅でない端は写真を出さない。両端とも街の駅でなければ特集にしない (ふつうの行で出す)
        const terminalTowns = lineTerminalTowns(top.line, index).flatMap(
            (slug): Town[] => (slug ? [towns[slug]] : []),
        );
        if (terminalTowns.length === 0) return null;
        return { line: top.line, towns: terminalTowns };
    })();
    return (
        <LineList
            summaries={summaries}
            fromStation={fromStation}
            featured={featured}
            onOpenLine={onLineChange}
        />
    );
};
