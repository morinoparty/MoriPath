// サーバーとブラウザの両方から読むため、cloudflare:workers などサーバー専用のモジュールを読み込まない

const ERROR_NAME = "AuthServerUnavailableError";
const ERROR_MESSAGE = "利用可能な認証サーバーが見つかりません";

/** MineAuth (ゲームサーバーのログイン) に一度もつながらず、セッションを確かめられないときの例外 */
export class AuthServerUnavailableError extends Error {
    constructor(options?: ErrorOptions) {
        super(ERROR_MESSAGE, options);
        this.name = ERROR_NAME;
    }
}

/**
 * MineAuth に届かないことによる例外か。
 * サーバー関数や SSR の受け渡しでクラスは失われるため、名前とメッセージでも見分ける
 */
export const isAuthServerUnavailable = (error: unknown): boolean =>
    error instanceof AuthServerUnavailableError ||
    (error instanceof Error &&
        (error.name === ERROR_NAME || error.message === ERROR_MESSAGE));
