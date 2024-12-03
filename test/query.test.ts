import * as fs from "node:fs";
import { describe, it } from 'vitest'
import * as fsp from "node:fs/promises";
import {allTokens, ChevSparqlLexer} from "../src/lexer/sparql11/index.js";
import {sparqlParserBuilder} from "../src/parser/sparql11/SparqlParser.js";

// Parses a JSON object, restoring `undefined` values
const parseJSON = function parseJSON(string: string): object {
  var object = JSON.parse(string);
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object;
}

// Recursively replace values of "{undefined}" by `undefined`
function restoreUndefined(object: any): object {
  for (var key in object) {
    var item = object[key];
    if (typeof item === 'object')
      object[key] = restoreUndefined(item);
    else if (item === '{undefined}')
      object[key] = undefined;
  }
  return object;
}


describe('SPARQL tests', () => {
  const prefix = './test/statics/sparql'
  const statics = fs.readdirSync(prefix);
  for (const file of statics) {
    if (file.endsWith('sparql-4-2a.sparql')) {
      it(`should parse ${file}`, async ({expect}) => {
        const query = await fsp.readFile(`${prefix}/${file}`, 'utf-8');
        const result = await fsp.readFile(`${prefix}/${file.replace('.sparql', '.json')}`, 'utf-8');
        const json = JSON.parse(result);

        const lexer = ChevSparqlLexer;
        const parser = sparqlParserBuilder.consume(allTokens)
        const lexResult = lexer.tokenize(query);

        console.log(lexResult.tokens);

        parser.input = lexResult.tokens;
        const res = parser.queryUnit();
        for (const error of parser.errors) {
          console.error(error);
        }
        expect(parser.errors).toHaveLength(0);
        expect(JSON.parse(JSON.stringify(res))).toStrictEqual(json);
      })
    }
  }
})