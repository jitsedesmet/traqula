import {beforeEach, describe, it} from "vitest";
import { Sparql12Parser } from "../lib";
import {positiveTest, importSparql11NoteTests, negativeTest} from "@traqula/test-utils";
import {DataFactory} from "rdf-data-factory";
import {BaseQuad} from "@rdfjs/types";

describe('a SPARQL 1.2 parser', () => {
  const parser = new Sparql12Parser({ prefixes: { ex: 'http://example.org/' }});
  beforeEach(() => {
    parser._resetBlanks();
  });

  for (const { name, statics } of [...positiveTest('paths')]) {
    it(`can parse ${name}`, async({expect}) => {
      const { query, result } = await statics();
      const res: unknown = parser.parsePath(query);
      expect(res).toEqualParsedQuery(result);
    });
  }

  for (const { name, statics } of [...positiveTest('sparql-1-1')]) {
    it(`can parse ${name}`, async({expect}) => {
      const { query, result } = await statics();
      const res: unknown = parser.parse(query);
      expect(res).toEqualParsedQuery(result);
    });
  }

  for (const { name, statics } of [...positiveTest('sparql-1-2')]) {
    it(`can parse ${name}`, async({expect}) => {
      const { query, result } = await statics();
      const res: unknown = parser.parse(query);
      expect(res).toEqualParsedQuery(result);
    });
  }

  for (const { name, statics } of [...negativeTest('sparql-1-2-invalid')]) {
    const parser = new Sparql12Parser({ prefixes: { ex: 'http://example.org/' }});
    it(`should NOT parse ${name}`, async({expect}) => {
      const { query } = await statics();
      parser._resetBlanks();
      expect(() => parser.parse(query)).toThrow();
    });
  }

  importSparql11NoteTests(parser, new DataFactory<BaseQuad>());
});