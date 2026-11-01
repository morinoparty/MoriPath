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

export default {};
