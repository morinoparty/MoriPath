import {
    interpolateSkinViewerPose,
    PlayerAvatar,
    SkinViewer,
    type SkinViewerAnimation,
    type SkinViewerPose,
    useMinecraftConfig,
} from "@morinoparty/chlorophyll-react/components";
import { CatchBoundary } from "@tanstack/react-router";
import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { cx, sva } from "../../../../../../styled-system/css";
import { useFitText } from "../../../../../lib/use-fit-text";
import {
    estimateSkinHead,
    zoomForTallerCanvas,
} from "../../-functions/collapsing-portrait";
import {
    pickPortraitPose,
    resolvePortraitPose,
} from "../../-functions/portrait-pose";
import { useCollapsingPortrait } from "../../-functions/use-collapsing-portrait";
import { usePrefersReducedMotion } from "../../-functions/use-prefers-reduced-motion";
import type { MyPagePlayer, PlayerPresence } from "../../-types/my-page";
import type { PortraitPoseId } from "../../-types/portrait-pose";

// SSR では useLayoutEffect が警告を出すため、サーバーでは useEffect に切り替える
const useIsomorphicLayoutEffect =
    typeof window === "undefined" ? useEffect : useLayoutEffect;

// 背景に敷くサーバーのスクリーンショット (public 配下)
const WORLD_IMAGE_URL = "/castle-width.png";

// 3D スキンの canvas の大きさ。最初に 1 回だけ作り、縮小は transform で行う。
// 横幅は斜めのポーズで前に出した腕と持ったアイテムが切れない広さにする (顔の位置は幅の中央で変わらない)
const SKIN_WIDTH = 440;
// canvas の上端 (ポートレートの上端から)。この余白の分だけ canvas を上下に広げ、
// 掲げたツルハシの先が canvas の上端で切れないようにする
const SKIN_TOP = 34;
const SKIN_HEADROOM = SKIN_TOP;
const SKIN_BASE_HEIGHT = 576;
const SKIN_HEIGHT = SKIN_BASE_HEIGHT + SKIN_HEADROOM * 2;
// 広げてもスキンの大きさと顔の位置 (画面上) が変わらないよう、カメラを引く
const SKIN_ZOOM = zoomForTallerCanvas({
    baseHeight: SKIN_BASE_HEIGHT,
    height: SKIN_HEIGHT,
});
const SKIN_HEAD = estimateSkinHead({
    width: SKIN_WIDTH,
    height: SKIN_HEIGHT,
    zoom: SKIN_ZOOM,
});

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
        "skinFallback",
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
            top: `calc(${SKIN_TOP - SKIN_HEADROOM}px + env(safe-area-inset-top))`,
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
        skinFallback: {
            // WebGL が使えないときは、3D の顔があるはずの位置に同じ大きさの顔アイコンを置く
            position: "absolute",
            left: `${SKIN_HEAD.centerX - SKIN_HEAD.size / 2}px`,
            top: `${SKIN_HEAD.centerY - SKIN_HEAD.size / 2}px`,
            width: `${SKIN_HEAD.size}px`,
            height: `${SKIN_HEAD.size}px`,
            overflow: "hidden",
            borderRadius: "control",
            // PlayerAvatar は 48px (md) なので、顔の大きさまで広げる
            "& > *": {
                transform: `scale(${SKIN_HEAD.size / 48})`,
                transformOrigin: "0 0",
            },
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
            top: "0",
            left: "0",
            right: "0",
            // バーの下端でぼかしと色を切ると境目が線に見えるため、下へ 28px 伸ばして
            // マスクで色とぼかしを一緒に溶かす
            bottom: "-28px",
            bg: "color-mix(in srgb, {colors.colorPalette.bg} 80%, transparent)",
            backdropFilter: "blur(10px)",
            maskImage:
                "linear-gradient(to bottom, #000 calc(100% - 28px), transparent)",
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
    pitch: number;
    animation: SkinViewerAnimation;
    /** ポーズの関節の角度 (度)。poseWeight の割合で直立から補間する */
    joints: SkinViewerPose | undefined;
    /** ポーズの強さ (1 でポーズのまま、0 で直立) */
    poseWeight: number;
    rightHandItem: string | undefined;
    leftHandItem: string | undefined;
    className: string;
}

// 直立 (すべての関節が 0 度)
const REST_POSE: SkinViewerPose = {};

