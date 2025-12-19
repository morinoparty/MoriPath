import { defineTokens } from "@pandacss/dev";
import { mori } from "./mori";
import { umi } from "./umi";
import { red } from "./red";
import { yellow } from "./yellow";
import { pink } from "./pink";
import { cyan } from "./cyan";
import { purple } from "./purple";
import { blue } from "./blue";
import { teal } from "./teal";
import { green } from "./green";
import { orange } from "./orange";
import { gray } from "./gray";

export const colors = defineTokens.colors({
    ...mori,
    ...umi,
    ...red,
    ...yellow,
    ...pink,
    ...cyan,
    ...purple,
    ...blue,
    ...teal,
    ...green,
    ...orange,
    ...gray,
});
