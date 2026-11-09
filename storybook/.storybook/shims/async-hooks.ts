export class AsyncLocalStorage<T = unknown> {
    getStore(): T | undefined {
        return undefined;
    }
    // oxlint-disable-next-line typescript/no-explicit-any -- Stub implementation for Storybook compatibility
    run(_store: T, fn: (...args: any[]) => any, ...args: any[]) {
        return fn(...args);
    }
    enterWith(_store: T) {}
}
