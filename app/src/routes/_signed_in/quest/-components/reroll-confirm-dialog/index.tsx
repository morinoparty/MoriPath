import {
    Button,
    Dialog,
    Portal,
} from "@morinoparty/chlorophyll-react/components";
import { useId } from "react";
import { css } from "../../../../../../styled-system/css";

const noteStyle = css({
    textStyle: "sm",
    color: "colorPalette.fg.muted",
});

export interface RerollConfirmDialogProps {
    open: boolean;
    /** リロールできる残り回数 */
    rerollCharges: number;
    /** リロールしているあいだは閉じさせず、ボタンも押させない */
    isRerolling: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/** リロール前の確認。いまのクエストと進み具合が消えるため、押し間違いを防ぐ */
export const RerollConfirmDialog = ({
    open,
    rerollCharges,
    isRerolling,
    onConfirm,
    onCancel,
}: RerollConfirmDialogProps) => {
    // 誤ってリロールしないよう、開いたときは「やめる」にフォーカスを置く
    const cancelId = useId();

    return (
        <Dialog.Root
            open={open}
            size="sm"
            role="alertdialog"
            onOpenChange={(details) => {
                if (!details.open) {
                    onCancel();
                }
            }}
            closeOnEscape={!isRerolling}
            closeOnInteractOutside={!isRerolling}
            initialFocusEl={() => document.getElementById(cancelId)}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>リロールしますか？</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p className={noteStyle}>
                                いまのクエストは消え、難易度から選び直します
                                (残り {rerollCharges} 回)
                            </p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                id={cancelId}
                                intent="secondary"
                                disabled={isRerolling}
                                onClick={onCancel}
                            >
                                やめる
                            </Button>
                            <Button
                                intent="primary"
                                disabled={isRerolling}
                                aria-busy={isRerolling || undefined}
                                onClick={onConfirm}
                            >
                                {isRerolling
                                    ? "リロールしています…"
                                    : "リロールする"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
