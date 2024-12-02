import {describe, expect, it} from '@jest/globals';
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import {allTokens, ChevSparqlLexer} from "../src/lexer/sparql11/index.js";
import {sparqlParserBuilder} from "../src/parser/sparql11/SparqlParser.js";


describe('SPARQL tests', () => {
  const prefix = './test/statics/sparql'
  const statics = fs.readdirSync(prefix);
  for (const file of statics) {
    console.log(file);
    if (file === 'all.sparql') {
      it(`should parse ${file}`, async () => {
        const query = await fsp.readFile(`${prefix}/${file}`, 'utf-8');
        const result = await fsp.readFile(`${prefix}/${file.replace('.sparql', '.json')}`, 'utf-8');

        const lexer = ChevSparqlLexer;
        const parser = sparqlParserBuilder.consume(allTokens)
        const lexResult = lexer.tokenize(query);
        parser.input = lexResult.tokens;
        const res = parser.queryUnit();
        expect(parser.errors).toHaveLength(0);
        expect(JSON.stringify(res, null, 2)).toEqual(result);
      })
    }
  }
})