import { firstPhrase, lastPhrase } from "@/src/data/phases";
import { generateHash } from "./hash";

// 5分ごとにランダムな値を生成する
const separateMinutes = 5;

// // 乱数生成器の分布をテストするための関数
// export const testRandomDistribution = (target: "first" | "last", hash: string, testCount: number) => {
//     const counts: { [key: string]: number } = {};

//     for (let i = 0; i < testCount; i++) {
//         const random = new Random(generateHash(crypto.randomUUID()));
//         const phrase = target === "first"
//             ? firstPhrase[random.nextInt(0, firstPhrase.length - 1)]
//             : lastPhrase[random.nextInt(0, lastPhrase.length - 1)];

//         counts[phrase] = (counts[phrase] || 0) + 1; // フレーズの出現回数をカウント
//     }

//     const length = Object.keys(counts).length;
//     const average = testCount / length;
//     const targetLength = target === "first" ? firstPhrase.length : lastPhrase.length;
//     return {
//         length,
//         average,
//         targetLength,
//     }; // 各フレーズの出現回数を返す
// };

export const randomPhrase = (target: "first" | "last", hash: string) => {
    const random = new Random(generateHash(hash + getSeparateTime(separateMinutes)));
    if (target === "first") {
        return firstPhrase[random.nextInt(0, firstPhrase.length - 1)];
    }
    return lastPhrase[random.nextInt(0, lastPhrase.length - 1)];
};

function getSeparateTime(separateMinutes: number): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();
    const minute = Math.floor(now.getMinutes() / separateMinutes);
    return `${year}-${month}-${day}-${hour}-${minute}`;
}

class Random {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(seed = 88675123) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;
    }

    // XorShift
    next() {
        const t = this.x ^ (this.x << 11);
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8));
        return this.w;
    }

    // min以上max以下の乱数を生成する
    nextInt(min = 0, max = 1) {
        const r = Math.abs(this.next());
        return min + (r % (max + 1 - min));
    }
}
