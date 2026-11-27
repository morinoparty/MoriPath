import { History, LocateFixed, Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { sva } from "../../../../../../../styled-system/css";
import { NumberingBadge } from "../../../-components/numbering-badge";
import { slotLabel } from "../../-functions/transit-search";
import type {
    DisabledStation,
    NearbyStation,
    StationMatch,
    TransitLine,
    TransitSlot,
    TransitStation,
} from "../../-types/transit";
import { StationResultRow } from "../station-result-row";
import { TransitNotice } from "../transit-notice";

const stationSearchStyle = sva({
    slots: [
        "root",
        "fieldBar",
        "field",
        "fieldIcon",
        "input",
        "count",
        "clear",
        "section",
        "sectionHeader",
        "sectionIcon",
        "sectionTitle",
        "sectionAside",
        "chips",
        "chip",
        "chipName",
        "resultsHeader",
        "resultsTitle",
        "resultsHint",
        "list",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
        },
        // 一覧をスクロールしても検索欄は上に残す。後ろを流れる一覧が透けないよう地の色を敷く
        fieldBar: {
            position: "sticky",
            top: "0",
            zIndex: 1,
            bg: "colorPalette.bg",
            paddingBottom: "2",
            marginBottom: "-2",
        },
        // 白いピルの検索欄。影は付けず、入力中だけブランド色の輪郭を出す
        field: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingX: "20px",
            paddingY: "13px",
            borderRadius: "full",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: "transparent",
            bg: "bg.panel",
            transitionProperty: "border-color",
            transitionDuration: "fast",
            _focusWithin: { borderColor: "colorPalette.solid" },
        },
        fieldIcon: {
            flexShrink: 0,
            width: "22px",
            height: "22px",
            color: "colorPalette.fg",
        },
        // iOS が入力時に拡大しないよう 16px にする
        input: {
            flex: "1",
            minWidth: "0",
            bg: "transparent",
            outline: "none",
            fontSize: "16px",
            fontWeight: "bold",
            color: "fg",
            _placeholder: {
                fontSize: "15px",
                fontWeight: "medium",
                color: "fg.muted",
            },
            // ブラウザが出す検索欄の消去ボタンは使わない (自前の消去ボタンを置く)
            "&::-webkit-search-cancel-button": { display: "none" },
        },
        count: {
            flexShrink: 0,
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
            whiteSpace: "nowrap",
        },
        clear: {
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            width: "32px",
            height: "32px",
            marginY: "-4px",
            marginRight: "-8px",
            borderRadius: "full",
            bg: "colorPalette.surface",
            color: "colorPalette.fg",
            cursor: "pointer",
            _hover: { bg: "colorPalette.surface.hover" },
            _focusVisible: {
                outline: "2px solid {colors.colorPalette.solid}",
                outlineOffset: "2px",
            },
            "& svg": { width: "14px", height: "14px" },
        },
        section: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
        },
        sectionHeader: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "colorPalette.fg",
        },
        sectionIcon: {
            flexShrink: 0,
            width: "18px",
            height: "18px",
        },
        sectionTitle: {
            fontSize: "17px",
            fontWeight: "bold",
        },
        sectionAside: {
            marginLeft: "auto",
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
            whiteSpace: "nowrap",
        },
        // 最近の駅は横にスクロールさせ、画面の端まで流す
        chips: {
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            scrollbarWidth: "none",
            marginX: "-6",
            paddingX: "6",
            "&::-webkit-scrollbar": { display: "none" },
        },
        chip: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
            paddingLeft: "8px",
            paddingRight: "14px",
            paddingY: "8px",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            cursor: "pointer",
            _hover: { bg: "colorPalette.surface.hover" },
            _focusVisible: {
                outline: "2px solid {colors.colorPalette.solid}",
                outlineOffset: "2px",
            },
            "&[aria-pressed=true]": { bg: "colorPalette.surface.active" },
            _disabled: { opacity: "0.45", cursor: "default" },
        },
        chipName: {
            fontSize: "14px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
        },
        resultsHeader: {
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            columnGap: "8px",
        },
        resultsTitle: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        resultsHint: {
            fontSize: "12px",
            fontWeight: "medium",
            color: "fg.muted",
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "8px",
        },
    },
});

