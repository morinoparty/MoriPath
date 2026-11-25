/**
 * いつまでも届かない値。読み込み中 (スケルトン) の見た目を確かめるストーリーで、
 * loader が待たずに渡す Promise の代わりに使う
 */
export const pending = <T>(): Promise<T> => new Promise<T>(() => {});
