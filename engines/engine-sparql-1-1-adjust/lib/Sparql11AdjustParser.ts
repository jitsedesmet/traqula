import { Builder } from '@traqula/core/lib/grammar-builder/parserBuilder';
import type { builtInCall } from '@traqula/rules-sparql-1-1/lib/grammar/builtIn';
import type { Expression } from '@traqula/rules-sparql-1-1/lib/grammar/Sparql11types';
import { builtInAdjust, existingBuildInCall } from '@traqula/rules-sparql-1-1-adjust/lib/grammar/builtIn';
import { sparql11ParserBuilder } from '../../engine-sparql-1-1/lib/Sparql11Parser';

const builtInPatch: typeof builtInCall = {
  name: 'builtInCall',
  impl: ({ SUBRULE, OR }) => () => OR<Expression>([
    { ALT: () => SUBRULE(builtInAdjust) },
    { ALT: () => SUBRULE(existingBuildInCall) },
  ]),
};

export const adjustBuilder = Builder.createBuilder(sparql11ParserBuilder)
  .addRule(builtInAdjust)
  .addRule(existingBuildInCall)
  .patchRule(builtInPatch);
