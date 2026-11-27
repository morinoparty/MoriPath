import type { ReactNode } from "react";
import { sva } from "../../../../../../../styled-system/css";
import type { TransitHero } from "../../-types/transit-hero";
import { TransitBackButton } from "../transit-back-button";
import { TransitHeroBackground, TransitHeroHeadline } from "../transit-hero";

// 駅を選べないページなので、写真や地図ではなくブロックの風景を敷く
const noticeHero: TransitHero = { kind: "landscape", station: null };

const transitNoticePageStyle = sva({
    slots: ["root", "content"],
    base: {
        // タブバーを出さない下層ページなので、画面の高さいっぱいに地の色を敷く
        root: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
            paddingX: "6",
            paddingTop: "calc(env(safe-area-inset-top) + {spacing.4})",
            paddingBottom:
                "max({spacing.6}, calc(env(safe-area-inset-bottom) + {spacing.2}))",
            bg: "colorPalette.bg",
            overflowX: "clip",
        },
        // 中身は背景の層より上に重ねる
        content: {
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "3.5",
        },
    },
});

export interface TransitNoticePageProps {
    /** 見出しの下に出す案内 (TransitNotice) */
    children: ReactNode;
}

/** 乗換案内を使えないとき (駅を読み込めない・API を使えない) の画面。風景・戻るピル・案内だけを出す */
export const TransitNoticePage = ({ children }: TransitNoticePageProps) => {
    const style = transitNoticePageStyle();
    return (
        <div className={style.root}>
            <TransitHeroBackground hero={noticeHero} compact={false} />
            <TransitBackButton />
            <div className={style.content}>
                {/* 駅を選べないので、あいさつは出さずに場所だけ空け、案内を風景の下の方に重ねる */}
                <TransitHeroHeadline
                    hero={noticeHero}
                    compact={false}
                    greeting={false}
                />
                {children}
            </div>
        </div>
    );
};
