export const transformReadableStreamWithRouter = () => {
    throw new Error(
        "transformReadableStreamWithRouter is not available in Storybook",
    );
};
export const transformPipeableStreamWithRouter = () => {
    throw new Error(
        "transformPipeableStreamWithRouter is not available in Storybook",
    );
};
export const transformStreamWithRouter = () => {
    throw new Error("transformStreamWithRouter is not available in Storybook");
};

// module 初期化時に参照されても落ちないよう最小限の実装にする
export const getOrigin = (request: { url?: string } | undefined) => {
    try {
        return request?.url ? new URL(request.url).origin : "";
    } catch {
        return "";
    }
};

export const attachRouterServerSsrUtils = () => {};

export const defineHandlerCallback = <T>(cb: T): T => cb;

export const createRequestHandler = () => {
    throw new Error("createRequestHandler is not available in Storybook");
};

// TanStack Start 1.168 系の start-server-core が追加で import する SSR 用 API。
// Storybook では SSR を実行しないので、呼ばれたら throw する（module 初期化時に参照されるものは値を返す）
const notAvailable = (name: string) => () => {
    throw new Error(`${name} is not available in Storybook`);
};
export const defaultSerovalDeserializerPlugins: unknown[] = [];
export const createRawStreamRPCPlugin = notAvailable(
    "createRawStreamRPCPlugin",
);
export const bindSsrResponseToRequest = notAvailable(
    "bindSsrResponseToRequest",
);
export const createSsrStreamResponse = notAvailable("createSsrStreamResponse");
export const disposeSsrResponse = notAvailable("disposeSsrResponse");
export const getNormalizedURL = notAvailable("getNormalizedURL");
export const getSsrStatus = notAvailable("getSsrStatus");
export const isSsrResponse = (_value: unknown): boolean => false;
export const normalizeSsrResponse = notAvailable("normalizeSsrResponse");
export const renderSsrHtmlResponse = notAvailable("renderSsrHtmlResponse");
export const replaceSsrResponse = notAvailable("replaceSsrResponse");
export const stripSsrResponseBody = notAvailable("stripSsrResponseBody");
export const waitForRequest = notAvailable("waitForRequest");

export default {};
