import { css } from "../../../../../../styled-system/css";
import { Deferred } from "../../../-components/deferred";
import type { MyPageData } from "../../-types/my-page";
import type { MyPageMenuSection } from "../../-types/my-page-menu";
import type { PortraitPoseId } from "../../-types/portrait-pose";
import { MyPageMenu } from "../my-page-menu";
import { MyPageStats, MyPageStatsSkeleton } from "../my-page-stats";
import { PlayerPortrait, PORTRAIT_COLLAPSE_DISTANCE } from "../player-portrait";
import { StampBook, StampBookSkeleton } from "../stamp-book";

const rootStyle = css({
    // 本文が短くても、ポートレートが縮みきるまでスクロールできる高さを確保する
    minHeight: `calc(100dvh + ${PORTRAIT_COLLAPSE_DISTANCE}px)`,
});

const bodyStyle = css({
    display: "flex",
    flexDirection: "column",
    gap: "5",
    paddingX: "6",
    paddingTop: "3",
});

export interface MyPageViewProps extends Omit<MyPageData, "statsHidden"> {
    /** 数値カードの値を隠すか (省略時は表示) */
    statsHidden?: boolean;
    /** 数値カードをタップしたときに呼ぶ。省略するとタップで切り替えない */
    onStatsHiddenChange?: (hidden: boolean) => void;
    /** メニューのセクション (省略時は既定のメニュー) */
    menuSections?: readonly MyPageMenuSection[];
    /** ポートレートのポーズ (URL の ?pose=)。省略すると表示のたびにランダムに選ぶ */
    portraitPose?: PortraitPoseId;
}

/**
 * マイページの見た目。データは props で受け取り、取得はルートの loader が行う。
 * 数値とスタンプ帳は届くまでスケルトンを出す
 */
export const MyPageView = ({
    player,
    presence,
    stats,
    stamps,
    statsHidden,
    onStatsHiddenChange,
    menuSections,
    portraitPose,
}: MyPageViewProps) => (
    <div className={rootStyle}>
        <PlayerPortrait
            player={player}
            presence={presence}
            pose={portraitPose}
        />
        <div className={bodyStyle}>
            <Deferred value={stats} fallback={<MyPageStatsSkeleton />}>
                {(resolved) => (
                    <MyPageStats
                        stats={resolved}
                        hidden={statsHidden}
                        onHiddenChange={onStatsHiddenChange}
                    />
                )}
            </Deferred>
            <Deferred value={stamps} fallback={<StampBookSkeleton />}>
                {(resolved) => resolved && <StampBook stamps={resolved} />}
            </Deferred>
            <MyPageMenu sections={menuSections} />
        </div>
    </div>
);
