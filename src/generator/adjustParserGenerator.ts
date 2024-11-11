// eslint-disable-next-line import/no-nodejs-modules
import { writeFileSync } from 'node:fs';

// eslint-disable-next-line import/no-nodejs-modules
import * as path from 'node:path';
import * as peggy from 'peggy';
import { terminals, useFile } from './sparqlParserGenerator';

const parser = peggy.generate([
  ...terminals,
  useFile('adjustGrammar/BlankNode'),
], {
  allowedStartRules: [ 'BlankNode' ],
  format: 'commonjs',
  output: 'source',
  // eslint-disable-next-line ts/no-require-imports
  plugins: [ require('ts-pegjs') ],
});

writeFileSync(path.join(__dirname, '..', 'parser/', 'adjustParser.ts'), parser.toString());
// WriteFileSync(`${__dirname}/../parser/parser.js.map`, JSON.stringify(parser.toStringWithSourceMap().map.toJSON()));
