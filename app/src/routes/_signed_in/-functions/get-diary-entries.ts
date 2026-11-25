import { createServerFn } from "@tanstack/react-start";
import type { DiaryEntry } from "../-types/diary";
import { buildPlaceholderDiary } from "./build-placeholder-diary";

/**
 * 今日のダイアリーを取得する。
 * TODO(#38): ダイアリーの API ができたら、仮データではなく API から取得する
 */
export const getDiaryEntries = createServerFn().handler(
    async (): Promise<DiaryEntry[]> => buildPlaceholderDiary(new Date()),
);

export type DiaryEntriesData = Awaited<ReturnType<typeof getDiaryEntries>>;
