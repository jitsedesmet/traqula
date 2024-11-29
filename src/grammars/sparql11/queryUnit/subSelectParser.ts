import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';

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
} from '../solutionModifier';

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
} from '../whereClause';
import { expressionParserBuilder } from './expressionParser';
import { selectClause, subSelect, valuesClause } from './queryUnit';
import { triplesBlockParserBuilder } from './triplesBlockParser';

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
