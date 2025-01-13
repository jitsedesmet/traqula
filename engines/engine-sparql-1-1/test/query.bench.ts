/* eslint-disable test/consistent-test-it */
import { Parser } from 'sparqljs';
import { describe, bench } from 'vitest';
import { Sparql11Parser } from '../lib/';

describe('query, exclude construction', () => {
  const newParser = new Sparql11Parser();
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

  bench('traqula parse', () => {
    newParser.parse(query);
  });
  bench('sparqljs', () => {
    oldParser.parse(query);
  });
});
