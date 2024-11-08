import {parse} from "./parser/parser";
// @ts-ignore
import {parse as adjustParse} from "./parser/adjust";

console.log(parse(`_:b0`));
console.log(parse(`[ ]`));

console.log(adjustParse(`_:b0`));
console.log(adjustParse(`[ ]`));

