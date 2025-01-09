import { Builder } from '../../grammar/builder/parserBuilder';
import { builtInCall, existsFunc, notExistsFunc } from '../../grammar/sparql11/builtIn';
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

import { expressionParserBuilder } from './expressionParser';
import { triplesBlockParserBuilder } from './triplesBlockParser';

const rules = <const> [
  subSelect,
  selectClause,
  whereClause,
  solutionModifier,
  valuesClause,
];

export const subSelectParserBuilder = Builder.createBuilder(rules)
  .merge(expressionParserBuilder, <const> [])
  .patchRule(builtInCall)
  .addMany(
    existsFunc,
    notExistsFunc,
    groupGraphPattern,
    groupGraphPatternSub,
  )
  .merge(triplesBlockParserBuilder, <const> [])
  .addMany(
    graphPatternNotTriples,
    groupOrUnionGraphPattern,
    optionalGraphPattern,
    minusGraphPattern,
    graphGraphPattern,
    serviceGraphPattern,
    filter,
    bind,
    inlineData,
    constraint,
    functionCall,
    dataBlock,
    inlineDataOneVar,
    inlineDataFull,
    dataBlockValue,
    // Solution modifier
    groupClause,
    havingClause,
    orderClause,
    limitOffsetClauses,
    groupCondition,
    havingCondition,
    orderCondition,
    limitClause,
    offsetClause,
  );
