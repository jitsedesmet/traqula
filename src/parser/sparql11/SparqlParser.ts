import { Builder } from '../../grammar/parserBuilder';
import { queryUnitParserBuilder } from './queryUnitParser';
import { updateParserBuilder } from './updateUnitParser';

export const sparqlParserBuilder = Builder.createBuilder(false)
  .merge(queryUnitParserBuilder).merge(updateParserBuilder);
