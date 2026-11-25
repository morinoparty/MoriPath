import {
    createToaster,
    Toaster,
} from "@morinoparty/chlorophyll-react/components";
import type { ReactNode } from "react";
import { sva } from "../../../styled-system/css";

/** 自動で閉じるまでの時間。コピーの知らせのような一言を読める長さにする */
const TOAST_DURATION_MS = 2000;

/**
 * アプリ全体で 1 つの toaster。どこからでも toaster.create() で知らせを出す。
 * TabBar (下端から max(24px, safe-area + 8px) 浮いた高さ 64px) の 12px 上に出す
 */
export const toaster = createToaster({
    placement: "bottom",
    duration: TOAST_DURATION_MS,
    offsets: {
        top: "1rem",
        left: "1rem",
        right: "1rem",
        bottom: "calc(max(24px, env(safe-area-inset-bottom) + 8px) + 76px)",
    },
});

/** toast の meta に載せる値。icon があれば種別のアイコンの代わりに出す */
export interface ToastMeta {
    icon?: ReactNode;
}

/** 新しい知らせを出す前に、出ている知らせを片付けて 1 件だけにする */
export const showToast = (
    options: Parameters<typeof toaster.create>[0] & { meta?: ToastMeta },
) => {
    toaster.remove();
    return toaster.create(options);
};

const appToasterStyle = sva({
    slots: ["root", "icon", "title"],
    base: {
        root: {
            // TabBar と同じ、ページの上に浮かぶ白いピルにする (枠線は持たない)
            left: "0",
            right: "0",
            marginX: "auto",
            width: "fit-content",
            maxWidth: "calc(100vw - 32px)",
            alignItems: "center",
            gap: "2",
            paddingX: "4",
            paddingY: "2.5",
            borderWidth: "0",
            borderRadius: "full",
            bg: "bg.panel",
            boxShadow: "chrome",
            // 動きを減らす設定では、出入りをその場のフェードだけにする
            _motionReduce: {
                transitionProperty: "opacity",
            },
        },
        icon: {
            // スタンプの絵文字や画像。1 行の文字と並ぶ大きさにする
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: "0",
            width: "6",
            height: "6",
            fontSize: "20px",
            lineHeight: "1",
            "& img": { width: "100%", height: "100%" },
            "& svg": { width: "5", height: "5" },
        },
        title: {
            fontWeight: "medium",
            color: "fg",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
    },
});

/** 知らせを積む場所。アプリの Provider に 1 つだけ置く */
export const AppToaster = () => {
    const classes = appToasterStyle();
    return (
        <Toaster toaster={toaster}>
            {(toast) => {
                const meta = toast.meta as ToastMeta | undefined;
                return (
                    <Toaster.Toast className={classes.root}>
                        {meta?.icon ? (
                            <span className={classes.icon} aria-hidden>
                                {meta.icon}
                            </span>
                        ) : (
                            <Toaster.Indicator type={toast.type} />
                        )}
                        <Toaster.Title className={classes.title}>
                            {toast.title}
                        </Toaster.Title>
                    </Toaster.Toast>
                );
            }}
        </Toaster>
    );
};
