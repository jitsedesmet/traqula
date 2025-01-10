import { Builder } from '@traqula/core/lib/grammar-builder/parserBuilder';
import {
  datasetClause,
  defaultGraphClause,
  namedGraphClause,
  sourceSelector,
} from '@traqula/rules-sparql-1-1/lib/grammar/dataSetClause';
import { baseDecl, prefixDecl, prologue } from '@traqula/rules-sparql-1-1/lib/grammar/general';
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
} from '@traqula/rules-sparql-1-1/lib/grammar/queryUnit/queryUnit';
import { subSelectParserBuilder } from './subSelectParser';
import { triplesTemplateParserBuilder } from './triplesTemplateParserBuilder';

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
