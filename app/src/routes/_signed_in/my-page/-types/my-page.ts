import type { MaybePromise } from "../../-types/maybe-promise";
import type { MyStamps } from "./stamp";

/** マイページに表示するプレイヤー。id はスキンとアバターの取得に使う */
export interface MyPagePlayer {
    /** Minecraft の UUID (取得できなければ MCID) */
    id: string;
    /** 表示名 (MCID) */
    name: string;
}

/** プレイヤーがいまどのサーバーにいるか */
export interface PlayerPresence {
    online: boolean;
    /** 表示用のサーバー名。オフラインまたは不明なら null */
    serverName: string | null;
}

/** マイページの数値。取得できなかった値は null にして画面から外す */
export interface MyPageStats {
    /** どんぐり (Vault 残高) */
    balance: number | null;
    /** 使える保護ブロック数 */
    claimBlocks: number | null;
    /** 連続投票日数 */
    voteStreak: number | null;
}

/**
 * マイページの表示に必要なデータ一式 (ルートの loader が組み立てる)。
 * 数値とスタンプ帳は届くまで Promise のまま渡し、スケルトンから置き換える
 */
export interface MyPageData {
    player: MyPagePlayer;
    presence: PlayerPresence | null;
    stats: MaybePromise<MyPageStats>;
    /** スタンプ帳。取得できなければ null にしてセクションごと隠す */
    stamps: MaybePromise<MyStamps | null>;
}
