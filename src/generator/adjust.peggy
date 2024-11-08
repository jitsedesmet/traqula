import {BLANK_NODE_LABEL} from "./parser.js";

BlankNode = blank:BLANK_NODE_LABEL { return { type: "BlankMode", value: blank }; }
