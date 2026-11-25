/** loader が待たずに渡す値。届いていればそのまま、まだなら Promise */
export type MaybePromise<T> = T | Promise<T>;
