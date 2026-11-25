/** en_us.json の中身 (翻訳キー → 英語名) */
export type ItemLang = Record<string, string>;

// COBBLESTONE → "Cobblestone"、OAK_LOG → "Oak Log" のように読める形にする
export const humanizeItemType = (typeName: string): string =>
    typeName
        .toLowerCase()
        .split("_")
        .filter((word) => word.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

/**
 * お店のアイテムの表示名を決める。
 * 付けられた名前 → en_us.json の正式名 (アイテム → ブロックの順) → 種類名を整形したもの、の順に使う
 */
export const toItemName = (
    typeName: string,
    displayName: string | null | undefined,
    lang: ItemLang | null,
): string => {
    // 名前の前後に空白が入っていることがあるため、詰めてから空かどうかを見る
    const custom = displayName?.trim();
    if (custom) {
        return custom;
    }
    const id = typeName.toLowerCase();
    return (
        lang?.[`item.minecraft.${id}`] ??
        lang?.[`block.minecraft.${id}`] ??
        humanizeItemType(typeName)
    );
};
