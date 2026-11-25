import { css } from "../../../../../../styled-system/css";
import type { MyPageData } from "../../-types/my-page";
import { MoneyMenu, type MoneyMenuItem } from "../money-menu";
import { MyPageStats } from "../my-page-stats";
import { PlayerPortrait, PORTRAIT_COLLAPSE_DISTANCE } from "../player-portrait";

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
    /** おかねメニューの項目 (省略時は既定の項目) */
    moneyMenuItems?: readonly MoneyMenuItem[];
}

/** マイページの見た目。データは props で受け取り、取得はルートの loader が行う */
export const MyPageView = ({
    player,
    presence,
    stats,
    moneyMenuItems,
}: MyPageViewProps) => (
    <div className={rootStyle}>
        <PlayerPortrait player={player} presence={presence} />
        <div className={bodyStyle}>
            <MyPageStats stats={stats} />
            <MoneyMenu items={moneyMenuItems} />
        </div>
    </div>
);
