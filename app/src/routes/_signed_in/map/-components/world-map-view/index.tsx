import { Spinner } from "@morinoparty/chlorophyll-react/components";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, type ReactNode, Suspense } from "react";
import { css, sva } from "../../../../../../styled-system/css";
import type {
    OverlayVisibility,
    SelfPlayer,
    Vec2,
    WorldId,
} from "../../-types/world-map";

// Leaflet は SSR で読み込めないため、地図本体はクライアントでだけ遅延読み込みする
const WorldMapCanvas = lazy(() => import("../world-map-canvas"));

const worldMapViewStyle = sva({
    slots: ["root", "controls", "message"],
    base: {
        root: {
            // ヘッダーを持たず、地図を画面いっぱいに敷く
            position: "fixed",
            inset: 0,
            // Leaflet のペインは z-index 400〜1000 を使うので、ここで重なりを閉じて TabBar を上に保つ
            isolation: "isolate",
            zIndex: "base",
            bg: "colorPalette.bg.subtle",
        },
        controls: {
            // ステータスバーの下に、左右 16px を空けて操作ボタンを並べる
            position: "fixed",
            top: "calc(env(safe-area-inset-top) + 16px)",
            left: "50%",
            transform: "translateX(-50%)",
            // 横向きでノッチがある端末では、左右の safe area の内側に収める
            width: "calc(100% - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))",
            maxWidth: "calc({sizes.md} - 32px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "3",
            zIndex: "docked",
            // 隙間のタップは地図に通す
            pointerEvents: "none",
            "& > *": {
                pointerEvents: "auto",
            },
        },
        message: {
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            px: "4",
            color: "fg.muted",
            fontSize: "sm",
            textAlign: "center",
        },
    },
});

export interface WorldMapViewProps {
    /** squaremap の公開 URL。未設定なら地図を出さずに案内だけ表示する */
    baseUrl: string | null;
    world: WorldId;
    /** 地図の中心。スポーン地点の取得中は null */
    center: Vec2 | null;
    /** 「マーカー表示」で選ばれている項目 */
    overlays: OverlayVisibility;
    /** ログイン中のプレイヤー。分からなければ null */
    self: SelfPlayer | null;
    /** 地図の左上に置く操作 */
    startControl?: ReactNode;
    /** 地図の右上に置く操作 */
    endControl?: ReactNode;
}

/** 画面いっぱいの地図と、その上に浮かぶ操作ボタン */
export const WorldMapView = ({
    baseUrl,
    world,
    center,
    overlays,
    self,
    startControl,
    endControl,
}: WorldMapViewProps) => {
    const style = worldMapViewStyle();
    // 読み込み中は文言を出さず、スピナーだけを置く
    const loading = (
        <div className={style.message}>
            <Spinner size="lg" aria-label="マップを読み込み中" />
        </div>
    );

    return (
        <div className={style.root}>
            {baseUrl === null ? (
                <p className={style.message}>マップを表示できません</p>
            ) : (
                <ClientOnly fallback={loading}>
                    {center === null ? (
                        loading
                    ) : (
                        <Suspense fallback={loading}>
                            <WorldMapCanvas
                                baseUrl={baseUrl}
                                world={world}
                                center={center}
                                overlays={overlays}
                                self={self}
                            />
                        </Suspense>
                    )}
                </ClientOnly>
            )}
            <div className={style.controls}>
                <div className={css({ minWidth: 0 })}>{startControl}</div>
                <div>{endControl}</div>
            </div>
        </div>
    );
};
