import { Builder } from '../../grammar/parserBuilder';
import { selectClause, subSelect, valuesClause } from '../../grammar/sparql11/queryUnit/queryUnit';
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
} from '../../grammar/sparql11/solutionModifier';
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
} from '../../grammar/sparql11/whereClause';
import { allTokens } from '../../lexer/sparql11/index';

import { expressionParserBuilder, type ExpressionParserBuilderArgs } from './expressionParser';
import { type TriplesBlockBuilderArgs, triplesBlockParserBuilder } from './triplesBlockParser';

export type SubSelectParserBuilderArgs =
  '' |
  'subSelect' |
  'selectClause' |
  'whereClause' |
  'solutionModifier' |
  'valuesClause' |
  ExpressionParserBuilderArgs |
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

export const subSelectParserBuilder = Builder.createBuilder(false)
  .addRule(subSelect)
  .addRule(selectClause)
  .addRule(whereClause)
  .addRule(solutionModifier)
  .addRule(valuesClause)
  .merge(expressionParserBuilder)
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

export const subSelectParser = subSelectParserBuilder.consume(allTokens);