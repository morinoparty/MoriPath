import { type LucideIcon, Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import type { DiaryEntryGroup } from "../../-types/diary-day";

const diarySectionHeaderStyle = sva({
    slots: ["root", "icon", "text", "title", "subtitle"],
    base: {
        root: {
            display: "flex",
            alignItems: "center",
            gap: "3",
        },
        // 時間帯のアイコンは、地色より一段明るい丸に置く
        icon: {
            flexShrink: "0",
            display: "grid",
            placeItems: "center",
            width: "8",
            height: "8",
            borderRadius: "full",
            bg: "colorPalette.surface.subtle",
            color: "colorPalette.fg",
            "& svg": {
                width: "4",
                height: "4",
            },
        },
        text: {
            display: "flex",
            flexDirection: "column",
            minWidth: "0",
        },
        title: {
            textStyle: "md",
            fontWeight: "bold",
            color: "colorPalette.fg",
        },
        subtitle: {
            textStyle: "xs",
            color: "colorPalette.fg.muted",
        },
    },
});

// 時間帯ごとのアイコン。日の出・日中・日の入り・夜の順に移り変わる
const ICONS: Record<DiaryEntryGroup["id"], LucideIcon> = {
    morning: Sunrise,
    daytime: Sun,
    evening: Sunset,
    night: Moon,
};

/** 時 (24 時以降は翌日の時) を「04:00」の形にする */
const formatHour = (hour: number): string =>
    `${String(hour % 24).padStart(2, "0")}:00`;

export interface DiarySectionHeaderProps {
    group: Omit<DiaryEntryGroup, "entries">;
}

/** ダイアリーの時間帯 (朝・昼・夕方・夜) の見出し。アイコン、名前、時間の範囲と一言を並べる */
export const DiarySectionHeader = ({ group }: DiarySectionHeaderProps) => {
    const style = diarySectionHeaderStyle();
    const Icon = ICONS[group.id];
    return (
        <div className={style.root}>
            <span className={style.icon} aria-hidden>
                <Icon />
            </span>
            <div className={style.text}>
                <h2 className={style.title}>{group.label}</h2>
                <p className={style.subtitle}>
                    {formatHour(group.from)} – {formatHour(group.until)} ・{" "}
                    {group.caption}
                </p>
            </div>
        </div>
    );
};
