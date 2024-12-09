/* eslint-disable no-console */
import { Parser } from 'sparqljs';
import { Bench } from 'tinybench';
import { SparqlParser } from '../src/parser/sparql11/SparqlParser.js';

async function main(): Promise<void> {
  const bench = new Bench({
    iterations: 100,
    throws: true,
  });

  bench.concurrency = null;

  const newParser = new SparqlParser();
  const oldParser = new Parser();

  const query = `
SELECT ?president ?party ?page WHERE {
   ?president <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/President> .
   ?president <http://dbpedia.org/ontology/nationality> <http://dbpedia.org/resource/United_States> .
   ?president <http://dbpedia.org/ontology/party> ?party .
   ?x <http://data.nytimes.com/elements/topicPage> ?page .
   ?x <http://www.w3.org/2002/07/owl#sameAs> ?president .
}
`;

  bench
    .add('TRAQULA parse', () => {
      const res = newParser.parse(query);
    })
    .add('sparqljs', () => {
      const res = oldParser.parse(query);
    });

  // Await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
  await bench.run();

  console.table(bench.table());
}

main().catch(console.error);
