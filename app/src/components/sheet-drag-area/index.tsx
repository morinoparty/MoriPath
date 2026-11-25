import { useDialogContext } from "@ark-ui/react/dialog";
import type { ComponentProps, PointerEvent } from "react";
import { useRef } from "react";
import { css, cx } from "../../../styled-system/css";

// 指を離したときにシートを閉じる、下へ引いた距離の割合 (シートの高さに対して)
const CLOSE_DISTANCE_RATIO = 0.25;
// 短く素早く払ったときも閉じる、下向きの速さ (px/ms)
const CLOSE_VELOCITY = 0.5;
// 払いとみなす最小の移動量。タップのわずかなぶれで閉じないようにする
const MIN_FLICK_DISTANCE = 12;
// 閉じなかったときに元の位置へ戻す時間
const SNAP_BACK_MS = 200;

// ボタンなどの上で押したときは、その部品の操作を優先してドラッグを始めない
const INTERACTIVE_SELECTOR =
    "button, a, input, select, textarea, [role=button]";

const sheetDragAreaStyle = css({
    display: "flex",
    flexDirection: "column",
    // 包む前と同じく、つまみと見出しのあいだをシートの段の間隔 (gap 5) だけ空ける
    gap: "5",
    flexShrink: "0",
    // ブラウザのスクロールやプルリフレッシュに取られず、縦のドラッグをこちらで受け取る
    touchAction: "none",
    userSelect: "none",
    cursor: "grab",
    _active: { cursor: "grabbing" },
});

interface DragState {
    pointerId: number;
    startY: number;
    startTime: number;
    distance: number;
    content: HTMLElement;
}

/**
 * ボトムシート (Drawer placement="bottom") の上端の、つまみと見出しを包む領域。
 * ここをつかんで下へ引くとシートが指に付いてきて、十分に引くか素早く払うと閉じる。
 * Drawer.Content の中に置き、閉じる操作は Ark UI の Dialog に任せる
 */
export const SheetDragArea = ({
    className,
    ...props
}: ComponentProps<"div">) => {
    const dialog = useDialogContext();
    const dragRef = useRef<DragState | null>(null);

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        // マウスは主ボタンだけ。タッチとペンはそのまま受け付ける
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if ((event.target as Element).closest(INTERACTIVE_SELECTOR)) return;
        const content = event.currentTarget.closest<HTMLElement>(
            '[data-part="content"]',
        );
        if (!content) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        // 戻りのアニメーション中につかみ直しても、指の位置から動かせるようにする
        content.style.transition = "none";
        dragRef.current = {
            pointerId: event.pointerId,
            startY: event.clientY,
            startTime: event.timeStamp,
            distance: 0,
            content,
        };
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        // 上へは引き上げず、下へ引いた分だけシートを動かす
        drag.distance = Math.max(0, event.clientY - drag.startY);
        // 退場アニメーションは transform を動かすため、ずらしは別プロパティの translate に持たせる。
        // こうすると閉じるときに引いた位置から続けて下へ抜けていく
        drag.content.style.translate = `0 ${drag.distance}px`;
    };

    const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;
        dragRef.current = null;

        const elapsed = Math.max(1, event.timeStamp - drag.startTime);
        const velocity = drag.distance / elapsed;
        const pulledFarEnough =
            drag.distance > drag.content.offsetHeight * CLOSE_DISTANCE_RATIO;
        const flicked =
            drag.distance > MIN_FLICK_DISTANCE && velocity > CLOSE_VELOCITY;

        if (event.type === "pointerup" && (pulledFarEnough || flicked)) {
            // シートは閉じると取り外される (unmountOnExit) ため、ずらしは戻さずそのまま退場させる
            dialog.setOpen(false);
            return;
        }

        // 閉じないときは元の位置へなめらかに戻す
        drag.content.style.transition = `translate ${SNAP_BACK_MS}ms ease-out`;
        drag.content.style.translate = "";
    };

    return (
        <div
            {...props}
            className={cx(sheetDragAreaStyle, className)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
        />
    );
};
