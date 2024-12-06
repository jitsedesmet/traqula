/* eslint-disable import/no-nodejs-modules,no-sync */
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import { describe, it } from 'vitest';
import { allTokens, ChevSparqlLexer } from '../src/lexer/sparql11/index.js';
import { sparqlParserBuilder } from '../src/parser/sparql11/SparqlParser.js';
import './matchers/toEqualParsedQuery.js';
import {DataFactory} from "rdf-data-factory";

describe('A SPARQL parser', () => {
  describe('confirms to SPARQL tests', () => {
    const prefix = './test/statics/sparql';
    const statics = fs.readdirSync(prefix);
    for (const file of statics) {
      if (file.endsWith('.sparql')) {
        it(`should parse ${file}`, async ({expect}) => {
          const query = await fsp.readFile(`${prefix}/${file}`, 'utf-8');
          const result = await fsp.readFile(`${prefix}/${file.replace('.sparql', '.json')}`, 'utf-8');
          const json = JSON.parse(result);

          const lexer = ChevSparqlLexer;
          const parser = sparqlParserBuilder.consume({ tokenVocabulary: allTokens }, {
            dataFactory: new DataFactory({blankNodePrefix: 'g_'})
          });
          const lexResult = lexer.tokenize(query);

          parser.input = lexResult.tokens;
          const res = parser.queryOrUpdate();
          for (const error of parser.errors) {
            console.error(error);
          }
          expect(parser.errors).toHaveLength(0);
          expect(res).toEqualParsedQuery(json);
        });
      }
    }
  });

  it('should throw an error on a projection of ungrouped variable', function () {
    var query = 'PREFIX : <http://www.example.org/> SELECT ?o WHERE { ?s ?p ?o } GROUP BY ?s', error = null;
    var error = null;
    try { parser.parse(query); }
    catch (e) { error = e; }

    expect(error).not.toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("Projection of ungrouped variable (?o)");
  });
});
