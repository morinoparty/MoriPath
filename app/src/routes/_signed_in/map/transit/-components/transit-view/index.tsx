import { Await } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { css } from "../../../../../../../styled-system/css";
import { SubPageBar } from "../../../../../../components/sub-page-bar";
import { indexTransitNetwork } from "../../-functions/index-transit-network";
import {
    lineStationRows,
    lineTerminalTowns,
    summarizeLines,
} from "../../-functions/line-summaries";
import { searchStations } from "../../-functions/match-stations";
import {
    findNearbyStations,
    resolveHeroTown,
    townOf,
} from "../../-functions/nearby-stations";
import { DEFAULT_TOWN, towns } from "../../-functions/town-stations";
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
import { LineList } from "../line-list";
import { LineStationPicker } from "../line-station-picker";
import { ModeTabs } from "../mode-tabs";
import { RouteResult, RouteResultLoading } from "../route-result";
import { SelectStationBar } from "../select-station-bar";
import { StationSearch } from "../station-search";
import { StationSlots } from "../station-slots";
import { TownHeroBackground, TownHeroLogo } from "../town-hero";
import { TransitNotice } from "../transit-notice";

// タブバーを出さない下層ページなので、画面の高さいっぱいに地の色を敷く。
// 写真の層を root に重ねるため position を持たせ、横にはみ出る写真は切る (sticky を壊さない clip)
const rootStyle = css({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    paddingX: "6",
    paddingTop: "4",
    paddingBottom:
        "max({spacing.6}, calc(env(safe-area-inset-bottom) + {spacing.2}))",
    bg: "colorPalette.bg",
    overflowX: "clip",
});

// 中身は写真の層より上に重ねる
const contentStyle = css({
    position: "relative",
    zIndex: 1,
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "3.5",
});

// 下に固定のボタンが出ているあいだは、ボタンの上のぼかしに最後の行が隠れないよう余白を空ける
const paneStyle = css({
    display: "flex",
    flexDirection: "column",
    "&[data-reserve=true]": { paddingBottom: "72px" },
});

export interface TransitViewProps {
    /** 駅と路線。API を使えなければ null */
    network: TransitNetwork | null;
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
    /** 選びかけの駅を枠に入れたときの次の URL の状態と、その駅の slug (さいきん選んだ駅に足す) */
    onConfirmStation: (next: TransitSearch, slug: string) => void;
    onRetryRoute: () => void;
}

/** 選びかけの駅。どの枠・モード・路線で選んだかを覚え、どれかが変わったら捨てる */
interface PendingPick {
    slot: TransitSlot;
    slug: string;
    context: string;
}

/** 乗換案内の画面。駅の選び方 (路線・駅名) と経路を、URL の状態に合わせて出し分ける */
export const TransitView = (props: TransitViewProps) => {
    const { network } = props;
    const index = useMemo(
        () => (network ? indexTransitNetwork(network) : null),
        [network],
    );

    // 駅の情報が無いときは写真と見出しだけを出し、使えない旨を伝える
    if (!index) {
        const town = towns[DEFAULT_TOWN];
        return (
            <div className={rootStyle}>
                <TownHeroBackground town={town} compact={false} />
                <div className={contentStyle}>
                    <SubPageBar title="乗換案内" backTo="/map" />
                    <TownHeroLogo town={town} compact={false} />
                    <TransitNotice kind="unavailable" />
                </div>
            </div>
        );
    }
    return <TransitBody {...props} index={index} />;
};

const TransitBody = ({
    index,
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

    // 選びかけの駅は、選んだときの枠・モード・路線のままのときだけ有効にする (effect を使わずに捨てる)
    const pickContext = `${activeSlot}|${mode}|${search.line ?? ""}`;
    const [pending, setPending] = useState<PendingPick | null>(null);
    // 枠・モード・路線が変わったら選びかけの駅を捨てる。残すと、同じ枠を選び直したときに古い駅が戻ってくる
    if (
        pending &&
        (pending.slot !== activeSlot || pending.context !== pickContext)
    ) {
        setPending(null);
    }
    const pendingStation =
        pending &&
        pending.slot === activeSlot &&
        pending.context === pickContext
            ? stationOf(pending.slug)
            : null;

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

    // 写真の街は、選びかけ → 到着 → 出発の駅の街 (街の駅でなければいちばん近い街)
    const heroTown =
        towns[
            resolveHeroTown(
                pendingStation ?? toStation ?? fromStation,
                stations,
            )
        ];
    // 検索の入力中は一覧を広く見せるため、写真を細くする
    const compact = mode === "search" && query !== "" && activeSlot !== null;

    const currentOfActive =
        activeSlot === "from"
            ? fromStation
            : activeSlot === "to"
              ? toStation
              : null;
    const selectedId = pendingStation?.id ?? currentOfActive?.id ?? null;
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
        setPending({
            slot: activeSlot,
            slug: station.slug,
            context: pickContext,
        });
    };

    return (
        <div className={rootStyle}>
            <TownHeroBackground town={heroTown} compact={compact} />
            <div className={contentStyle}>
                <SubPageBar title="乗換案内" backTo="/map" />
                <TownHeroLogo town={heroTown} compact={compact} />
                <StationSlots
                    // 選んでいる枠には選びかけの駅をすぐに出す
                    from={
                        activeSlot === "from" && pendingStation
                            ? pendingStation
                            : fromStation
                    }
                    to={
                        activeSlot === "to" && pendingStation
                            ? pendingStation
                            : toStation
                    }
                    activeSlot={activeSlot}
                    onEditSlot={onEditSlot}
                    onSwap={onSwap}
                />
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
                ) : (
                    <>
                        <ModeTabs value={mode} onValueChange={onModeChange} />
                        <div
                            className={paneStyle}
                            data-reserve={pendingStation !== null}
                        >
                            {mode === "line" ? (
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
                                        .filter(
                                            (s): s is TransitStation =>
                                                s !== null,
                                        )}
                                    nearby={nearby}
                                    selfTownLabel={
                                        nearby?.[0]
                                            ? (townOf(nearby[0].station)
                                                  ?.label ?? null)
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
                        {pendingStation && (
                            <SelectStationBar
                                station={pendingStation}
                                slot={activeSlot}
                                onConfirm={() =>
                                    onConfirmStation(
                                        chooseStation(
                                            search,
                                            index,
                                            activeSlot,
                                            pendingStation.slug,
                                        ),
                                        pendingStation.slug,
                                    )
                                }
                            />
                        )}
                    </>
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
