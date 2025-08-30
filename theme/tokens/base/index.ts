import { defineTokens } from "@pandacss/dev";
import { leaf } from "./leaf";
import { pink } from "./pink";
import { red } from "./red";
import { sea } from "./sea";
import { yellow } from "./yellow";

export const colors = defineTokens.colors({
    ...leaf,
    ...sea,
    ...red,
    ...yellow,
    ...pink,
});
