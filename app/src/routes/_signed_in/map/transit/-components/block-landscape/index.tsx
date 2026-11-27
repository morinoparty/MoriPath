import { css, cx } from "../../../../../../../styled-system/css";

// Figma (C4 ブロックの風景) の 402x470 の絵をそのまま座標に使う
const VIEW_WIDTH = 402;
const VIEW_HEIGHT = 470;

/** 四角 1 つ。[x, y, 幅, 高さ, 色, 不透明度 (省略で 1)] */
type Block = readonly [number, number, number, number, string, number?];

// 飾りの絵なので、色はトークンにせず Figma の色をそのまま使う (ダークモードは全体を暗くして合わせる)

// 空に浮かぶ四角い雲
const clouds: Block[] = [
    [162, 96, 36, 12, "#FFFFFF", 0.75],
    [150, 108, 72, 12, "#FFFFFF", 0.75],
    [302, 128, 36, 12, "#FFFFFF", 0.75],
    [290, 140, 72, 12, "#FFFFFF", 0.75],
    [40, 150, 28, 10, "#FFFFFF", 0.6],
    [32, 160, 52, 10, "#FFFFFF", 0.6],
];

// 遠くの山。32px ずつ段になった淡い面
const farHills: Block[] = [
    [0, 196, 32, 64, "#CFDDD5"],
    [32, 184, 32, 76, "#CFDDD5"],
    [64, 176, 32, 84, "#CFDDD5"],
    [96, 188, 32, 72, "#CFDDD5"],
    [128, 200, 32, 60, "#CFDDD5"],
    [160, 192, 32, 68, "#CFDDD5"],
    [192, 180, 32, 80, "#CFDDD5"],
    [224, 172, 32, 88, "#CFDDD5"],
    [256, 184, 32, 76, "#CFDDD5"],
    [288, 196, 32, 64, "#CFDDD5"],
    [320, 188, 32, 72, "#CFDDD5"],
    [352, 178, 32, 82, "#CFDDD5"],
    [384, 186, 32, 74, "#CFDDD5"],
];

// 手前の丘。[x, 上端, 幅] ごとに、面と上の草の縁 (5px) を重ねる。真ん中は電車が見えるよう空けてある
const nearHillSteps: readonly (readonly [number, number, number])[] = [
    [0, 216, 16],
    [16, 208, 32],
    [48, 200, 32],
    [80, 212, 32],
    [112, 224, 24],
    [240, 220, 32],
    [272, 208, 32],
    [304, 200, 32],
    [336, 208, 32],
    [368, 216, 34],
];
const HILL_BOTTOM = 250;
const nearHills: Block[] = nearHillSteps.flatMap(([x, top, width]): Block[] => [
    [x, top, width, HILL_BOTTOM - top, "#BBCFC2"],
    [x, top, width, 5, "#A9C3AF"],
]);

// ボクセルの木 (幹・葉の 3 段)。大きさの違う 4 本を丘の上に置く
const trees: Block[] = [
    [35, 234, 6, 14, "#A8988A"],
    [30, 210, 16, 16, "#93B39A"],
    [22, 218, 32, 16, "#A2BFA8"],
    [34, 198.8, 8, 11.2, "#8AAB91"],
    [67.4, 236.8, 6, 11.2, "#A8988A"],
    [64, 217.6, 12.8, 12.8, "#93B39A"],
    [57.6, 224, 25.6, 12.8, "#A2BFA8"],
    [67.2, 208.64, 6.4, 8.96, "#8AAB91"],
    [335.8, 232.6, 6, 15.4, "#A8988A"],
    [330, 206.2, 17.6, 17.6, "#93B39A"],
    [321.2, 215, 35.2, 17.6, "#A2BFA8"],
    [334.4, 193.88, 8.8, 12.32, "#8AAB91"],
    [375, 237.5, 6, 10.5, "#A8988A"],
    [372, 219.5, 12, 12, "#93B39A"],
    [366, 225.5, 24, 12, "#A2BFA8"],
    [375, 211.1, 6, 8.4, "#8AAB91"],
];

// 0 から count - 1 までの番号を作る (同じ形が並ぶ帯に使う)
const repeat = (count: number) => Array.from({ length: count }, (_, i) => i);

