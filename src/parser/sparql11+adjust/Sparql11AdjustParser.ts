import { Builder } from '../../grammar/builder/parserBuilder';
import type { builtInCall } from '../../grammar/sparql11/builtIn.js';
import { builtInAdjust, existingBuildInCall } from '../../grammar/sparql11+adjust/builtIn.js';
import type { Expression } from '../../grammar/sparqlJsTypes';
import { sparql11ParserBuilder } from '../sparql11/Sparql11Parser';

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
