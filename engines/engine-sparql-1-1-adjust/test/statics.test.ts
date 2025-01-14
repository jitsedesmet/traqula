import {beforeEach, describe, it} from "vitest";
import {Sparql11AdjustParser} from "../lib";
import {positiveTest, importSparql11NoteTests} from "@traqula/test-utils";
import {DataFactory} from "rdf-data-factory";
import {BaseQuad} from "@rdfjs/types";

describe('a SPARQL 1.1 + adjust parser', () => {
  const parser = new Sparql11AdjustParser({ prefixes: { ex: 'http://example.org/' }});
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

  importSparql11NoteTests(parser, new DataFactory<BaseQuad>());

  it('parses ADJUST function', ({expect}) => {
    const query =  `
SELECT ?s ?p (ADJUST(?o, "-PT10H"^^<http://www.w3.org/2001/XMLSchema#dayTimeDuration>) as ?adjusted) WHERE {
  ?s ?p ?o
}
`;
    const res: unknown = parser.parse(query);
    expect(res).toMatchObject({});
  })
});