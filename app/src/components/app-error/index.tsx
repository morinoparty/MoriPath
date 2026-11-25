import {
    ErrorComponent,
    type ErrorComponentProps,
} from "@tanstack/react-router";
import { isAuthServerUnavailable } from "../../lib/auth-server-unavailable";
import { ServiceUnavailable } from "../service-unavailable";

/**
 * 既定のエラー境界。
 * 案内ページへ送れなかった MineAuth の停止は、汎用のエラーではなく停止の案内として出す
 */
export function AppError(props: ErrorComponentProps) {
    if (isAuthServerUnavailable(props.error)) {
        // 状態を持ち越さないよう、今のページを読み込み直す
        return <ServiceUnavailable onRetry={() => window.location.reload()} />;
    }
    return <ErrorComponent {...props} />;
}