export interface StationSearchProps {
    /** URL の検索語 */
    query: string;
    matches: StationMatch[];
    /** さいきん選んだ駅 (新しい順) */
    recent: TransitStation[];
    /** 現在地から近い駅。現在地が分からなければ null */
    nearby: NearbyStation[] | null;
    /** いちばん近い駅の街 (「〇〇から」) */
    selfTownLabel: string | null;
    /** 路線名を引くための索引 */
    lines: ReadonlyMap<string, TransitLine>;
    activeSlot: TransitSlot;
    /** 選んでいる駅 (選びかけの駅、なければ枠に入っている駅) */
    selectedId: string | null;
    /** もう一方の枠に入っている駅。選べないようにする */
    disabled: DisabledStation | null;
    onQueryChange: (q: string) => void;
    onSelect: (station: TransitStation) => void;
}

/**
 * 検索欄の文字は画面の中で持つ。URL を直接 value にすると、URL の更新が入力の後から届くため
 * 文字が戻ったり日本語の変換が切れたりする。外から検索語が変わったとき (駅を選んで消えた・戻るで戻った) だけ合わせる
 */
const useSearchText = (query: string, onQueryChange: (q: string) => void) => {
    const [text, setText] = useState(query);
    const [lastQuery, setLastQuery] = useState(query);
    // この欄から送った検索語。URL が追いついただけの変化と、外からの変化を見分ける
    const [sent, setSent] = useState<readonly string[]>([query]);
    // 変換中かどうか (イベントの中だけで読む)
    const composingRef = useRef(false);

    if (query !== lastQuery) {
        setLastQuery(query);
        const arrived = sent.indexOf(query);
        if (arrived !== -1) {
            // URL が送った値に追いついた。それより前に送った値だけ忘れ、次の外からの変化 (空にされた等) を拾えるようにする。
            // あとから送ってまだ URL に届いていない値は残す (残さないと、届いたときに外からの変化とみなして入力中の文字を戻してしまう)。
            // 送った順に届くので、同じ値を何度か送っていても最初のものが届いた値にあたる
            setSent(sent.slice(arrived));
        } else {
            setText(query);
        }
    }

    // URL が追いつく前に次の文字を打っても戻されないよう、送った値は追いつくまで覚えておく
    const send = (value: string) => {
        setSent((prev) => [...prev, value]);
        onQueryChange(value);
    };

    return {
        text,
        onChange: (value: string) => {
            setText(value);
            // 変換中は確定するまで送らない
            if (!composingRef.current) send(value);
        },
        onCompositionStart: () => {
            composingRef.current = true;
        },
        onCompositionEnd: (value: string) => {
            composingRef.current = false;
            send(value);
        },
        clear: () => {
            setText("");
            send("");
        },
    };
};

