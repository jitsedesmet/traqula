import { Builder } from '../../grammar/parserBuilder.js';
import {
  deleteClause,
  insertClause,
  modify,
  update1,
  usingClause,
} from '../../grammar/sparql11/updateUnit/updateUnit.js';
import { groupGraphPattern } from '../../grammar/sparql11/whereClause.js';
import { objectListBuilder, type ObjectListBuilderArgs } from './objectListParser.js';
import { subSelectParserBuilder, type SubSelectParserBuilderArgs } from './subSelectParser.js';
import { updateNoModifyParserBuilder, type UpdateUnitBuilderArgs } from './updateNoModifyParser.js';

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
