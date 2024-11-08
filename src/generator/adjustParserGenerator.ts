import * as peggy from "peggy";
import { readFileSync } from 'fs';
import {writeFileSync} from "node:fs";
const tspegjs = require('ts-pegjs');


const parser = peggy.generate([
    { source: "adjust.peggy", text: readFileSync(`${__dirname}/adjust.peggy`, 'utf-8').toString() }
], {
    allowedStartRules: ['BlankNode'],
    format: 'commonjs',
    // dependencies: {
    //     parser: `${__dirname}/../parser/parser.js`
    // },
    output: 'source',
    grammarSource: 'adjust.peggy',
});

writeFileSync(`${__dirname}/../parser/adjust.js`, parser.toString());
// writeFileSync(`${__dirname}/../parser/parser.js.map`, JSON.stringify(parser.toStringWithSourceMap().map.toJSON()));