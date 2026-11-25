import { Popover } from "@ark-ui/react/popover";
import { Checkbox } from "@morinoparty/chlorophyll-react/components";
import { ChevronDown, MapPin } from "lucide-react";
import { sva } from "../../../../../../styled-system/css";
import { overlayLabels } from "../../-functions/default-overlays";
import { overlayKeys, type OverlayVisibility } from "../../-types/world-map";

const markerToggleMenuStyle = sva({
    slots: [
        "trigger",
        "triggerIcon",
        "triggerLabel",
        "chevron",
        "positioner",
        "content",
        "group",
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
            bg: "colorPalette.bg.subtle",
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
        positioner: {
            // zag は z-index をインラインで当てるため、!important で上書きする
            zIndex: "popover!",
        },
        content: {
            minWidth: "200px",
            p: "4",
            bg: "bg.panel",
            borderRadius: "l3",
            boxShadow: "chrome",
            outline: "none",
        },
        group: {
            display: "flex",
            flexDirection: "column",
            gap: "3",
        },
    },
});

export interface MarkerToggleMenuProps {
    value: OverlayVisibility;
    onValueChange: (value: OverlayVisibility) => void;
    /** Storybook で開いた状態を見せるため */
    defaultOpen?: boolean;
}

/** 地図に出すマーカーの種類を選ぶメニュー (地図の左上) */
export const MarkerToggleMenu = ({
    value,
    onValueChange,
    defaultOpen,
}: MarkerToggleMenuProps) => {
    const style = markerToggleMenuStyle();
    // Checkbox.Group はチェック済みの value の配列で扱うので、ON の項目だけを並べる
    const checked = overlayKeys.filter((key) => value[key]);

    // 配列から項目ごとの ON / OFF に戻す
    const handleChange = (next: string[]) => {
        const nextValue = Object.fromEntries(
            overlayKeys.map((key) => [key, next.includes(key)]),
        ) as OverlayVisibility;
        onValueChange(nextValue);
    };

    return (
        <Popover.Root
            defaultOpen={defaultOpen}
            positioning={{ placement: "bottom-start", gutter: 8 }}
        >
            <Popover.Trigger className={style.trigger}>
                <span className={style.triggerIcon}>
                    <MapPin aria-hidden />
                </span>
                <span className={style.triggerLabel}>マーカー表示</span>
                <ChevronDown className={style.chevron} aria-hidden />
            </Popover.Trigger>
            <Popover.Positioner className={style.positioner}>
                <Popover.Content className={style.content}>
                    <Checkbox.Group
                        className={style.group}
                        value={checked}
                        onValueChange={handleChange}
                        aria-label="表示するマーカー"
                    >
                        {overlayKeys.map((key) => (
                            <Checkbox.Root key={key} value={key}>
                                <Checkbox.Control />
                                <Checkbox.Label>
                                    {overlayLabels[key]}
                                </Checkbox.Label>
                                <Checkbox.HiddenInput />
                            </Checkbox.Root>
                        ))}
                    </Checkbox.Group>
                </Popover.Content>
            </Popover.Positioner>
        </Popover.Root>
    );
};
