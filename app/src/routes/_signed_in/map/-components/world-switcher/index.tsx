import { IconButton, Menu } from "@morinoparty/chlorophyll-react/components";
import { Check, Layers } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { worldLabels } from "../../-functions/world-labels";
import { type WorldId, worldIds } from "../../-types/world-map";

const worldSwitcherStyle = sva({
    slots: ["trigger", "content", "item", "check"],
    base: {
        trigger: {
            // 地図の上に浮かぶクロムなので、枠線ではなく白い面 + 影で持ち上げる
            // ホームのパーティ切り替えと同じ 40px にそろえる
            width: "40px",
            height: "40px",
            bg: "bg.panel",
            borderWidth: "0",
            borderRadius: "l3",
            boxShadow: "chrome",
            color: "colorPalette.fg",
            "& svg": {
                width: "20px",
                height: "20px",
            },
        },
        content: {
            borderWidth: "0",
            boxShadow: "chrome",
            borderRadius: "panel",
        },
        item: {
            justifyContent: "space-between",
            fontWeight: "medium",
        },
        check: {
            width: "16px",
            height: "16px",
            color: "colorPalette.fg",
            // 選択中のワールドにだけチェックを見せる (幅は常に確保して文字をそろえる)
            opacity: 0,
            "&[data-selected]": {
                opacity: 1,
            },
        },
    },
});

export interface WorldSwitcherProps {
    value: WorldId;
    onValueChange: (world: WorldId) => void;
}

/** 表示するワールドを切り替えるボタン (地図の右上) */
export const WorldSwitcher = ({ value, onValueChange }: WorldSwitcherProps) => {
    const style = worldSwitcherStyle();
    return (
        <Menu.Root
            positioning={{ placement: "bottom-end", gutter: 8 }}
            // 項目の value はワールド ID そのもの
            onSelect={({ value: selected }) =>
                onValueChange(selected as WorldId)
            }
        >
            <Menu.Trigger asChild>
                <IconButton
                    variant="outline"
                    size="lg"
                    className={style.trigger}
                    aria-label="ワールドを切り替える"
                >
                    <Layers aria-hidden />
                </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content className={style.content}>
                    {worldIds.map((world) => (
                        <Menu.Item
                            key={world}
                            value={world}
                            className={style.item}
                            aria-current={world === value ? "true" : undefined}
                        >
                            {worldLabels[world]}
                            <Check
                                aria-hidden
                                className={style.check}
                                data-selected={world === value ? "" : undefined}
                            />
                        </Menu.Item>
                    ))}
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    );
};
