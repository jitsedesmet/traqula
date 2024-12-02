import { Builder } from '../../grammar/parserBuilder';
import { builtInAdjust, existingBuildInCall } from '../../grammar/sparql11+adjust/builtIn';
import type { Expression } from '../../grammar/sparqlJSTypes';
import { sparqlParserBuilder } from '../sparql11/SparqlParser';

export const adjustBuilder = Builder.createBuilder(false)
  .merge(sparqlParserBuilder)
  .addRule(builtInAdjust)
  .addRule(existingBuildInCall)
  .patchRule('builtInCall', ({ SUBRULE, OR }) => () => OR<Expression>([
    { ALT: () => SUBRULE(builtInAdjust) },
    { ALT: () => SUBRULE(existingBuildInCall) },
  ]));
