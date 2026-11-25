import { Await } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { MaybePromise } from "../../-types/maybe-promise";

export type { MaybePromise };

interface DeferredProps<T> {
    value: MaybePromise<T>;
    /** 届くまで出す場所取り。届いた後と同じ大きさにする */
    fallback: ReactNode;
    children: (value: T) => ReactNode;
}

/**
 * 値が届くまで fallback を出し、届いたら children で描く。
 * Storybook などで値をそのまま渡したときは待たずに描く
 */
export const Deferred = <T,>({ value, fallback, children }: DeferredProps<T>) =>
    value instanceof Promise ? (
        <Await promise={value} fallback={fallback}>
            {children}
        </Await>
    ) : (
        children(value)
    );
