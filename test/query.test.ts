import {describe, expect, it} from '@jest/globals';
import * as fs from "node:fs/promises";
import {sparqlParserBuilder} from "../src/parser/sparql11/SparqlParser.js";
import {allTokens, ChevSparqlLexer} from "../src/lexer/sparql11/index.js";

describe('SPARQL tests', async () => {
  const statics = await fs.readdir('./statics');
  for (const file of statics) {
    if (file.endsWith('.sparql')) {
      const query = await fs.readFile(`./statics/${file}`, 'utf-8');
      const result = await fs.readFile(`./statics/${file.replace('.sparql', '.json')}`, 'utf-8');
      it(`should parse ${file}`, async () => {
        const lexer = ChevSparqlLexer;
        const parser = sparqlParserBuilder.consume(allTokens)
        const lexResult = lexer.tokenize(query);
        parser.input = lexResult.tokens;
        parser.queryUnit();
        expect(parser.errors).toHaveLength(0);
        expect(JSON.stringify(parser.query(), null, 2)).toEqual(result);
      })
    }
  }
})