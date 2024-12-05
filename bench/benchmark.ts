/* eslint-disable no-console */
import { Parser } from 'sparqljs';
import { Bench } from 'tinybench';
import { allTokens, ChevSparqlLexer } from '../src/lexer/sparql11/index.js';
import { sparqlParserBuilder } from '../src/parser/sparql11/SparqlParser.js';

async function main(): Promise<void> {
  const bench = new Bench({
    iterations: 100,
    throws: true,
  });

  bench.concurrency = null;

  const lexer = ChevSparqlLexer;
  const parser = sparqlParserBuilder.consume(allTokens);

  const oldParser = new Parser();

  const query = `
SELECT * WHERE {
  ?s ?p ?o
}  
`;

  bench
    .add('TRAQULA parse', () => {
      parser.reset();
      const lexResult = lexer.tokenize(query);
      parser.input = lexResult.tokens;
      const res = parser.queryOrUpdate();
    })
    .add('sparqljs', () => {
      const res = oldParser.parse(query);
    });

  // Await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
  await bench.run();

  console.table(bench.table());
}

main().catch(console.error);
