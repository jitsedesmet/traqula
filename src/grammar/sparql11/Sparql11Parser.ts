import { ChevSparqlLexer } from '../../lexer/sparql11/index';
import { queryUnitParser } from '../../parser/sparql11/queryUnitParser';

export function trySparql12(): void {
  console.log(queryUnitParser);
  const lexer = ChevSparqlLexer;

  // Const lexResult = lexer.tokenize('SELECT * WHERE { ?s ?p ?o }');
  const lexResult = lexer.tokenize('select (LANGMATCHES(?S, ?P) AS ?adjusted) WHERE { ?s ?p ?o }');

  queryUnitParser.input = lexResult.tokens;
  console.log(JSON.stringify(queryUnitParser.queryUnit(), null, 2));
  // eslint-disable-next-line no-console
  console.log(queryUnitParser.errors.join('\n'));
}