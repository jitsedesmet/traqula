import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';
import { datasetClause, defaultGraphClause, namedGraphClause, sourceSelector } from '../dataSetClause';
import { baseDecl, prefixDecl, prologue } from '../general';
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
} from './queryUnit';
import { subSelectParserBuilder } from './subSelectParser';
import { triplesTemplateParserBuilder } from './TriplesTemplateParserBuilder';

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
