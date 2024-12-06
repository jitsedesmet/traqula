import { Builder } from '../../grammar/parserBuilder.js';
import { builtInCall, existsFunc, notExistsFunc } from '../../grammar/sparql11/builtIn.js';
import { selectClause, subSelect, valuesClause } from '../../grammar/sparql11/queryUnit/queryUnit.js';
import {
  groupClause,
  groupCondition,
  havingClause,
  havingCondition,
  limitClause,
  limitOffsetClauses,
  offsetClause,
  orderClause,
  orderCondition,
  solutionModifier,
} from '../../grammar/sparql11/solutionModifier.js';
import {
  bind,
  constraint,
  dataBlock,
  dataBlockValue,
  filter,
  functionCall,
  graphGraphPattern,
  graphPatternNotTriples,
  groupGraphPattern,
  groupGraphPatternSub,
  groupOrUnionGraphPattern,
  inlineData,
  inlineDataFull,
  inlineDataOneVar,
  minusGraphPattern,
  optionalGraphPattern,
  serviceGraphPattern,
  whereClause,
} from '../../grammar/sparql11/whereClause.js';

import { expressionParserBuilder, type ExpressionParserBuilderArgs } from './expressionParser.js';
import { type TriplesBlockBuilderArgs, triplesBlockParserBuilder } from './triplesBlockParser.js';

export type SubSelectParserBuilderArgs =
  '' |
  'subSelect' |
  'selectClause' |
  'whereClause' |
  'solutionModifier' |
  'valuesClause' |
  ExpressionParserBuilderArgs |
  'builtInExists' |
  'builtInNotexists' |
  'groupGraphPattern' |
  'groupGraphPatternSub' |
  TriplesBlockBuilderArgs |
  'graphPatternNotTriples' |
  'groupOrUnionGraphPattern' |
  'optionalGraphPattern' |
  'minusGraphPattern' |
  'graphGraphPattern' |
  'serviceGraphPattern' |
  'filter' |
  'bind' |
  'inlineData' |
  'constraint' |
  'functionCall' |
  'dataBlock' |
  'inlineDataOneVar' |
  'inlineDataFull' |
  'dataBlockValue' |
  'groupClause' |
  'havingClause' |
  'orderClause' |
  'limitOffsetClauses' |
  'groupCondition' |
  'havingCondition' |
  'orderCondition' |
  'limitClause' |
  'offsetClause';

export const subSelectParserBuilder: Builder<SubSelectParserBuilderArgs> = Builder.createBuilder()
  .addRule(subSelect)
  .addRule(selectClause)
  .addRule(whereClause)
  .addRule(solutionModifier)
  .addRule(valuesClause)
  .merge(expressionParserBuilder)
  .patchRule('builtInCall', builtInCall.impl)
  .addRule(existsFunc)
  .addRule(notExistsFunc)
  .addRule(groupGraphPattern)
  .addRule(groupGraphPatternSub)
  .merge(triplesBlockParserBuilder)
  .addRule(graphPatternNotTriples)
  .addRule(groupOrUnionGraphPattern)
  .addRule(optionalGraphPattern)
  .addRule(minusGraphPattern)
  .addRule(graphGraphPattern)
  .addRule(serviceGraphPattern)
  .addRule(filter)
  .addRule(bind)
  .addRule(inlineData)
  .addRule(constraint)
  .addRule(functionCall)
  .addRule(dataBlock)
  .addRule(inlineDataOneVar)
  .addRule(inlineDataFull)
  .addRule(dataBlockValue)
  // Solution modifier
  .addRule(groupClause)
  .addRule(havingClause)
  .addRule(orderClause)
  .addRule(limitOffsetClauses)
  .addRule(groupCondition)
  .addRule(havingCondition)
  .addRule(orderCondition)
  .addRule(limitClause)
  .addRule(offsetClause);
