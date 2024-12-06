import { Builder } from '../../grammar/parserBuilder.js';
import { builtInAdjust, existingBuildInCall } from '../../grammar/sparql11+adjust/builtIn.js';
import type { Expression } from '../../grammar/sparqlJSTypes.js';
import { sparqlParserBuilder } from '../sparql11/SparqlParser.js';

export const adjustBuilder = Builder.createBuilder()
  .merge(sparqlParserBuilder)
  .addRule(builtInAdjust)
  .addRule(existingBuildInCall)
  .patchRule('builtInCall', ({ SUBRULE, OR }) => () => OR<Expression>([
    { ALT: () => SUBRULE(builtInAdjust) },
    { ALT: () => SUBRULE(existingBuildInCall) },
  ]));
