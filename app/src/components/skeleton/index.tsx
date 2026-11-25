import {
    Skeleton as ChlorophyllSkeleton,
    type SkeletonProps,
} from "@morinoparty/chlorophyll-react/components";
import { css, cx } from "../../../styled-system/css";

// Chlorophyll の Skeleton に、アプリの面の色と動きを減らす設定への対応を足す
const skeletonStyle = css({
    // 中立の灰色ではなく、パレットの面の色で沈めてブランドの地になじませる
    bg: "colorPalette.surface.hover",
    // 動きを減らす設定では明滅させず、止まった場所取りにする
    _motionReduce: { animation: "none" },
});

// 文中に置く 1 行分の場所取り。文字の高さにそろえ、行の高さは周りの文字に任せる
const inlineStyle = css({
    display: "inline-block",
    height: "1em",
    maxWidth: "full",
    verticalAlign: "middle",
    borderRadius: "full",
});

/** 読み込み中の場所取り。形は variant (text / rect / circle)、大きさは className で決める */
export const Skeleton = ({ className, ...props }: SkeletonProps) => (
    <ChlorophyllSkeleton {...props} className={cx(skeletonStyle, className)} />
);

export interface InlineSkeletonProps {
    /** 帯の幅。届く文字の長さに合わせる (例: "6em") */
    width: string;
    className?: string;
}

/** 文の中に置く 1 行分の帯 (span なので、ボタンや段落の中にも置ける) */
export const InlineSkeleton = ({ width, className }: InlineSkeletonProps) => (
    <Skeleton asChild className={cx(inlineStyle, className)}>
        <span style={{ width }} />
    </Skeleton>
);

/** スケルトンの行を count 行並べるときの key。中身の無い場所取りで、並び替えも追加もしない */
export const skeletonKeys = (count: number): string[] =>
    Array.from({ length: count }, (_, index) => `skeleton-${index}`);