// 向きやポーズが変わったときだけ再レンダーされるよう、SkinViewer を小さな部品に閉じ込める
const PortraitSkin = memo(
    ({
        playerId,
        playerName,
        yaw,
        pitch,
        animation,
        joints,
        poseWeight,
        rightHandItem,
        leftHandItem,
        className,
    }: PortraitSkinProps) => {
        // 関節の角度を直立から補間する。poseWeight が同じ間は同じオブジェクトを渡す
        const pose = useMemo(
            () =>
                joints
                    ? interpolateSkinViewerPose(REST_POSE, joints, poseWeight)
                    : undefined,
            [joints, poseWeight],
        );
        return (
            <SkinViewer
                playerId={playerId}
                width={SKIN_WIDTH}
                height={SKIN_HEIGHT}
                zoom={SKIN_ZOOM}
                // yaw は最初から数値で渡す (undefined から切り替えると向きが飛ぶ)
                yaw={yaw}
                pitch={pitch}
                autoRotate={false}
                interactive={false}
                // アニメーションは止めずに強さだけを下げ、腕を途中で跳ねさせずに直立へ戻す
                animation={animation}
                animationWeight={poseWeight}
                pose={pose}
                // アイテムは同じ viewer の腕に押し出したメッシュとして付く。読み込めなければ何も持たない
                rightHandItem={rightHandItem}
                leftHandItem={leftHandItem}
                className={className}
                aria-label={`${playerName} のスキン`}
            />
        );
    },
);

export interface PlayerPortraitProps {
    player: MyPagePlayer;
    /** オンライン状況。取得できなければ null (ピルを出さない) */
    presence: PlayerPresence | null;
    /** スキンのポーズ。省略すると表示のたびにランダムに選ぶ (URL の ?pose= や Storybook で固定する) */
    pose?: PortraitPoseId;
    className?: string;
}

/**
 * マイページ上部の全面ポートレート。
 * スクロールすると 3D スキンが 1 回転しながら縮み、上端のコンパクトバーのアバターへ移る
 */
export const PlayerPortrait = ({
    player,
    presence,
    pose,
    className,
}: PlayerPortraitProps) => {
    const style = playerPortraitStyle();
    // サーバーとクライアントで乱数がずれないよう、最初は正面で描き、描画前にクライアントで選び直す
    const [randomPose, setRandomPose] = useState<PortraitPoseId>("front");
    useIsomorphicLayoutEffect(() => {
        setRandomPose(pickPortraitPose());
    }, []);
    // アイテムのモデル・テクスチャを解決できないと SkinViewer が例外を投げるため、そのときは持たせない
    const minecraftConfig = useMinecraftConfig();
    const canHoldItem = Boolean(
        minecraftConfig.resolveModel && minecraftConfig.resolveTexture,
    );
    const reducedMotion = usePrefersReducedMotion();
    const poseView = resolvePortraitPose(pose ?? randomPose, {
        reducedMotion,
        canHoldItem,
    });
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
        heroBlurRef,
        heroTintRef,
        barRef,
        barBackgroundRef,
        barAvatarRef,
        barNameRef,
        barDotRef,
        skinView,
    } = useCollapsingPortrait({
        skinHead: SKIN_HEAD,
        skinHeight: SKIN_HEIGHT,
        nameRef,
        measureKey: nameFontSize,
        reducedMotion,
        startYaw: poseView.yaw,
        startPitch: poseView.pitch,
        startOffsetX: poseView.offsetX,
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
                {/* 不透明度は層ごとに当てる (包む要素に当てるとぼかしが背景を拾えなくなる) */}
                <div
                    ref={heroBlurRef}
                    className={cx(style.bandBlur, style.heroBand)}
                />
                <div
                    ref={heroTintRef}
                    className={cx(style.bandTint, style.heroBand)}
                />
            </div>

            <div className={style.overlay}>
                <div
                    ref={skinRef}
                    className={style.skin}
                    style={{
                        transformOrigin: `${SKIN_HEAD.centerX}px ${SKIN_HEAD.centerY}px`,
                    }}
                >
                    {/* WebGL を作れない環境では SkinViewer の effect が例外を投げるため、ページ全体を巻き込まないよう囲う */}
                    <CatchBoundary
                        getResetKey={() => player.id}
                        errorComponent={() => (
                            <div className={style.skinFallback}>
                                <PlayerAvatar
                                    playerId={player.id}
                                    playerName={player.name}
                                    size="md"
                                    decorative
                                />
                            </div>
                        )}
                    >
                        <PortraitSkin
                            playerId={player.id}
                            playerName={player.name}
                            yaw={skinView.yaw}
                            pitch={skinView.pitch}
                            // 縮むにつれて腕と頭を直立へ戻し、着地する顔を正面の姿勢にそろえる
                            animation={poseView.animation}
                            joints={poseView.joints}
                            poseWeight={skinView.poseWeight}
                            rightHandItem={poseView.rightHandItem}
                            leftHandItem={poseView.leftHandItem}
                            className={style.skinCanvas}
                        />
                    </CatchBoundary>
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
