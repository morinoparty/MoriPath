import type { AmountKey } from "../-types/wallet-send";

// 残高が分からないときでも桁あふれしないよう、入力できる上限を決めておく
const MAX_AMOUNT = 999_999_999;

/** 送れる上限。残高が取れていればその整数部分 (切り捨て)、取れていなければ入力上限 */
export const maxSendableAmount = (balance: number | null): number =>
    balance === null ? MAX_AMOUNT : Math.max(0, Math.floor(balance));

/**
 * キーを 1 つ押したあとの金額を求める。
 * 0 は「未入力」として扱い、先頭の 0 は積まない。上限を超えたら上限に揃える
 */
export const applyAmountKey = (
    current: number,
    key: AmountKey,
    max: number,
): number => {
    if (key === "backspace") {
        // 末尾の 1 桁を消す
        return Math.floor(current / 10);
    }
    // 未入力のときは押した数字だけ、入力済みなら末尾に数字を足す
    const next = Number(`${current === 0 ? "" : current}${key}`);
    return Math.min(next, max);
};

/** 物理キーボードのキー名をキーパッドのキーに対応づける。対象外は null */
export const toAmountKey = (key: string): AmountKey | null => {
    if (/^[0-9]$/.test(key)) {
        return key as AmountKey;
    }
    if (key === "Backspace" || key === "Delete") {
        return "backspace";
    }
    return null;
};

/** 送れる金額か。1 以上の整数で、上限以下 */
export const isSendableAmount = (amount: number, max: number): boolean =>
    Number.isInteger(amount) && amount > 0 && amount <= max;
