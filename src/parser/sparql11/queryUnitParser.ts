import { Builder } from '../../grammar/parserBuilder.js';
import {
  datasetClause,
  defaultGraphClause,
  namedGraphClause,
  sourceSelector,
} from '../../grammar/sparql11/dataSetClause.js';
import { baseDecl, prefixDecl, prologue } from '../../grammar/sparql11/general.js';
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
} from '../../grammar/sparql11/queryUnit/queryUnit.js';
import { subSelectParserBuilder } from './subSelectParser.js';
import { triplesTemplateParserBuilder } from './triplesTemplateParserBuilder.js';

export const queryUnitParserBuilder = Builder.createBuilder()
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
