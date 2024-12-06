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

import { expressionParserBuilder } from './expressionParser.js';
import { triplesBlockParserBuilder } from './triplesBlockParser.js';

const rules = {
  subSelect,
  selectClause,
  whereClause,
  solutionModifier,
  valuesClause,
};

export const subSelectParserBuilder = Builder.createBuilder(rules)
  .merge(expressionParserBuilder, {})
  .patchRule(builtInCall)
  .addRule(existsFunc)
  .addRule(notExistsFunc)
  .addRule(groupGraphPattern)
  .addRule(groupGraphPatternSub)
  .merge(triplesBlockParserBuilder, {})
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
