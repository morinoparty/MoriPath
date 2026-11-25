/** 送り先のプレイヤー。id は Vault の送金 API にそのまま渡す UUID (ハイフン付き) */
export interface Recipient {
    id: string;
    name: string;
}

/** 送り先の欄の状態。入力中の Minecraft ID を mc-api で引いた結果を表す */
export type RecipientState =
    | { status: "empty" }
    | { status: "checking" }
    | { status: "found"; recipient: Recipient }
    | { status: "error"; message: string };

/** 送り先を引いた結果。見つからない・自分自身は例外にせず理由で返す */
export type ResolveRecipientResult =
    | { ok: true; recipient: Recipient }
    | { ok: false; reason: "not-found" | "self" | "error" };

/** 金額のキーパッドで押せるキー */
export type AmountKey =
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "00"
    | "backspace";

/** 送金が終わったときの結果 */
export interface SendResult {
    amount: number;
    /** 送金後の自分の残高 (API の返した値) */
    balance: number;
    recipient: Recipient;
}

/**
 * 送金に失敗したときの内容。
 * rejected は API がはっきり断ったもの、unknown は届いたかどうか分からないもの
 * (通信エラーや 5xx)。unknown のときは「もう一度」を促さず、残高の確認を促す
 */
export interface SendFailure {
    kind: "rejected" | "unknown";
    message: string;
}

/** 送金のサーバー関数の戻り値。失敗も例外にせず種類つきで返す */
export type SendDonguriResult =
    | { ok: true; amount: number; balance: number }
    | ({ ok: false } & SendFailure);

/** 画面の段階。input = 入力中 / confirm = 確認ダイアログ / done = 送金済み */
export type WalletSendStep = "input" | "confirm" | "done";
