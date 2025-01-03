import { Builder } from '../../grammar/builder/parserBuilder';

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
  .addMany(modify, deleteClause, insertClause, usingClause, groupGraphPattern)
// This substitutes all of propertyListNotEmpty
  .merge(objectListBuilder, <const> [])
  .merge(subSelectParserBuilder, <const> []);
