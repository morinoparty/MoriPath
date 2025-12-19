import { defineTokens } from "@pandacss/dev";
import { blue } from "./blue";
import { cyan } from "./cyan";
import { gray } from "./gray";
import { green } from "./green";
import { leaf } from "./leaf";
import { orange } from "./orange";
import { pink } from "./pink";
import { purple } from "./purple";
import { red } from "./red";
import { sea } from "./sea";
import { teal } from "./teal";
import { yellow } from "./yellow";

export const colors = defineTokens.colors({
    ...leaf,
    ...sea,
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
