import { Builder } from '@traqula/core';
import { gram } from '@traqula/rules-sparql-1-1-adjust';
import type { Expression } from '@traqula/rules-sparql-1-1';
import type { gram as g11 } from '@traqula/rules-sparql-1-1';
import { sparql11ParserBuilder } from '@traqula/engine-sparql-1-1';

const builtInPatch: typeof g11.builtInCall = {
  name: 'builtInCall',
  impl: ({ SUBRULE, OR }) => () => OR<Expression>([
    { ALT: () => SUBRULE(gram.builtInAdjust) },
    { ALT: () => SUBRULE(gram.existingBuildInCall) },
  ]),
};

export const adjustBuilder = Builder.createBuilder(sparql11ParserBuilder)
  .addRule(gram.builtInAdjust)
  .addRule(gram.existingBuildInCall)
  .patchRule(builtInPatch);
