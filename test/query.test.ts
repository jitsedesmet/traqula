/* eslint-disable import/no-nodejs-modules,no-sync */
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import {describe, it} from 'vitest';
import './matchers/toEqualParsedQuery.js';
import {SparqlParser} from "../src/parser/sparql11/SparqlParser.js";

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


          const parser = new SparqlParser();
          const res = parser.parse(query);
          expect(res).toEqualParsedQuery(json);
        });
      }
    }
  });
});
