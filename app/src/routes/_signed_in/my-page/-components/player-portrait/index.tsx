import {
    PlayerAvatar,
    SkinViewer,
} from "@morinoparty/chlorophyll-react/components";
import { memo } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import { useFitText } from "../../../../../lib/use-fit-text";
import { estimateSkinHead } from "../../-functions/collapsing-portrait";
import { useCollapsingPortrait } from "../../-functions/use-collapsing-portrait";
import type { MyPagePlayer, PlayerPresence } from "../../-types/my-page";

// 背景に敷くサーバーのスクリーンショット (public 配下)
const WORLD_IMAGE_URL = "/castle-width.png";

// 3D スキンの canvas の大きさ。最初に 1 回だけ作り、縮小は transform で行う
const SKIN_WIDTH = 240;
const SKIN_HEIGHT = 576;
const SKIN_HEAD = estimateSkinHead({ width: SKIN_WIDTH, height: SKIN_HEIGHT });

// ポートレートとコンパクトバーの高さ (ステータスバー分の safe-area を除く)。
// 差がアニメーションに使うスクロール量になる
const HERO_BASE_HEIGHT = 522;
const BAR_BASE_HEIGHT = 68;

/** ポートレートが縮みきるまでのスクロール量 (px)。ページの最低の高さに足して、最後まで動かせるようにする */
export const PORTRAIT_COLLAPSE_DISTANCE = HERO_BASE_HEIGHT - BAR_BASE_HEIGHT;

