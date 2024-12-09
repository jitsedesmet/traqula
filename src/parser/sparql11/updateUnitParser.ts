import { Builder } from '../../grammar/parserBuilder.js';
import {
  deleteClause,
  insertClause,
  modify,
  update1,
  usingClause,
} from '../../grammar/sparql11/updateUnit/updateUnit.js';
import { groupGraphPattern } from '../../grammar/sparql11/whereClause.js';
import { objectListBuilder } from './objectListParser.js';
import { subSelectParserBuilder } from './subSelectParser.js';
import { updateNoModifyParserBuilder } from './updateNoModifyParser.js';

export const updateParserBuilder = Builder.createBuilder(updateNoModifyParserBuilder)
  .patchRule(update1)
  .addRule(modify)
  .addRule(deleteClause)
  .addRule(insertClause)
  .addRule(usingClause)
  .addRule(groupGraphPattern)
  // This substitutes all of propertyListNotEmpty
  .merge(objectListBuilder, [])
  .merge(subSelectParserBuilder, []);
