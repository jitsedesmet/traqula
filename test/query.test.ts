/* eslint-disable import/no-nodejs-modules,no-sync */
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import { describe, it } from 'vitest';
import { allTokens, ChevSparqlLexer } from '../src/lexer/sparql11/index.js';
import { sparqlParserBuilder } from '../src/parser/sparql11/SparqlParser.js';
import './matchers/toEqualParsedQuery.js';

// Parses a JSON object, restoring `undefined` values
function parseJSON(string: string): object {
  const object = <object> JSON.parse(string);
  return (/"\{undefined\}"/u).test(string) ? restoreUndefined(object) : object;
}

// Recursively replace values of "{undefined}" by `undefined`
function restoreUndefined(object: Record<string, any>): object {
  for (const key in object) {
    // eslint-disable-next-line ts/no-unsafe-assignment
    const item = object[key];
    if (typeof item === 'object') {
      object[key] = restoreUndefined(<Record<string, any>> item);
    } else if (item === '{undefined}') {
      object[key] = undefined;
    }
  }
  return object;
}

describe('SPARQL tests', () => {
  const prefix = './test/statics/sparql';
  const statics = fs.readdirSync(prefix);
  for (const file of statics) {
    if (file.endsWith('.sparql')) {
      it(`should parse ${file}`, async({ expect }) => {
        const query = await fsp.readFile(`${prefix}/${file}`, 'utf-8');
        const result = await fsp.readFile(`${prefix}/${file.replace('.sparql', '.json')}`, 'utf-8');
        const json = JSON.parse(result);

        const lexer = ChevSparqlLexer;
        const parser = sparqlParserBuilder.consume(allTokens);
        const lexResult = lexer.tokenize(query);

        // console.log(lexResult.tokens);

        parser.input = lexResult.tokens;
        const res = parser.queryUnit();
        for (const error of parser.errors) {
          console.error(error);
        }
        expect(parser.errors).toHaveLength(0);
        expect(res).toEqualParsedQuery(json);
        // Expect(JSON.parse(JSON.stringify(res))).toStrictEqual(json);
      });
    }
  }
});
