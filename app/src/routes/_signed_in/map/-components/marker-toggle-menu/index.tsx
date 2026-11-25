import { Menu } from "@morinoparty/chlorophyll-react/components";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { checkbox } from "../../../../../../styled-system/recipes";
import { overlayLabels } from "../../-functions/default-overlays";
import {
    type OverlayKey,
    overlayKeys,
    type OverlayVisibility,
} from "../../-types/world-map";

const markerToggleMenuStyle = sva({
    slots: [
        "trigger",
        "triggerIcon",
        "triggerLabel",
        "chevron",
        "content",
        "item",
    ],
    base: {
        trigger: {
            // 地図の上に浮かぶクロムなので、枠線ではなく白い面 + 影で持ち上げる
            display: "inline-flex",
            alignItems: "center",
            gap: "2",
            height: "48px",
            pl: "2",
            pr: "3",
            bg: "bg.panel",
            borderRadius: "l3",
            boxShadow: "chrome",
            color: "colorPalette.fg",
            fontSize: "sm",
            fontWeight: "bold",
            cursor: "pointer",
            whiteSpace: "nowrap",
        },
        triggerIcon: {
            display: "grid",
            placeItems: "center",
            width: "32px",
            height: "32px",
            borderRadius: "l2",
            bg: "colorPalette.surface",
            "& svg": {
                width: "18px",
                height: "18px",
            },
        },
        triggerLabel: {
            lineHeight: "1",
        },
        chevron: {
            width: "16px",
            height: "16px",
            transition: "transform 0.15s",
            // 開いているあいだは上向きにする
            "[data-state=open] > &": {
                transform: "rotate(180deg)",
            },
        },
        // 地図の上のクロムとそろえ、Chlorophyll の Menu の枠線を外して白い面 + 影で浮かせる
        content: {
            minWidth: "200px",
            p: "2",
            borderWidth: "0",
            borderRadius: "l3",
            boxShadow: "chrome",
        },
        // 指でも押しやすいよう、行の高さを少し広げる
        item: {
            minHeight: "11",
            fontWeight: "medium",
        },
    },
});

export interface MarkerToggleMenuProps {
    value: OverlayVisibility;
    onValueChange: (value: OverlayVisibility) => void;
    /** Storybook で開いた状態を見せるため */
    defaultOpen?: boolean;
}

/**
 * 地図に出すマーカーの種類を選ぶメニュー (地図の左上)。
 * 項目はその場でオン / オフを切り替えるだけの操作なので、フォームの Checkbox ではなく
 * Menu の CheckboxItem (menuitemcheckbox) にして、矢印キーでの移動と Enter / Space での切り替えを Ark UI に任せる。
 * 見た目は以前と同じく、行の先頭にチェックボックスの四角を出す
 */
export const MarkerToggleMenu = ({
    value,
    onValueChange,
    defaultOpen,
}: MarkerToggleMenuProps) => {
    const style = markerToggleMenuStyle();
    // 各行の先頭に、Chlorophyll の Checkbox と同じ四角を置いてオン / オフを見せる
    const box = checkbox({ size: "md" });

    // 1 項目だけを切り替え、ほかの項目の状態はそのまま返す
    const handleCheckedChange = (key: OverlayKey, checked: boolean) => {
        onValueChange({ ...value, [key]: checked });
    };

    return (
        <Menu.Root
            defaultOpen={defaultOpen}
            // 続けていくつも切り替えられるよう、項目を選んでもメニューを閉じない
            closeOnSelect={false}
            positioning={{ placement: "bottom-start", gutter: 8 }}
        >
            <Menu.Trigger className={style.trigger}>
                <span className={style.triggerIcon}>
                    <MapPin aria-hidden />
                </span>
                <span className={style.triggerLabel}>マーカー表示</span>
                <ChevronDown className={style.chevron} aria-hidden />
            </Menu.Trigger>
            <Menu.Positioner>
                {/* メニューの名前はトリガーの「マーカー表示」から Ark UI が aria-labelledby で付ける */}
                <Menu.Content className={style.content}>
                    {overlayKeys.map((key) => (
                        <Menu.CheckboxItem
                            key={key}
                            value={key}
                            checked={value[key]}
                            onCheckedChange={(checked) =>
                                handleCheckedChange(key, checked)
                            }
                            className={style.item}
                        >
                            {/* 見た目だけの四角 (状態は行の menuitemcheckbox が aria-checked で伝える) */}
                            <span
                                className={box.control}
                                data-state={
                                    value[key] ? "checked" : "unchecked"
                                }
                                aria-hidden
                            >
                                {value[key] && (
                                    <span className={box.indicator}>
                                        <Check />
                                    </span>
                                )}
                            </span>
                            {overlayLabels[key]}
                        </Menu.CheckboxItem>
                    ))}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};
