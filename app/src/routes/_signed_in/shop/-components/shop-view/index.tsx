import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sva } from "../../../../../../styled-system/css";
import { HomeHeader } from "../../../../../components/home-header";
import type { SessionData } from "../../../../../lib/server-functions";
import { filterShops } from "../../-functions/filter-shops";
import type { ShopFilter, ShopListing } from "../../-types/shop";
import { ShopDetailSheet } from "../shop-detail-sheet";
import { ShopRow } from "../shop-row";

// 一度に並べる行数。アイテムの描画は重いため、続きは「もっと見る」で足す
const PAGE_SIZE = 40;
// 入力のたびに URL を書き換えないよう、打ち終わるまで待つ時間
const SEARCH_DEBOUNCE_MS = 250;

// 絞り込みチップの並びと表示名
const filterOptions: readonly { value: ShopFilter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "sell", label: "売っている" },
    { value: "buy", label: "買い取り" },
];

const shopViewStyle = sva({
    slots: [
        "root",
        "body",
        "title",
        "search",
        "searchIcon",
        "searchInput",
        "filters",
        "chip",
        "list",
        "message",
        "more",
    ],
    base: {
        root: {
            display: "flex",
            flexDirection: "column",
            // ノッチ付き端末ではステータスバーの下から始める
            paddingTop: "max(token(spacing.2), env(safe-area-inset-top))",
        },
        body: {
            display: "flex",
            flexDirection: "column",
            gap: "4",
            paddingX: "6",
            paddingTop: "2",
        },
        title: {
            fontSize: "28px",
            fontWeight: "bold",
            lineHeight: "1.4",
            color: "colorPalette.fg",
        },
        // ページの地より一段明るいピル型の検索欄
        search: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            height: "44px",
            paddingX: "4",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg.muted",
            cursor: "text",
            _focusWithin: {
                outline: "2px solid",
                outlineColor: "colorPalette.9",
                outlineOffset: "2px",
            },
        },
        searchIcon: {
            flexShrink: "0",
            width: "18px",
            height: "18px",
        },
        searchInput: {
            flex: "1",
            minWidth: "0",
            height: "full",
            bg: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg",
            _placeholder: { color: "colorPalette.fg.muted" },
            // ピル全体でフォーカスを示すため、入力欄自体の枠は出さない
            _focusVisible: { outline: "none" },
        },
        // チップの組。fieldset の既定の枠と余白は消す
        filters: {
            display: "flex",
            gap: "2",
            minWidth: "0",
            margin: "0",
            padding: "0",
            border: "none",
        },
        chip: {
            display: "inline-flex",
            alignItems: "center",
            height: "34px",
            paddingX: "3.5",
            borderRadius: "full",
            border: "none",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg.muted",
            fontSize: "13px",
            fontWeight: "medium",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
            cursor: "pointer",
            transition: "background 0.15s",
            _hover: { bg: "colorPalette.surface.hover" },
            // 選んでいるチップはブランド色で塗る
            _pressed: {
                bg: "colorPalette.solid",
                color: "colorPalette.contrast",
                fontWeight: "bold",
            },
        },
        list: {
            display: "flex",
            flexDirection: "column",
            gap: "2",
            listStyle: "none",
        },
        message: {
            paddingY: "8",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "medium",
            color: "colorPalette.fg.muted",
        },
        more: {
            alignSelf: "center",
            height: "40px",
            paddingX: "5",
            borderRadius: "full",
            border: "none",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            _hover: { bg: "colorPalette.surface.hover" },
        },
    },
});

/** 入力をそのまま画面に映しつつ、親への通知だけを遅らせる検索欄の状態 */
const useDebouncedSearch = (
    query: string,
    onQueryChange: (query: string) => void,
) => {
    const [draft, setDraft] = useState(query);
    const [syncedQuery, setSyncedQuery] = useState(query);
    // 戻る・進むなどで URL 側の検索語が変わったら、描画中に入力欄も合わせる
    if (query !== syncedQuery) {
        setSyncedQuery(query);
        setDraft(query);
    }
    useEffect(() => {
        if (draft === query) {
            return;
        }
        const timer = setTimeout(
            () => onQueryChange(draft),
            SEARCH_DEBOUNCE_MS,
        );
        return () => clearTimeout(timer);
    }, [draft, query, onQueryChange]);
    return [draft, setDraft] as const;
};

