import * as peggy from "peggy";
import { readFileSync } from 'fs';
import {writeFileSync} from "node:fs";
const tspegjs = require('ts-pegjs');


const parser = peggy.generate([
    { source: "file1.peggy", text: readFileSync(`${__dirname}/file1.peggy`, 'utf-8').toString() }
], {
    allowedStartRules: ['BlankNode'],
    format: 'commonjs',
    output: 'source',
    grammarSource: 'file1.peggy',
    plugins: [tspegjs]
});

writeFileSync(`${__dirname}/../parser/parser.ts`, parser.toString());
// writeFileSync(`${__dirname}/../parser/parser.js.map`, JSON.stringify(parser.toStringWithSourceMap().map.toJSON()));