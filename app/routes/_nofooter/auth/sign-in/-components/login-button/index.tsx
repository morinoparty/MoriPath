import { Button } from "@chakra-ui/react";
import { css } from "../../../../../../../styled-system/css";

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
