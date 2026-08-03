/**
 * Storybook build shim for `@tanstack/react-router/ssr/server`.
 *
 * This module pulls in Node stream implementations. Storybook bundles for the
 * browser, so we provide no-op/throwing implementations instead.
 */
export const renderRouterToStream = async () => {
    throw new Error("renderRouterToStream is not available in Storybook");
};

export const renderRouterToString = async () => {
    throw new Error("renderRouterToString is not available in Storybook");
};

// `@tanstack/react-start-server` が module 初期化時に呼ぶため、throw しない
// (Storybook では SSR handler 自体を実行しない想定)
export const defineHandlerCallback = <T>(cb: T): T => cb;

export default {};
