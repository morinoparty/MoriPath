import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { sva } from "../../../styled-system/css";
import type { SessionData } from "../../lib/server-functions";
import { UserMenu } from "../user-menu";

interface LoginStatusProps {
    session: SessionData;
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

const Root = ({ session, children }: PropsWithChildren<LoginStatusProps>) => {
    const style = loginStatusStyle();

    if (!session?.user) {
        return null;
    }

    return (
        <LoginStatusContext.Provider value={{ session }}>
            <div className={style.root}>{children}</div>
        </LoginStatusContext.Provider>
    );
};

const Avatar = () => {
    const { session } = useLoginStatusContext();
    const style = loginStatusStyle();

    return (
        <img
            className={style.avatar}
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
