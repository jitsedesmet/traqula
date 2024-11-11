// eslint-disable-next-line import/no-nodejs-modules
import { readFileSync, writeFileSync } from 'node:fs';

// eslint-disable-next-line import/no-nodejs-modules
import * as path from 'node:path';
import * as peggy from 'peggy';
import type { SourceText } from 'peggy';

export function useFile(fileName: string): SourceText {
  return {
    source: fileName,
    text: readFileSync(path.join(__dirname, `${fileName}.peggy`), 'utf-8').toString(),
  };
}

export const terminals = [
  useFile('sparqlGrammar/terminals/ANON'),
  useFile('sparqlGrammar/terminals/BLANK_NODE_LABEL'),
  useFile('sparqlGrammar/terminals/HEX'),
  useFile('sparqlGrammar/terminals/PERCENT'),
  useFile('sparqlGrammar/terminals/PLX'),
  useFile('sparqlGrammar/terminals/PN_CHARS'),
  useFile('sparqlGrammar/terminals/PN_CHARS_BASE'),
  useFile('sparqlGrammar/terminals/PN_CHARS_U'),
  useFile('sparqlGrammar/terminals/PN_LOCAL'),
  useFile('sparqlGrammar/terminals/PN_LOCAL_ESC'),
  useFile('sparqlGrammar/terminals/PN_PREFIX'),
  useFile('sparqlGrammar/terminals/PNAME_LN'),
  useFile('sparqlGrammar/terminals/PNAME_NS'),
  useFile('sparqlGrammar/terminals/WS'),
];

const parser = peggy.generate([
  ...terminals,
  useFile('sparqlGrammar/BlankNode'),
], {
  allowedStartRules: [ 'BlankNode' ],
  format: 'commonjs',
  output: 'source',
  // eslint-disable-next-line ts/no-require-imports
  plugins: [ require('ts-pegjs') ],
});

writeFileSync(path.join(__dirname, '..', 'parser/', 'parser.ts'), parser.toString());
// WriteFileSync(`${__dirname}/../parser/parser.js.map`, JSON.stringify(parser.toStringWithSourceMap().map.toJSON()));
