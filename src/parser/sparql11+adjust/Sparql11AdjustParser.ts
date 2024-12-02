import { Lexer } from 'chevrotain';
import { Builder, type RuleDef } from '../../grammar/parserBuilder';
import { builtInCall } from '../../grammar/sparql11/builtIn';
import { expression } from '../../grammar/sparql11/expression';
import { allBuiltInCalls } from '../../lexer/sparql11/BuildinCalls';
import { allGraphTokens } from '../../lexer/sparql11/graph';
import { createToken } from '../../lexer/sparql11/helpers';
import * as l from '../../lexer/sparql11/index';
import { allBaseTokens } from '../../lexer/sparql11/index';
import { allSymbols } from '../../lexer/sparql11/symbols';
import { allTerminals } from '../../lexer/sparql11/terminals';
import { queryUnitParserBuilder } from '../sparql11/queryUnitParser';

const BuiltInAdjust = createToken({ name: 'BuiltInAdjust', pattern: 'ADJUST' });

const builtInAdjust: RuleDef<'builtInAdjust'> = {
  name: 'builtInAdjust',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2 }) => () => {
    CONSUME(BuiltInAdjust);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME(l.symbols.comma);
    SUBRULE2(expression);
    CONSUME(l.symbols.RParen);
  },
};

const existingBuildInCall: RuleDef<'existingBuildInCall'> = {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};

const adjustBuilder = Builder.createBuilder(false)
  .merge(queryUnitParserBuilder)
  .addRule(builtInAdjust)
  .addRule(existingBuildInCall)
  .patchRule('builtInCall', ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(builtInAdjust) },
      { ALT: () => SUBRULE(existingBuildInCall) },
    ]);
  });

export function trySparqlAdjust(): void {
  const tokens = [
    ...allBaseTokens,
    ...allBuiltInCalls,
    BuiltInAdjust,
    ...allGraphTokens,
    ...allTerminals,
    ...allSymbols,
  ];
  const lexer = new Lexer(tokens, { positionTracking: 'onlyOffset' });
  const parser = adjustBuilder.consume(tokens);

  const lexResult = lexer.tokenize('SELECT (ADJUST(?S, ?P) AS ?adjusted) WHERE { ?s ?p ?o }');
  console.log(lexResult.tokens.map(t => t.image).join(' '));

  parser.input = lexResult.tokens;
  parser.query();
  console.log(parser.errors.join('\n'));
}
