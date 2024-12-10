import { Builder } from '../../grammar/builder/parserBuilder';
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

const rules = <const> [
  queryUnit,
  query,
  prologue,
  selectQuery,
  constructQuery,
  describeQuery,
  askQuery,
  valuesClause,
  baseDecl,
  prefixDecl,
];

export const queryUnitParserBuilder = Builder.createBuilder(rules)
  // Select Query
  .merge(subSelectParserBuilder, <const> [])
  .addRule(datasetClause)
  .addRule(defaultGraphClause)
  .addRule(namedGraphClause)
  .addRule(sourceSelector)
  // Construct Query
  .addRule(constructTemplate)
  .merge(triplesTemplateParserBuilder, <const> [])
  .addRule(constructTriples);
