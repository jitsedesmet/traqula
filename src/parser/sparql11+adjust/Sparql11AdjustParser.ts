import { Builder } from '../../grammar/builder/parserBuilder';
import type { builtInCall } from '../../grammar/sparql11/builtIn.js';
import { builtInAdjust, existingBuildInCall } from '../../grammar/sparql11+adjust/builtIn.js';
import type { Expression } from '../../grammar/sparqlJsTypes';
import { sparqlParserBuilder } from '../sparql11/SparqlParser.js';

const builtInPatch: typeof builtInCall = {
  name: 'builtInCall',
  impl: ({ SUBRULE, OR }) => () => OR<Expression>([
    { ALT: () => SUBRULE(builtInAdjust) },
    { ALT: () => SUBRULE(existingBuildInCall) },
  ]),
};

export const adjustBuilder = Builder.createBuilder(sparqlParserBuilder)
  .addRule(builtInAdjust)
  .addRule(existingBuildInCall)
  .patchRule(builtInPatch);
