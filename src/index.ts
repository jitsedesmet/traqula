import { Lexer } from 'chevrotain';
import { BuiltInAdjust } from './grammar/sparql11+adjust/builtIn';
import { allBaseTokens, allTokens, ChevSparqlLexer } from './lexer/sparql11';
import { allBuiltInCalls } from './lexer/sparql11/BuildinCalls';
import { allGraphTokens } from './lexer/sparql11/graph';
import { allSymbols } from './lexer/sparql11/symbols';
import { allTerminals } from './lexer/sparql11/terminals';
import { sparqlParserBuilder } from './parser/sparql11/SparqlParser';
import { adjustBuilder } from './parser/sparql11+adjust/Sparql11AdjustParser';

function main(): void {
  const sparqlParser = sparqlParserBuilder.consume(allTokens);
  console.log(sparqlParser);
  const lexer = ChevSparqlLexer;

  // Const lexResult = lexer.tokenize('SELECT * WHERE { ?s ?p ?o }');
  const lexResult = lexer.tokenize('select (LANGMATCHES(?S, ?P) AS ?adjusted) WHERE { ?s ?p ?o }');

  sparqlParser.input = lexResult.tokens;
  console.log(JSON.stringify(sparqlParser.queryUnit(), null, 2));
  // eslint-disable-next-line no-console
  console.log(sparqlParser.errors.join('\n'));

  const tokens = [
    ...allBaseTokens,
    ...allBuiltInCalls,
    BuiltInAdjust,
    ...allGraphTokens,
    ...allTerminals,
    ...allSymbols,
  ];
  const adjustLexer = new Lexer(tokens, { positionTracking: 'onlyOffset', ensureOptimizations: true });
  const parser = adjustBuilder.consume(tokens);

  const adjustLexResult = adjustLexer.tokenize('SELECT (ADJUST(?S, ?P) AS ?adjusted) WHERE { ?s ?p ?o }');
  console.log(lexResult.tokens.map(t => t.image).join(' '));

  parser.input = adjustLexResult.tokens;
  parser.query();
  console.log(parser.errors.join('\n'));
}

main();
