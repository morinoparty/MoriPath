import { createFileRoute } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { ServiceUnavailable } from "../../../components/service-unavailable";
import { toSafeRedirectPath } from "../../../lib/unavailable-redirect";

const searchSchema = z.object({
    /** つながったら戻るページ。同じオリジンのパスだけを受け付ける */
    redirect: z
        .string()
        .optional()
        .transform((value) => toSafeRedirectPath(value))
        .catch(undefined),
});

// 一時的に使えないことを検索エンジンやクライアントに伝えるため、ページは 503 で返す
const serviceUnavailableStatus = createMiddleware().server(async ({ next }) => {
    const result = await next();
    const { response } = result;
    // 検索パラメータの正規化などのリダイレクトはそのまま返す
    if (response.status !== 200) {
        return result;
    }
    return {
        ...result,
        response: new Response(response.body, {
            status: 503,
            headers: response.headers,
        }),
    };
});

export const Route = createFileRoute("/_nofooter/unavailable/")({
    validateSearch: searchSchema,
    server: {
        middleware: [serviceUnavailableStatus],
    },
    head: () => ({
        meta: [{ name: "robots", content: "noindex" }],
    }),
    component: UnavailablePage,
});

function UnavailablePage() {
    const { redirect } = Route.useSearch();
    // セッションの覚えなどを持ち越さないよう、ページを読み込み直して元の画面へ戻る
    return (
        <ServiceUnavailable
            onRetry={() => window.location.assign(redirect ?? "/")}
        />
    );
}
