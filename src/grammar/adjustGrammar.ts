import { Lexer } from 'chevrotain';
import { allBuiltInCalls } from '../lexer/BuildinCalls';
import { allGraphTokens } from '../lexer/graph';
import { createToken } from '../lexer/helpers';
import * as l from '../lexer/index';
import { allBaseTokens } from '../lexer/index';
import { allSymbols } from '../lexer/symbols';
import { allTerminals } from '../lexer/terminals';
import { Builder, type RuleDef } from './buildExample';
import {
  buildInCall,
  expression,
  sparql12Builder,
} from './gramTest';

const BuildInAdjust = createToken({ name: 'BuildInAdjust', pattern: 'ADJUST' });

const buildInAdjust: RuleDef & { name: 'buildInAdjust' } = {
  name: 'buildInAdjust',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2 }) => () => {
    CONSUME(BuildInAdjust);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME(l.symbols.comma);
    SUBRULE2(expression);
    CONSUME(l.symbols.RParen);
  },
};

const _buildInCall: RuleDef & { name: 'buildInCall' } = {
  name: buildInCall.name,
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(buildInAdjust) },
      { ALT: () => SUBRULE(alternativeBuildInCall) },
    ]);
  },
};

const alternativeBuildInCall: RuleDef & { name: 'alternativeBuildInCall' } = {
  name: 'alternativeBuildInCall',
  impl: buildInCall.impl,
};

const adjustBuilder = Builder.createBuilder()
  .addRule(buildInAdjust)
  .addRule(_buildInCall)
  .addRule(alternativeBuildInCall)
  .merge(sparql12Builder, [ _buildInCall ]);

export function trySparqlAdjust(): void {
  const tokens = [
    ...allBaseTokens,
    ...allBuiltInCalls,
    BuildInAdjust,
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
