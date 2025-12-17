import "../app/style/app.css";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { themes } from "storybook/theming";
import { Provider } from "../app/components/ui/provider";
import { registerAPCACheck } from "./a11y";
import { withDummyRouter } from "./dummy-router";

const apca = registerAPCACheck("silver");

export const parameters = {
    screenshot: {
        provider: {
            name: "storycap",
        },
    },
};

const preview: Preview = {
    parameters: {
        docs: {
            theme: themes.dark,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        a11y: {
            test: "error",
            context: "body",
            config: {
                checks: [...apca.checks],
                rules: [
                    {
                        id: "autocomplete-valid",
                        selector: '*:not([autocomplete="nope"])',
                    },
                    {
                        id: "image-alt",
                        enabled: false,
                    },
                    {
                        id: "color-contrast",
                        enabled: false,
                    },
                    {
                        id: "color-contrast-enhanced",
                        enabled: false,
                    },
                    ...apca.rules,
                ],
            },
            options: {},
        },
    },
    decorators: [
        (Story) => (
            <Provider>
                <div
                    style={{
                        backgroundColor: "var(--chakra-colors-bg)",
                    }}
                >
                    <Story />
                </div>
            </Provider>
        ),
        withThemeByClassName({
            defaultTheme: "light",
            themes: { light: "", dark: "dark" },
        }),
        withDummyRouter("/"),
    ],
};

export default preview;
