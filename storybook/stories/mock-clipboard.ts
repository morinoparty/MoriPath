/**
 * Storybook の play で使うクリップボードの差し替え。
 * navigator.clipboard.writeText と document.execCommand を置き換え、元に戻す関数を返す
 */
export const mockClipboard = ({
    writeText,
    execCommand = () => false,
}: {
    writeText: (text: string) => Promise<void>;
    execCommand?: (command: string) => boolean;
}): (() => void) => {
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const originalExecCommand = document.execCommand;
    // navigator.clipboard は getter なので、インスタンスに上書きの値を定義する
    Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText },
    });
    document.execCommand = execCommand;
    return () => {
        if (original) {
            Object.defineProperty(navigator, "clipboard", original);
        } else {
            // インスタンスの値を消すと、プロトタイプの getter に戻る
            Reflect.deleteProperty(navigator, "clipboard");
        }
        document.execCommand = originalExecCommand;
    };
};
