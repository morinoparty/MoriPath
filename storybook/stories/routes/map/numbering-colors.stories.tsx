import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { StationMarker } from "@/routes/_signed_in/map/-components/station-marker";
import { buildMapStations } from "@/routes/_signed_in/map/-functions/build-map-stations";
import { buildNumberingColors } from "@/routes/_signed_in/map/-functions/numbering-colors";
import type {
    RailwayCircle,
    RailwayLine,
} from "@/routes/_signed_in/map/-types/compact-markers";
import { css } from "../../../styled-system/css";

// 実データ (2026-11 の squaremap) を縮めたサンプル。路線は直線、駅は路線上か交点に置く
const route = (lineName: string): RailwayLine["route"] => ({
    lineName,
    fromStation: "",
    toStation: "",
    travelTime: "",
    direction: "both",
});

const lines: RailwayLine[] = [
    {
        points: [
            [0, 0],
            [200, 0],
        ],
        color: "#ff00af",
        route: route("ぱかぱか高速ライン(緑草線)"),
    },
    {
        points: [
            [100, -100],
            [100, 100],
        ],
        color: "#16fcc0",
        route: route("うみもと線"),
    },
    {
        points: [
            [0, 300],
            [200, 300],
        ],
        color: "#fa8200",
        route: route("聖花線"),
    },
    {
        points: [
            [0, 300],
            [0, 500],
        ],
        color: "#00eaff",
        route: route("ぷくぷく低速ライン(緑藻線)"),
    },
];

const circle = (
    x: number,
    z: number,
    name: string,
    numberings: string[],
): RailwayCircle => ({ center: { x, z }, radius: 10, name, numberings });

const circles: RailwayCircle[] = [
    circle(0, 0, "あわもり", ["PAK07"]),
    // 空白の入った表記も同じ記号として数える
    circle(200, 0, "ぱかぱか", ["PAK 08"]),
    // 乗換駅は両方の路線に 1 票ずつ入るが、ほかの駅の票で決まる
    circle(100, 0, "うみもと北", ["MU10", "PAK04"]),
    circle(100, 100, "うみもと南", ["MU11"]),
    circle(200, 300, "聖花", ["SF02"]),
    // PUK は乗換駅にしか無いので、聖花線と緑藻線が同数になり決めない (ブランド色)
    circle(0, 300, "星樹の街", ["PUK01", "SF01"]),
];

const numberingColors = buildNumberingColors(circles, lines);
const stations = buildMapStations(circles, null, numberingColors);

/** サンプルの駅を、推定した路線の色の札で並べる */
const InferredColors = () => (
    <div
        className={css({ display: "flex", flexDirection: "column", gap: "4" })}
    >
        <div className={css({ display: "flex", flexWrap: "wrap", gap: "2" })}>
            {stations.map((station) => (
                <div
                    key={station.name}
                    className={css({
                        position: "relative",
                        width: "120px",
                        height: "72px",
                    })}
                >
                    <div
                        className={css({
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                        })}
                    >
                        <StationMarker
                            name={station.name}
                            numberings={station.numberings}
                            detail="full"
                        />
                    </div>
                </div>
            ))}
        </div>
        <pre data-testid="numbering-colors" className={css({ fontSize: "xs" })}>
            {JSON.stringify(numberingColors, null, 2)}
        </pre>
    </div>
);

const meta: Meta<typeof InferredColors> = {
    title: "Map/NumberingColors",
    component: InferredColors,
    decorators: [
        (Story) => (
            <div className={css({ p: "6", bg: "colorPalette.bg.subtle" })}>
                <Story />
            </div>
        ),
    ],
};

export default meta;

type Story = StoryObj<typeof InferredColors>;

// API を使えないとき、squaremap の駅と路線から記号ごとの路線の色を多数決で推定する
export const FromSquaremap: Story = {
    play: async () => {
        await expect(numberingColors).toEqual({
            PAK: "#ff00af",
            MU: "#16fcc0",
            SF: "#fa8200",
        });
        // API の色があればそちらを優先する
        const [fromApi] = buildMapStations(
            [circle(0, 0, "あわもり", ["PAK07"])],
            [
                {
                    id: "awamori",
                    name: "あわもり",
                    world: "world",
                    point: { x: 0, z: 0 },
                    overrideSize: null,
                    numberings: [
                        { lineName: "緑草線", code: "PAK07", color: "#123456" },
                        { lineName: "", code: "MU01", color: null },
                    ],
                },
            ],
            numberingColors,
        );
        await expect(fromApi.numberings.map((n) => n.color)).toEqual([
            "#123456",
            "#16fcc0",
        ]);
    },
};
