import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { cx, sva } from "../../../styled-system/css";
import type { SessionData } from "../../lib/server-functions";
import { UserMenu } from "../user-menu";

interface LoginStatusProps {
    session: SessionData;
    /** 既定の 44px 枠を置き換えたいときのクラス (HomeHeader など) */
    className?: string;
}

interface LoginStatusContextValue {
    session: SessionData;
}

const LoginStatusContext = createContext<LoginStatusContextValue | null>(null);

const useLoginStatusContext = () => {
    const context = useContext(LoginStatusContext);
    if (!context) {
        throw new Error(
            "LoginStatus components must be used within LoginStatus.Root",
        );
    }
    return context;
};

const loginStatusStyle = sva({
    slots: ["root", "avatar"],
    base: {
        root: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "44px",
            height: "44px",
        },
        avatar: {
            width: "44px",
            height: "44px",
            borderRadius: "md",
            cursor: "pointer",
        },
    },
});

const Root = ({
    session,
    className,
    children,
}: PropsWithChildren<LoginStatusProps>) => {
    const style = loginStatusStyle();

    if (!session?.user) {
        return null;
    }

    return (
        <LoginStatusContext.Provider value={{ session }}>
            <div className={cx(style.root, className)}>{children}</div>
        </LoginStatusContext.Provider>
    );
};

interface AvatarProps {
    /** 大きさや角丸を差し替えたいときのクラス */
    className?: string;
}

const Avatar = ({ className }: AvatarProps) => {
    const { session } = useLoginStatusContext();
    const style = loginStatusStyle();

    return (
        <img
            className={cx(style.avatar, className)}
            src={
                session?.user?.image ??
                "https://crafthead.net/avatar/Steve/128.png"
            }
            width="44"
            height="44"
            alt={session?.user?.name ?? "User avatar"}
        />
    );
};

export const LoginStatus = {
    Root,
    Avatar,
    Menu: UserMenu,
};
