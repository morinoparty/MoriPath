/**
 * 古いブラウザや Clipboard API を使えないとき (http の開発環境や権限の拒否) の写し方。
 * 画面外に置いた textarea を選択して execCommand("copy") する
 */
const copyWithTextarea = (text: string): boolean => {
    // 写した後にフォーカスを元の要素 (押したタイル) へ戻す
    const previousFocus =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // iOS でキーボードを開かせず、画面も動かさない
    textarea.readOnly = true;
    textarea.setAttribute("aria-hidden", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    try {
        textarea.select();
        // execCommand は非推奨だが、Clipboard API が無いときの唯一の手段
        return document.execCommand("copy");
    } catch {
        return false;
    } finally {
        textarea.remove();
        previousFocus?.focus({ preventScroll: true });
    }
};

/** 文字列をクリップボードに写す。写せたら true */
export const copyText = async (text: string): Promise<boolean> => {
    // 安全でないオリジンでは navigator.clipboard そのものが無い
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // 権限が拒否されたときは古い方法で試し直す
        }
    }
    return copyWithTextarea(text);
};
