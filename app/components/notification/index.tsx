import { Bell } from "lucide-react";
import { css } from "../../../styled-system/css";

export const Notification = () => {
    return (
        <div className={css({ color: "white" })}>
            <Bell />
        </div>
    );
};


