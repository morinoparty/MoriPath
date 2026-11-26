import { Button } from "@morinoparty/chlorophyll-react/components";
import {
    CircleAlert,
    RotateCw,
    Route,
    SearchX,
    TrainFront,
} from "lucide-react";
import { sva } from "../../../../../../../styled-system/css";

const transitNoticeStyle = sva({
    slots: ["root", "icon", "title", "description"],
    base: {
        // 一覧や経路の場所に出す、柔らかい面の案内カード
        root: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3",
            padding: "6",
            borderRadius: "28px",
            bg: "colorPalette.surface.subtle",
            textAlign: "center",
        },
        icon: {
            display: "grid",
            placeItems: "center",
            width: "56px",
            height: "56px",
            borderRadius: "full",
            bg: "colorPalette.surface",
            color: "colorPalette.fg",
            "& svg": { width: "26px", height: "26px" },
        },
        title: {
            fontSize: "16px",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        description: {
            fontSize: "13px",
            fontWeight: "medium",
            color: "fg.muted",
        },
    },
});

export type TransitNoticeKind =
    | "unavailable"
    | "networkError"
    | "noRoute"
    | "sameStation"
    | "stationNotFound"
    | "routeUnavailable"
    | "routeError"
    | "noMatch";

/** 案内ごとの見出しと説明。noMatch だけは検索語を入れる */
const copies: Record<
    TransitNoticeKind,
    { title: (query: string) => string; description: string; retry?: string }
> = {
    unavailable: {
        title: () => "乗換案内を使えません",
        description:
            "鉄道の情報を読み込めませんでした。しばらくしてから開きなおしてください",
    },
    networkError: {
        title: () => "乗換案内を読み込めませんでした",
        description: "通信がうまくいきませんでした。もう一度おためしください",
        retry: "もう一度読み込む",
    },
    noRoute: {
        title: () => "経路が見つかりませんでした",
        description:
            "この 2 駅をむすぶ路線がありません。ほかの駅をえらんでください",
    },
    sameStation: {
        title: () => "出発と到着が同じ駅です",
        description: "どちらかの駅をえらびなおしてください",
    },
    stationNotFound: {
        title: () => "駅が見つかりませんでした",
        description: "駅がなくなったかもしれません。えらびなおしてください",
    },
    routeUnavailable: {
        title: () => "いまは経路をしらべられません",
        description: "しばらくしてからもう一度おためしください",
    },
    routeError: {
        title: () => "経路をしらべられませんでした",
        description: "もう一度おためしください",
        retry: "もう一度しらべる",
    },
    noMatch: {
        title: (query) => `「${query}」に当たる駅はありません`,
        description: "ひらがなやナンバリング (PAK03 など) でもさがせます",
    },
};

/** 案内ごとのアイコン */
const NoticeIcon = ({ kind }: { kind: TransitNoticeKind }) => {
    switch (kind) {
        case "unavailable":
        case "networkError":
            return <TrainFront />;
        case "noRoute":
            return <Route />;
        case "noMatch":
            return <SearchX />;
        default:
            return <CircleAlert />;
    }
};

export interface TransitNoticeProps {
    kind: TransitNoticeKind;
    /** noMatch のときの検索語 */
    query?: string;
    /** 渡したときだけ再試行ボタンを出す (networkError / routeError) */
    onRetry?: () => void;
}

/** 使えない・見つからない・失敗したときの案内 */
export const TransitNotice = ({
    kind,
    query = "",
    onRetry,
}: TransitNoticeProps) => {
    const style = transitNoticeStyle();
    const copy = copies[kind];
    return (
        <div className={style.root} role={copy.retry ? "alert" : "status"}>
            <span className={style.icon} aria-hidden>
                <NoticeIcon kind={kind} />
            </span>
            <p className={style.title}>{copy.title(query)}</p>
            <p className={style.description}>{copy.description}</p>
            {copy.retry && onRetry && (
                <Button intent="secondary" onClick={onRetry}>
                    <RotateCw />
                    {copy.retry}
                </Button>
            )}
        </div>
    );
};
