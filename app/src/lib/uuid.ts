// Minecraft の UUID (ハイフンあり・なしの両方を受け付ける)
const UUID_PATTERN =
    /^([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})$/i;

/**
 * UUID をハイフン付きの小文字にそろえる。UUID の形でなければ null。
 * サーバー専用の player-helpers を読み込まずにブラウザからも使えるよう、単独のモジュールにしている
 */
export const toDashedUuid = (value: string): string | null => {
    const matched = UUID_PATTERN.exec(value.trim());
    return matched ? matched.slice(1).join("-").toLowerCase() : null;
};
