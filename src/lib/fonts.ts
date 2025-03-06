import {
    Montserrat,
    Montserrat_Alternates,
    Noto_Sans_JP,
    Poppins,
} from "next/font/google";

const notoSansJp = Noto_Sans_JP({
    subsets: ["latin"],
    weight: ["500", "700"],
    preload: false,
    variable: "--font-noto-sans-jp",
    display: "swap",
    fallback: ["Hiragino Sans", "Hiragino Kaku Gothic ProN", "sans-serif"],
});

const poppins = Poppins({
    weight: "500",
    variable: "--font-poppins",
    display: "swap",
    subsets: ["latin"],
});

const montserratAlternates = Montserrat_Alternates({
    weight: "500",
    variable: "--font-montserrat-alternates",
    display: "swap",
    subsets: ["latin"],
});

const montserrat = Montserrat({
    weight: "500",
    variable: "--font-montserrat",
    display: "swap",
    subsets: ["latin"],
});

const fontList = [poppins, montserratAlternates, montserrat, notoSansJp];

const fonts = fontList
    .map((font) => {
        return font.variable;
    })
    .join(" ");

export { fonts };