const playerPortraitStyle = sva({
    slots: [
        "root",
        "hero",
        "world",
        "wash",
        "overlay",
        "skin",
        "skinCanvas",
        "heroBand",
        "bandBlur",
        "bandTint",
        "content",
        "name",
        "nameText",
        "badges",
        "badge",
        "dot",
        "bar",
        "barBackground",
        "barContent",
        "barAvatar",
        "barName",
        "barDot",
    ],
    base: {
        root: {
            // アニメーションの位置の基準 (offsetParent) にする
            position: "relative",
        },
        hero: {
            // 流れの中に高さだけを確保し、ぼかした背景を敷く層。ステータスバーの下まで全面に敷く
            position: "relative",
            height: `calc(${HERO_BASE_HEIGHT}px + env(safe-area-inset-top))`,
            overflow: "hidden",
        },
        world: {
            // ぼかしで端が透けないよう、外側に 20px はみ出させてから切り取る
            position: "absolute",
            inset: "-20px",
            width: "calc(100% + 40px)",
            height: "calc(100% + 40px)",
            objectFit: "cover",
            // Figma の layer blur 16 / 彩度 -0.35 / 露出 +0.15 に相当
            filter: "blur(8px) saturate(0.65) brightness(1.1)",
        },
        wash: {
            // 背景を地の色で薄く覆い、手前のスキンと文字を読みやすくする
            position: "absolute",
            inset: "0",
            bg: "color-mix(in srgb, {colors.colorPalette.bg} 60%, transparent)",
        },
        overlay: {
            // スキン・名前・グラデーション帯の層。バーより手前に置き、スキンをバーのアバター位置まで運ぶ。
            // ポートレートと同じ範囲で切り取るので、縮んだ体はバーの下端で隠れる
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            height: `calc(${HERO_BASE_HEIGHT}px + env(safe-area-inset-top))`,
            overflow: "hidden",
            zIndex: "calc({zIndex.docked} + 1)",
            // 見た目だけの層なので、タッチとクリックは下へ通してスクロールを妨げない
            pointerEvents: "none",
        },
        skin: {
            // 中央に置いた canvas を JS で translate + scale する (transform-origin は顔の中心)
            position: "absolute",
            top: "calc(34px + env(safe-area-inset-top))",
            left: `calc(50% - ${SKIN_WIDTH / 2}px)`,
            width: `${SKIN_WIDTH}px`,
            height: `${SKIN_HEIGHT}px`,
            willChange: "transform, opacity",
        },
        skinCanvas: {
            // 背景の面を消して、ぼかした背景の上にスキンだけを出す
            bg: "transparent",
            borderRadius: "0",
            // OrbitControls が付ける touch-action: none を打ち消し、スマホで縦スクロールできるようにする
            touchAction: "pan-y !important",
        },
        heroBand: {
            opacity: 0,
        },
        bandBlur: {
            // 下端 160px を、下に行くほど強くぼかす (マスクで上端のぼかしを消す)
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            height: "160px",
            backdropFilter: "blur(14px)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 35%)",
        },
        bandTint: {
            // 同じ範囲を、下に行くほど濃い面の色で覆い、下の本文の地につなげる
            position: "absolute",
            left: "0",
            right: "0",
            bottom: "0",
            height: "160px",
            bg: "linear-gradient(180deg, color-mix(in srgb, {colors.colorPalette.surface} 0%, transparent) 0%, color-mix(in srgb, {colors.colorPalette.surface} 55%, transparent) 30%, color-mix(in srgb, {colors.colorPalette.surface} 75%, transparent) 70%, {colors.colorPalette.bg} 100%)",
        },
        content: {
            // 名前とピルを下端に寄せる
            position: "absolute",
            inset: "0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: "3",
            paddingX: "6",
            paddingBottom: "4",
        },
        name: {
            // 幅いっぱいを測るため横の余白は持たない (useFitText の基準)
            textStyle: "display",
            color: "colorPalette.fg",
            transformOrigin: "0 0",
            willChange: "transform, opacity",
        },
        nameText: {
            display: "inline-block",
            whiteSpace: "nowrap",
        },
        badges: {
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
        },
        badge: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            paddingX: "10px",
            paddingY: "1",
            borderRadius: "full",
            bg: "colorPalette.bg.subtle",
            color: "colorPalette.fg",
            fontSize: "12px",
            fontWeight: "medium",
            lineHeight: "1.5",
        },
        dot: {
            width: "8px",
            height: "8px",
            flexShrink: 0,
            borderRadius: "full",
            bg: "colorPalette.solid",
        },
        bar: {
            // スクロールすると上に現れるバー。Layout と同じ幅で画面上端に固定する
            position: "fixed",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "md",
            zIndex: "docked",
            // 見た目だけの複製なので操作を受け取らない
            pointerEvents: "none",
        },
        barBackground: {
            // 半透明の地 + ぼかし。スクロールに合わせて JS で不透明度を上げる
            position: "absolute",
            inset: "0",
            bg: "color-mix(in srgb, {colors.colorPalette.bg} 80%, transparent)",
            backdropFilter: "blur(10px)",
            opacity: 0,
        },
        barContent: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "3",
            // ステータスバーの下に 14px 空ける (中身 40px + 上下 14px = 68px)
            paddingTop: "calc(env(safe-area-inset-top) + 14px)",
            paddingBottom: "14px",
            paddingX: "6",
        },
        barAvatar: {
            // 3D スキンの顔が着地する 40px の枠
            position: "relative",
            width: "40px",
            height: "40px",
            flexShrink: 0,
            overflow: "hidden",
            borderRadius: "control",
            opacity: 0,
            // PlayerAvatar は 48px (md) しかないため、40px に縮めて枠に収める
            "& > *": {
                transform: "scale(0.8333)",
                transformOrigin: "0 0",
            },
        },
        barName: {
            flex: 1,
            minWidth: 0,
            textStyle: "display",
            fontSize: "22px",
            color: "colorPalette.fg",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            opacity: 0,
        },
        barDot: {
            width: "8px",
            height: "8px",
            flexShrink: 0,
            borderRadius: "full",
            bg: "colorPalette.solid",
            opacity: 0,
        },
    },
});

interface PortraitSkinProps {
    playerId: string;
    playerName: string;
    yaw: number;
    className: string;
}

// yaw が変わったときだけ再レンダーされるよう、SkinViewer を小さな部品に閉じ込める
const PortraitSkin = memo(
    ({ playerId, playerName, yaw, className }: PortraitSkinProps) => (
        <SkinViewer
            playerId={playerId}
            width={SKIN_WIDTH}
            height={SKIN_HEIGHT}
            // yaw は最初から数値で渡す (undefined から切り替えると向きが飛ぶ)
            yaw={yaw}
            pitch={0}
            autoRotate={false}
            interactive={false}
            animation="none"
            className={className}
            aria-label={`${playerName} のスキン`}
        />
    ),
);

