import { Spinner } from "@morinoparty/chlorophyll-react/components";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, type ReactNode, Suspense } from "react";
import { css, sva } from "../../../../../../styled-system/css";
import type { MapPinTarget } from "../../-types/map-pin-target";
import type {
    MapPlayer,
    OverlayVisibility,
    SelfPlayer,
    Vec2,
    WorldId,
} from "../../-types/world-map";

// Leaflet は SSR で読み込めないため、地図本体はクライアントでだけ遅延読み込みする
const WorldMapCanvas = lazy(() => import("../world-map-canvas"));

const worldMapViewStyle = sva({
    slots: ["root", "controls", "notice", "bottomControls", "message"],
    base: {
        root: {
            // ヘッダーを持たず、地図を画面いっぱいに敷く
            position: "fixed",
            inset: 0,
            // Leaflet のペインは z-index 400〜1000 を使うので、ここで重なりを閉じて TabBar を上に保つ
            isolation: "isolate",
            zIndex: "base",
            // タイルの無いところ (読み込み前・範囲外) の色。ネザーとエンドはゲームの空と同じ暗い色にし、
            // 明るい面がタイルの縁に見えないようにする。下の地図 (world-map-canvas) も同じ変数で塗る
            "--map-void": "{colors.colorPalette.bg.subtle}",
            // ネザーの霧の色 (Minecraft の nether_wastes の fog_color 0x330808)
            "&[data-world=minecraft_the_nether]": { "--map-void": "#330808" },
            // エンドの空は黒
            "&[data-world=minecraft_the_end]": { "--map-void": "#000000" },
            bg: "var(--map-void)",
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
        // 操作ボタンの段の下に、中央寄せで出すお知らせ (追いかけている人など)
        notice: {
            position: "fixed",
            // 上の操作ボタン (48px) の下に 8px 空ける
            top: "calc(env(safe-area-inset-top) + 16px + 48px + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            // 右上に縦に並ぶボタン (48px + 余白) と重ならないよう、左右を空けた幅の中で中央に置く
            width: "calc(100% - 144px - env(safe-area-inset-left) - env(safe-area-inset-right))",
            display: "flex",
            justifyContent: "center",
            zIndex: "docked",
            // 札の左右の隙間のタップは地図に通す
            pointerEvents: "none",
            "& > *": {
                pointerEvents: "auto",
            },
        },
        // 右下の操作 (乗換案内)。上の操作ボタンと同じ幅にそろえ、浮いている TabBar の上に置く
        bottomControls: {
            position: "fixed",
            // TabBar の下端 (max(24px, safe area + 8px)) + 高さ 64px + 16px の余白
            bottom: "calc(max(24px, env(safe-area-inset-bottom) + 8px) + 64px + 16px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))",
            maxWidth: "calc({sizes.md} - 32px)",
            display: "flex",
            justifyContent: "flex-end",
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
    /** URL で指された地点。無ければ null */
    pin?: (MapPinTarget & { label?: string }) | null;
    /** ピンを外す */
    onClearPin?: () => void;
    /** 地図の左上に置く操作 */
    startControl?: ReactNode;
    /** 地図の右上に置く操作 */
    endControl?: ReactNode;
    /** 操作ボタンの下に出すお知らせ */
    notice?: ReactNode;
    /** 地図の右下に置く操作 */
    bottomEndControl?: ReactNode;
    /** 追いかけている人 (表示中のワールドにいるときだけ) */
    followed?: MapPlayer | null;
    /** 地図をドラッグして、追いかけるのをやめた */
    onFollowCancel?: () => void;
}

/** 画面いっぱいの地図と、その上に浮かぶ操作ボタン */
export const WorldMapView = ({
    baseUrl,
    world,
    center,
    overlays,
    self,
    pin,
    onClearPin,
    startControl,
    endControl,
    notice,
    bottomEndControl,
    followed,
    onFollowCancel,
}: WorldMapViewProps) => {
    const style = worldMapViewStyle();
    // 読み込み中は文言を出さず、スピナーだけを置く
    const loading = (
        <div className={style.message}>
            <Spinner size="lg" aria-label="マップを読み込み中" />
        </div>
    );

    return (
        <div className={style.root} data-world={world}>
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
                                pin={pin}
                                onClearPin={onClearPin}
                                followed={followed}
                                onFollowCancel={onFollowCancel}
                            />
                        </Suspense>
                    )}
                </ClientOnly>
            )}
            <div className={style.controls}>
                <div className={css({ minWidth: 0 })}>{startControl}</div>
                <div>{endControl}</div>
            </div>
            {notice && <div className={style.notice}>{notice}</div>}
            {bottomEndControl && (
                <div className={style.bottomControls}>{bottomEndControl}</div>
            )}
        </div>
    );
};
