import { ArrowDown, Clock, TrainFront } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import type { RailwayRoute } from "../../-types/world-map";
import { MapPopupCard } from "../map-popup-card";

const railwayPopupStyle = sva({
    slots: [
        "header",
        "lineMark",
        "lineName",
        "stations",
        "station",
        "stationIcon",
        "stationName",
        "connector",
        "connectorLine",
        "time",
        "timeIcon",
    ],
    base: {
        header: {
            display: "flex",
            alignItems: "center",
            gap: "2",
            mb: "3",
        },
        lineMark: {
            // 路線の色はデータ由来なので CSS 変数で受け取る
            width: "4px",
            height: "16px",
            borderRadius: "full",
            bg: "var(--line-color)",
            flexShrink: 0,
        },
        lineName: {
            fontSize: "13px",
            fontWeight: "bold",
            color: "colorPalette.fg",
            lineHeight: "1.4",
        },
        stations: {
            display: "flex",
            flexDirection: "column",
        },
        station: {
            display: "flex",
            alignItems: "center",
            gap: "2",
        },
        stationIcon: {
            display: "grid",
            placeItems: "center",
            width: "28px",
            height: "28px",
            borderRadius: "l2",
            bg: "colorPalette.bg.subtle",
            color: "colorPalette.fg",
            flexShrink: 0,
            "& svg": {
                width: "16px",
                height: "16px",
            },
        },
        stationName: {
            fontSize: "md",
            fontWeight: "bold",
            color: "colorPalette.fg",
            lineHeight: "1.4",
        },
        connector: {
            // 駅アイコンの中心の真下に、路線の色の短い線を引く
            display: "grid",
            placeItems: "center",
            width: "28px",
            height: "20px",
            color: "var(--line-color)",
            "& svg": {
                width: "14px",
                height: "14px",
            },
        },
        connectorLine: {
            width: "3px",
            height: "12px",
            borderRadius: "full",
            bg: "var(--line-color)",
        },
        time: {
            // Leaflet の CSS がポップアップ内の <p> に付ける余白を消す
            m: "0",
            display: "flex",
            alignItems: "center",
            gap: "1",
            mt: "3",
            fontSize: "xs",
            color: "fg.muted",
        },
        timeIcon: {
            width: "14px",
            height: "14px",
        },
    },
});

export interface RailwayPopupProps {
    route: RailwayRoute;
    /** 路線の色 (squaremap のデータのまま) */
    lineColor: string;
}

/** 鉄道の路線をタップしたときの乗換案内 */
export const RailwayPopup = ({ route, lineColor }: RailwayPopupProps) => {
    const style = railwayPopupStyle();
    return (
        <MapPopupCard
            // 路線の色はデータ由来なのでトークンにできない。CSS 変数として渡す
            style={{ "--line-color": lineColor } as React.CSSProperties}
        >
            <div className={style.header}>
                <span className={style.lineMark} aria-hidden />
                <span className={style.lineName}>
                    {route.lineName || "鉄道"}
                </span>
            </div>
            <div className={style.stations}>
                <div className={style.station}>
                    <span className={style.stationIcon}>
                        <TrainFront aria-hidden />
                    </span>
                    <span className={style.stationName}>
                        {route.fromStation}
                    </span>
                </div>
                {/* 片道の路線だけ向きを矢印で示す */}
                <span
                    className={style.connector}
                    aria-label={
                        route.direction === "oneWay" ? "片道" : undefined
                    }
                >
                    {route.direction === "oneWay" ? (
                        <ArrowDown aria-hidden />
                    ) : (
                        <span className={style.connectorLine} aria-hidden />
                    )}
                </span>
                <div className={style.station}>
                    <span className={style.stationIcon}>
                        <TrainFront aria-hidden />
                    </span>
                    <span className={style.stationName}>{route.toStation}</span>
                </div>
            </div>
            {route.travelTime && (
                <p className={style.time}>
                    <Clock className={style.timeIcon} aria-hidden />
                    所要時間 {route.travelTime}
                </p>
            )}
        </MapPopupCard>
    );
};
