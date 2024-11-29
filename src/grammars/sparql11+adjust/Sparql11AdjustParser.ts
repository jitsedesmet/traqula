import { Lexer } from 'chevrotain';
import { allBuiltInCalls } from '../../lexer/BuildinCalls';
import { allGraphTokens } from '../../lexer/graph';
import { createToken } from '../../lexer/helpers';
import * as l from '../../lexer/index';
import { allBaseTokens } from '../../lexer/index';
import { allSymbols } from '../../lexer/symbols';
import { allTerminals } from '../../lexer/terminals';
import { Builder, type RuleDef } from '../buildExample';
import { builtInCall } from '../sparql11/builtIn';
import { expression } from '../sparql11/expression';
import {
  sparql12Builder,
} from '../sparql11/Sparql11Parser';

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

const _builtInCall: RuleDef<'builtInCall'> = {
  name: builtInCall.name,
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(builtInAdjust) },
      { ALT: () => SUBRULE(existingBuildInCall) },
    ]);
  },
};

const existingBuildInCall: RuleDef<'existingBuildInCall'> = {
  name: 'existingBuildInCall',
  impl: builtInCall.impl,
};

const adjustBuilder = Builder.createBuilder(false)
  .addRule(builtInAdjust)
  .addRule(_builtInCall)
  .addRule(existingBuildInCall)
  .merge(sparql12Builder, [ _builtInCall ]);

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
