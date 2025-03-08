import { css } from "@/styled-system/css";

export default function Home() {
    return (
        <div
            className={css({
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            })}
        >
            {/*    1から200まで*/}

            <div>
                {Array.from({ length: 200 }, (_, i) => i + 1).map((i) => (
                    <div key={i}>i: {i}</div>
                ))}
            </div>
        </div>
    );
}
