import { defineTokens } from "@chakra-ui/react";
import { blue } from "./base/blue";
import { cyan } from "./base/cyan";
import { gray } from "./base/gray";
import { green } from "./base/green";
import { leaf } from "./base/leaf";
import { orange } from "./base/orange";
import { pink } from "./base/pink";
import { purple } from "./base/purple";
import { red } from "./base/red";
import { sea } from "./base/sea";
import { teal } from "./base/teal";
import { yellow } from "./base/yellow";

export const colors = defineTokens.colors({
  transparent: {
    value: "transparent",
  },
  current: {
    value: "currentColor",
  },
  black: {
    value: "#09090B",
  },
  white: {
    value: "#FFFFFF",
  },
  whiteAlpha: {
    "50": {
      value: "rgba(255, 255, 255, 0.04)",
    },
    "100": {
      value: "rgba(255, 255, 255, 0.06)",
    },
    "200": {
      value: "rgba(255, 255, 255, 0.08)",
    },
    "300": {
      value: "rgba(255, 255, 255, 0.16)",
    },
    "400": {
      value: "rgba(255, 255, 255, 0.24)",
    },
    "500": {
      value: "rgba(255, 255, 255, 0.36)",
    },
    "600": {
      value: "rgba(255, 255, 255, 0.48)",
    },
    "700": {
      value: "rgba(255, 255, 255, 0.64)",
    },
    "800": {
      value: "rgba(255, 255, 255, 0.80)",
    },
    "900": {
      value: "rgba(255, 255, 255, 0.92)",
    },
    "950": {
      value: "rgba(255, 255, 255, 0.95)",
    },
  },
  blackAlpha: {
    "50": {
      value: "rgba(0, 0, 0, 0.04)",
    },
    "100": {
      value: "rgba(0, 0, 0, 0.06)",
    },
    "200": {
      value: "rgba(0, 0, 0, 0.08)",
    },
    "300": {
      value: "rgba(0, 0, 0, 0.16)",
    },
    "400": {
      value: "rgba(0, 0, 0, 0.24)",
    },
    "500": {
      value: "rgba(0, 0, 0, 0.36)",
    },
    "600": {
      value: "rgba(0, 0, 0, 0.48)",
    },
    "700": {
      value: "rgba(0, 0, 0, 0.64)",
    },
    "800": {
      value: "rgba(0, 0, 0, 0.80)",
    },
    "900": {
      value: "rgba(0, 0, 0, 0.92)",
    },
    "950": {
      value: "rgba(0, 0, 0, 0.95)",
    },
  },
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
