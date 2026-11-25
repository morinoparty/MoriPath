// MineAuth (SERVER_URL 配下) が止まると fetch は応答を待ち続けるため、問い合わせごとに待つ上限を決める

/** 認証サーバー探し (サーバー一覧 + OIDC discovery) 全体の上限。ページの表示を待たせすぎない長さにする */
export const AUTH_DISCOVERY_TIMEOUT_MS = 4_000;

/** アクセストークンの取得 (失効していれば MineAuth での更新を含む) */
export const ACCESS_TOKEN_TIMEOUT_MS = 5_000;

/** Better Auth の初期化と、サインイン・コールバックの処理 */
export const AUTH_HANDLER_TIMEOUT_MS = 8_000;

/** 読み取りの API */
export const MINEAUTH_API_TIMEOUT_MS = 8_000;

/** 送金・購入などの書き込み。途中で切ると結果が分からなくなるため長めにとる */
export const MINEAUTH_MUTATION_TIMEOUT_MS = 20_000;

/** task が ms 以内に終わらなければ onTimeout の例外で失敗させる。task 自体は止めない */
export function withTimeout<T>(
    task: Promise<T>,
    ms: number,
    onTimeout: () => Error,
): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(onTimeout()), ms);
    });
    // 先に決まったほうを返し、タイマーは必ず片付ける
    return Promise.race([task, timeout]).finally(() => clearTimeout(timer));
}
