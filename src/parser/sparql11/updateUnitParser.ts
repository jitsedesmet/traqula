import { Builder } from '../../grammar/parserBuilder';
import {
  deleteClause,
  insertClause,
  modify,
  update1,
  usingClause,
} from '../../grammar/sparql11/updateUnit/updateUnit';
import { groupGraphPattern } from '../../grammar/sparql11/whereClause';
import { allTokens } from '../../lexer/sparql11/index';
import { objectListBuilder, type ObjectListBuilderArgs } from './objectListParser';
import { subSelectParserBuilder, type SubSelectParserBuilderArgs } from './subSelectParser';
import { updateNoModifyParserBuilder, type UpdateUnitBuilderArgs } from './updateNoModifyParser';

export type UpdateBuilderArgs =
  UpdateUnitBuilderArgs |
  'modify' |
  'iri' |
  'deleteClause' |
  'insertClause' |
  'usingClause' |
  'groupGraphPattern' |
  ObjectListBuilderArgs |
  SubSelectParserBuilderArgs;

export const updateParserBuilder: Builder<UpdateBuilderArgs> = Builder.createBuilder(false)
  .merge(updateNoModifyParserBuilder)
  .patchRule('update1', update1.impl)
  .addRule(modify)
  .addRule(deleteClause)
  .addRule(insertClause)
  .addRule(usingClause)
  .addRule(groupGraphPattern)
  // This substitutes all of propertyListNotEmpty
  .merge(objectListBuilder)
  .merge(subSelectParserBuilder);

export const updateParser = updateParserBuilder.consume(allTokens);