// 地面。草ブロックの帯 (2 色を交互) と、土の面の目地
const ground: Block[] = [
    [0, 248, VIEW_WIDTH, VIEW_HEIGHT - 248, "#D5DCD6"],
    ...repeat(26).map((i): Block => [
        i * 16,
        248,
        16,
        7,
        i % 2 === 0 ? "#9EBBA3" : "#A6C1AA",
    ]),
    // 縦の目地は 1 段ずつずらし、レンガ積みのように見せる
    ...repeat(26).map((i): Block =>
        i % 2 === 0
            ? [i * 16, 255, 1, 16, "#C8D0CA"]
            : [i * 16, 271, 1, 16, "#CBD2CC"],
    ),
    [0, 271, VIEW_WIDTH, 1, "#CBD2CC"],
    [0, 287, VIEW_WIDTH, 1, "#CED5CF"],
];

// 線路。枕木を 12px おきに並べ、その上にレールを 1 本通す
const rails: Block[] = [
    ...repeat(34).map((i): Block => [4 + i * 12, 244, 7, 4, "#B9B0A6"]),
    [0, 241, VIEW_WIDTH, 2, "#8F9A95"],
];

// 客車 1 両 (窓 3 つ・車輪・連結器)。x をずらして 2 両並べる
const coachAt = (x: number): Block[] => [
    [x, 217, 46, 20, "#EEF2EF"],
    [x, 215, 46, 3, "#C9D6CE"],
    [x + 5, 221, 9, 7, "#A9BFB5"],
    [x + 18, 221, 9, 7, "#A9BFB5"],
    [x + 31, 221, 9, 7, "#A9BFB5"],
    [x + 5, 236, 6, 5, "#6F7D77"],
    [x + 35, 236, 6, 5, "#6F7D77"],
    [x + 46, 227, 4, 4, "#9AA59F"],
];

// 小さなブロックの電車 (客車 2 両 + 先頭の機関車と煙)
const train: Block[] = [
    ...coachAt(176),
    ...coachAt(226),
    [276, 217, 40, 20, "#7FA594"],
    [276, 215, 40, 3, "#6E9483"],
    [304, 221, 10, 8, "#DDE7E1"],
    [280, 221, 18, 7, "#A9C7B8"],
    [312, 233, 6, 3, "#E9E2B8"],
    [281, 236, 6, 5, "#5F6D67"],
    [304, 236, 6, 5, "#5F6D67"],
    [284, 209, 6, 6, "#7FA594"],
    [288, 197, 6, 6, "#FFFFFF", 0.7],
    [296, 187, 8, 8, "#FFFFFF", 0.55],
];

// 奥から順に描く (あとの四角が手前に重なる)
const blocks: Block[] = [
    ...clouds,
    ...farHills,
    ...nearHills,
    ...trees,
    ...ground,
    ...rails,
    ...train,
];

const blockLandscapeStyle = css({
    display: "block",
    width: "full",
    height: "full",
    // ドット絵の縁をにじませない
    shapeRendering: "crispEdges",
    // ダークモードでは明るい絵が浮いて眩しいので、暗く・淡くして夜の地の色になじませる
    _dark: {
        opacity: 0.55,
        filter: "brightness(0.5) saturate(0.8)",
    },
});

export interface BlockLandscapeProps {
    className?: string;
}

/**
 * 駅を選んでいないときの見出しに敷く、ブロックの風景 (雲・山・木・線路・小さな電車) の絵。
 * 枠の幅いっぱいに広げ、下端 (地面) を枠の下端にそろえる。はみ出た上 (空) は切り取る
 */
export const BlockLandscape = ({ className }: BlockLandscapeProps) => (
    <svg
        className={cx(blockLandscapeStyle, className)}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        // 枠を覆うように拡大し、地面のある下端を基準にそろえる
        preserveAspectRatio="xMidYMax slice"
        // 飾りの絵なので読み上げない
        aria-hidden
        focusable="false"
    >
        {blocks.map(([x, y, width, height, fill, opacity]) => (
            <rect
                // 同じ場所・大きさの四角は 2 つ無いので、座標と大きさを key にする
                key={`${x},${y},${width},${height}`}
                x={x}
                y={y}
                width={width}
                height={height}
                fill={fill}
                fillOpacity={opacity}
            />
        ))}
    </svg>
);
