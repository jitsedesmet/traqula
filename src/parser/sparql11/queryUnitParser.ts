import { Builder } from '../../grammar/parserBuilder';
import {
  datasetClause,
  defaultGraphClause,
  namedGraphClause,
  sourceSelector,
} from '../../grammar/sparql11/dataSetClause';
import { baseDecl, prefixDecl, prologue } from '../../grammar/sparql11/general';
import {
  askQuery,
  constructQuery,
  constructTemplate,
  constructTriples,
  describeQuery,
  query,
  queryUnit,
  selectQuery,
  valuesClause,
} from '../../grammar/sparql11/queryUnit/queryUnit';
import { allTokens } from '../../lexer/sparql11/index';
import { subSelectParserBuilder } from './subSelectParser';
import { triplesTemplateParserBuilder } from './triplesTemplateParserBuilder';

export const queryUnitParserBuilder = Builder.createBuilder(false)
  .addRule(queryUnit)
  .addRule(query)
  .addRule(prologue)
  .addRule(selectQuery)
  .addRule(constructQuery)
  .addRule(describeQuery)
  .addRule(askQuery)
  .addRule(valuesClause)
  .addRule(baseDecl)
  .addRule(prefixDecl)

  // Select Query
  .merge(subSelectParserBuilder)
  .addRule(datasetClause)
  .addRule(defaultGraphClause)
  .addRule(namedGraphClause)
  .addRule(sourceSelector)

  // Construct Query
  .addRule(constructTemplate)
  .merge(triplesTemplateParserBuilder)
  .addRule(constructTriples);

export const queryUnitParser = queryUnitParserBuilder.consume(allTokens);