export interface ShopViewProps {
    session: SessionData;
    /** すべてのお店 (在庫のあるお店が先)。取得できなければ null */
    shops: ShopListing[] | null;
    /** 検索語 (URL の q) */
    query: string;
    /** 絞り込みチップ (URL の mode) */
    filter: ShopFilter;
    onQueryChange: (query: string) => void;
    onFilterChange: (filter: ShopFilter) => void;
    /** 最初から詳細シートを開いておくお店 (Storybook 用) */
    defaultSelectedShop?: ShopListing;
}

/** おみせ画面の見た目。お店の取得はルートの loader が、検索語とチップは URL が持つ */
export const ShopView = ({
    session,
    shops,
    query,
    filter,
    onQueryChange,
    onFilterChange,
    defaultSelectedShop,
}: ShopViewProps) => {
    const style = shopViewStyle();
    const [draft, setDraft] = useDebouncedSearch(query, onQueryChange);
    // 表示件数は検索語とチップの組ごとに持ち、条件が変わったら先頭の数件に戻す
    const listKey = `${filter}:${query}`;
    const [paging, setPaging] = useState({ key: listKey, count: PAGE_SIZE });
    const visibleCount = paging.key === listKey ? paging.count : PAGE_SIZE;
    // 閉じるアニメーションのあいだも中身を残すため、選んだお店と開閉は別に持つ
    const [selectedShop, setSelectedShop] = useState<ShopListing | null>(
        defaultSelectedShop ?? null,
    );
    const [isSheetOpen, setIsSheetOpen] = useState(
        defaultSelectedShop !== undefined,
    );

    const filteredShops = useMemo(
        () => (shops ? filterShops(shops, query, filter) : []),
        [shops, query, filter],
    );
    const visibleShops = filteredShops.slice(0, visibleCount);

    const openShop = (shop: ShopListing) => {
        setSelectedShop(shop);
        setIsSheetOpen(true);
    };

    return (
        <div className={style.root}>
            <HomeHeader.Builted session={session} />
            <div className={style.body}>
                <h1 className={style.title}>おみせ</h1>
                <label className={style.search}>
                    <Search className={style.searchIcon} aria-hidden />
                    <input
                        type="search"
                        className={style.searchInput}
                        placeholder="アイテムを探す"
                        aria-label="アイテムを探す"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                    />
                </label>
                <fieldset aria-label="お店の種類" className={style.filters}>
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            // 選んでいるチップは押されたままのトグルボタンとして伝える
                            aria-pressed={filter === option.value}
                            className={style.chip}
                            onClick={() => onFilterChange(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </fieldset>
                {shops === null ? (
                    <p className={style.message}>
                        お店の一覧を読み込めませんでした
                    </p>
                ) : filteredShops.length === 0 ? (
                    <p className={style.message}>
                        {query
                            ? `「${query}」のお店は見つかりませんでした`
                            : "お店がありません"}
                    </p>
                ) : (
                    <>
                        <ul className={style.list}>
                            {visibleShops.map((shop) => (
                                <li key={shop.id}>
                                    <ShopRow
                                        shop={shop}
                                        onClick={() => openShop(shop)}
                                    />
                                </li>
                            ))}
                        </ul>
                        {filteredShops.length > visibleCount && (
                            <button
                                type="button"
                                className={style.more}
                                onClick={() =>
                                    setPaging({
                                        key: listKey,
                                        count: visibleCount + PAGE_SIZE,
                                    })
                                }
                            >
                                もっと見る (
                                {filteredShops.length - visibleCount}件)
                            </button>
                        )}
                    </>
                )}
            </div>
            <ShopDetailSheet
                shop={selectedShop}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </div>
    );
};