export interface PlayerPortraitProps {
    player: MyPagePlayer;
    /** オンライン状況。取得できなければ null (ピルを出さない) */
    presence: PlayerPresence | null;
    className?: string;
}

/**
 * マイページ上部の全面ポートレート。
 * スクロールすると 3D スキンが 1 回転しながら縮み、上端のコンパクトバーのアバターへ移る
 */
export const PlayerPortrait = ({
    player,
    presence,
    className,
}: PlayerPortraitProps) => {
    const style = playerPortraitStyle();
    // 名前は 40px を基準に、幅に収まらなければ 22px まで縮める
    const {
        containerRef: nameRef,
        textRef: nameTextRef,
        fontSize: nameFontSize,
    } = useFitText<HTMLHeadingElement, HTMLSpanElement>({
        text: player.name,
        baseFontSize: 40,
        minFontSize: 22,
    });
    // 名前の要素は useFitText と共有し、フォントサイズが変わったら位置を測り直す
    const {
        rootRef,
        heroRef,
        skinRef,
        badgesRef,
        bandRef,
        heroBandRef,
        barRef,
        barBackgroundRef,
        barAvatarRef,
        barNameRef,
        barDotRef,
        yaw,
    } = useCollapsingPortrait({
        skinHead: SKIN_HEAD,
        nameRef,
        measureKey: nameFontSize,
    });
    const isOnline = presence?.online === true;

    return (
        <div ref={rootRef} className={cx(style.root, className)}>
            <div ref={heroRef} className={style.hero}>
                <img
                    src={WORLD_IMAGE_URL}
                    alt=""
                    className={style.world}
                    decoding="async"
                />
                <div className={style.wash} />
                {/* 手前の帯が消えた後も、背景の下端を本文の地へなじませる (最初は手前の帯と重ならないよう隠す) */}
                <div ref={heroBandRef} className={style.heroBand}>
                    <div className={style.bandBlur} />
                    <div className={style.bandTint} />
                </div>
            </div>

            <div className={style.overlay}>
                <div
                    ref={skinRef}
                    className={style.skin}
                    style={{
                        transformOrigin: `${SKIN_HEAD.centerX}px ${SKIN_HEAD.centerY}px`,
                    }}
                >
                    <PortraitSkin
                        playerId={player.id}
                        playerName={player.name}
                        yaw={yaw}
                        className={style.skinCanvas}
                    />
                </div>
                <div ref={bandRef}>
                    <div className={style.bandBlur} />
                    <div className={style.bandTint} />
                </div>
                <div className={style.content}>
                    <h1
                        ref={nameRef}
                        className={style.name}
                        // h1 にも同じ大きさを当て、行の高さを名前の大きさにそろえる (FLIP の縮尺に使う)
                        style={{ fontSize: nameFontSize }}
                    >
                        <span
                            ref={nameTextRef}
                            className={style.nameText}
                            style={{ fontSize: nameFontSize }}
                        >
                            {player.name}
                        </span>
                    </h1>
                    {presence && (
                        <div ref={badgesRef} className={style.badges}>
                            <span className={style.badge}>
                                {isOnline && (
                                    <span className={style.dot} aria-hidden />
                                )}
                                {isOnline ? "オンライン" : "オフライン"}
                            </span>
                            {presence.serverName && (
                                <span className={style.badge}>
                                    {presence.serverName}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 大きな表示と同じ内容の複製なので、読み上げからは外す */}
            <div ref={barRef} className={style.bar} aria-hidden>
                <div ref={barBackgroundRef} className={style.barBackground} />
                <div className={style.barContent}>
                    <div ref={barAvatarRef} className={style.barAvatar}>
                        <PlayerAvatar
                            playerId={player.id}
                            playerName={player.name}
                            size="md"
                            decorative
                        />
                    </div>
                    <span ref={barNameRef} className={style.barName}>
                        {player.name}
                    </span>
                    {isOnline && (
                        <span ref={barDotRef} className={style.barDot} />
                    )}
                </div>
            </div>
        </div>
    );
};
