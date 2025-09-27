import { css } from "@/styled-system/css";

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className={css({
                height: "100vh",
            })}
        >
            {children}
        </div>
    );
}
