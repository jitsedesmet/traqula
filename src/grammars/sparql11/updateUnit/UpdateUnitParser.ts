import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';
import { objectListBuilder, type ObjectListBuilderArgs } from '../queryUnit/ObjectListParser';
import { subSelectParserBuilder, type SubSelectParserBuilderArgs } from '../queryUnit/subSelectParser';
import { groupGraphPattern } from '../whereClause';
import { updateNoModifyParserBuilder, type UpdateUnitBuilderArgs } from './updateNoModifyParser';
import {
  deleteClause,
  insertClause,
  modify,
  update1,
  usingClause,
} from './updateUnit';

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
