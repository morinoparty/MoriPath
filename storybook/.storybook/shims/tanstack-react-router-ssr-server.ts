export const renderRouterToStream = async () => {
    throw new Error("renderRouterToStream is not available in Storybook");
};

export const renderRouterToString = async () => {
    throw new Error("renderRouterToString is not available in Storybook");
};

// module 初期化時に呼ばれるため throw しない
export const defineHandlerCallback = <T>(cb: T): T => cb;

export default {};
