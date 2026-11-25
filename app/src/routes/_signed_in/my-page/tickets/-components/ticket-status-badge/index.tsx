import { Badge } from "@morinoparty/chlorophyll-react/components";
import { css } from "../../../../../../../styled-system/css";
import { ticketStatusLabel } from "../../-functions/ticket-status";
import type { Ticket } from "../../-types/ticket";

// クローズしたものは文字を控えめにして、対応中のものと見分けやすくする
const closedStyle = css({ color: "colorPalette.fg.muted" });

export interface TicketStatusBadgeProps {
    ticket: Pick<Ticket, "status" | "closeReason">;
}

/** お問い合わせの対応状況のピル。対応中は点付きの森色、クローズは控えめな色 */
export const TicketStatusBadge = ({ ticket }: TicketStatusBadgeProps) => {
    const label = ticketStatusLabel(ticket);
    if (ticket.status === "open") {
        return (
            <Badge variant="subtle" size="sm" status="success" dot>
                {label}
            </Badge>
        );
    }
    return (
        <Badge variant="subtle" size="sm" className={closedStyle}>
            {label}
        </Badge>
    );
};