/** 「駅名でさがす」。入力前は最近の駅と近くの駅、入力中は当たった駅を並べる */
export const StationSearch = ({
    query,
    matches,
    recent,
    nearby,
    selfTownLabel,
    lines,
    activeSlot,
    selectedId,
    disabled,
    onQueryChange,
    onSelect,
}: StationSearchProps) => {
    const style = stationSearchStyle();
    const search = useSearchText(query, onQueryChange);
    const hasQuery = query.trim() !== "";
    const disabledLabelOf = (station: TransitStation) =>
        disabled?.id === station.id ? disabled.label : undefined;

    return (
        <div className={style.root}>
            <div className={style.fieldBar}>
                <label className={style.field}>
                    <Search className={style.fieldIcon} aria-hidden />
                    <input
                        className={style.input}
                        type="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        placeholder="駅名・ナンバリングでさがす"
                        aria-label="駅名・ナンバリングでさがす"
                        value={search.text}
                        onChange={(e) => search.onChange(e.currentTarget.value)}
                        onCompositionStart={search.onCompositionStart}
                        onCompositionEnd={(e) =>
                            search.onCompositionEnd(e.currentTarget.value)
                        }
                    />
                    {search.text !== "" && (
                        <>
                            {hasQuery && (
                                <span
                                    className={style.count}
                                >{`${matches.length}件`}</span>
                            )}
                            <button
                                type="button"
                                className={style.clear}
                                aria-label="検索語を消す"
                                onClick={search.clear}
                            >
                                <X strokeWidth={3} />
                            </button>
                        </>
                    )}
                </label>
            </div>

            {hasQuery ? (
                matches.length > 0 ? (
                    <section className={style.section} aria-label="検索結果">
                        <div className={style.resultsHeader}>
                            <p className={style.resultsTitle}>
                                {`「${query.trim()}」をふくむ駅`}
                            </p>
                            <p className={style.resultsHint}>
                                {`${slotLabel[activeSlot]}にする駅をタップ`}
                            </p>
                        </div>
                        <ul className={style.list}>
                            {matches.map(({ station, nameRange }) => (
                                <li key={station.id}>
                                    <StationResultRow
                                        station={station}
                                        lines={lines}
                                        nameRange={nameRange}
                                        selected={station.id === selectedId}
                                        disabledLabel={disabledLabelOf(station)}
                                        onClick={() => onSelect(station)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : (
                    <TransitNotice kind="noMatch" query={query.trim()} />
                )
            ) : (
                <>
                    {recent.length > 0 && (
                        <section
                            className={style.section}
                            aria-labelledby="transit-recent-title"
                        >
                            <div className={style.sectionHeader}>
                                <History
                                    className={style.sectionIcon}
                                    aria-hidden
                                />
                                <h2
                                    id="transit-recent-title"
                                    className={style.sectionTitle}
                                >
                                    さいきん選んだ駅
                                </h2>
                            </div>
                            <div className={style.chips}>
                                {recent.map((station) => {
                                    const code = station.numberings.find(
                                        (n) => n.code !== null,
                                    );
                                    return (
                                        <button
                                            key={station.id}
                                            type="button"
                                            className={style.chip}
                                            aria-pressed={
                                                station.id === selectedId
                                            }
                                            disabled={
                                                disabledLabelOf(station) !==
                                                undefined
                                            }
                                            onClick={() => onSelect(station)}
                                        >
                                            {code?.code && (
                                                <NumberingBadge
                                                    code={code.code}
                                                    color={code.color}
                                                    layout="inline"
                                                    size="sm"
                                                />
                                            )}
                                            <span className={style.chipName}>
                                                {station.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                    {nearby && nearby.length > 0 && (
                        <section
                            className={style.section}
                            aria-labelledby="transit-nearby-title"
                        >
                            <div className={style.sectionHeader}>
                                <LocateFixed
                                    className={style.sectionIcon}
                                    aria-hidden
                                />
                                <h2
                                    id="transit-nearby-title"
                                    className={style.sectionTitle}
                                >
                                    現在地から近い駅
                                </h2>
                                {selfTownLabel && (
                                    <span className={style.sectionAside}>
                                        {`${selfTownLabel}から`}
                                    </span>
                                )}
                            </div>
                            <ul className={style.list}>
                                {nearby.map(({ station, distance }, i) => (
                                    <li key={station.id}>
                                        <StationResultRow
                                            station={station}
                                            lines={lines}
                                            distance={distance}
                                            isNearest={i === 0}
                                            selected={station.id === selectedId}
                                            disabledLabel={disabledLabelOf(
                                                station,
                                            )}
                                            onClick={() => onSelect(station)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};
