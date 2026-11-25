import { css } from "../../../../../../styled-system/css";
import type { MyPageData } from "../../-types/my-page";
import type { MyPageMenuSection } from "../../-types/my-page-menu";
import type { PortraitPoseId } from "../../-types/portrait-pose";
import { MyPageMenu } from "../my-page-menu";
import { MyPageStats } from "../my-page-stats";
import { PlayerPortrait, PORTRAIT_COLLAPSE_DISTANCE } from "../player-portrait";
import { StampBook } from "../stamp-book";

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

export interface MyPageViewProps extends MyPageData {
    /** メニューのセクション (省略時は既定のメニュー) */
    menuSections?: readonly MyPageMenuSection[];
    /** ポートレートのポーズ (URL の ?pose=)。省略すると表示のたびにランダムに選ぶ */
    portraitPose?: PortraitPoseId;
}

/** マイページの見た目。データは props で受け取り、取得はルートの loader が行う */
export const MyPageView = ({
    player,
    presence,
    stats,
    stamps,
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
            <MyPageStats stats={stats} />
            {stamps && <StampBook stamps={stamps} />}
            <MyPageMenu sections={menuSections} />
        </div>
    </div>
);
