import { Button } from "@chakra-ui/react";
import { createServerFn } from "@tanstack/react-start";
import { css } from "../../../../../../../styled-system/css";
import { auth } from "../../../../../../lib/auth";

type LoginButtonProps = {
    onClick: () => void;
};

export const LoginButton = ({ onClick }: LoginButtonProps) => {
    return (
        <Button
            type="submit"
            size="xl"
            className={css({
                width: "100%",
            })}
            onClick={onClick}
        >
            MineAuthでログイン
        </Button>
    );
};
