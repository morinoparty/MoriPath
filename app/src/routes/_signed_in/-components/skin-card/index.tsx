import {
    PlayerAvatar,
    SkinViewer,
} from "@morinoparty/chlorophyll-react/components";
import { CatchBoundary } from "@tanstack/react-router";
import { sva } from "../../../../../styled-system/css";

const skinCardStyle = sva({
    slots: ["root", "viewer", "fallback", "name"],
    base: {
        // ページの地より一段明るい面。枠線と影は付けない
        root: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "3",
            minWidth: "0",
            paddingTop: "5",
            paddingBottom: "4",
            paddingX: "2",
            bg: "colorPalette.surface.subtle",
            borderRadius: "panel",
        },
        viewer: {
            // カードの面をそのまま見せるため、SkinViewer 既定の背景を消す
            bg: "transparent",
            // OrbitControls が inline で touch-action: none を付けるため、縦スクロールを取り戻す
            touchAction: "pan-y !important",
            maxWidth: "full",
        },
        // WebGL が使えないときやプレイヤーが分からないときは顔だけ出す
        fallback: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "1",
        },
        name: {
            maxWidth: "full",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textStyle: "sm",
            fontWeight: "bold",
            color: "colorPalette.fg.muted",
        },
    },
});

// 全身が縦長に収まるキャンバスの大きさ。320px 幅の画面でもカードからはみ出さない幅にする
const SKIN_WIDTH = 120;
const SKIN_HEIGHT = 230;

interface SkinCardProps {
    /** Minecraft の UUID。分からなければ null (顔のフォールバックだけを出す) */
    playerId: string | null;
    playerName: string;
}

/** ホームのヒーローに置く、自分のスキンと名前のカード */
export const SkinCard = ({ playerId, playerName }: SkinCardProps) => {
    const style = skinCardStyle();

    // UUID が無いとスキンも顔も引けないため、名前の頭文字で代用する
    const fallback = (
        <div className={style.fallback}>
            <PlayerAvatar
                playerId={playerId ?? playerName}
                playerName={playerName}
                size="lg"
                decorative
            />
        </div>
    );

    return (
        <div className={style.root}>
            {playerId ? (
                // WebGL を作れない環境では effect 内で例外になるため、ホーム全体を巻き込まないよう囲う
                <CatchBoundary
                    getResetKey={() => playerId}
                    errorComponent={() => fallback}
                >
                    <SkinViewer
                        playerId={playerId}
                        width={SKIN_WIDTH}
                        height={SKIN_HEIGHT}
                        // スクロールの邪魔をしないよう、回転も操作もしない静止ポーズにする
                        autoRotate={false}
                        interactive={false}
                        yaw={20}
                        pitch={5}
                        animation="idle"
                        className={style.viewer}
                        aria-label={`${playerName} のスキン`}
                    />
                </CatchBoundary>
            ) : (
                fallback
            )}
            <p className={style.name}>{playerName}</p>
        </div>
    );
};
