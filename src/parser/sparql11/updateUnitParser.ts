import { Builder } from '../../grammar/builder/parserBuilder';

import {
  deleteClause,
  insertClause,
  modify,
  update1,
  usingClause,
} from '../../grammar/sparql11/updateUnit/updateUnit';
import { groupGraphPattern } from '../../grammar/sparql11/whereClause';
import { objectListBuilder } from './objectListParser';
import { subSelectParserBuilder } from './subSelectParser';
import { updateNoModifyParserBuilder } from './updateNoModifyParser';

export const updateParserBuilder = Builder.createBuilder(updateNoModifyParserBuilder)
  .patchRule(update1)
  .addMany(modify, deleteClause, insertClause, usingClause, groupGraphPattern)
// This substitutes all of propertyListNotEmpty
  .merge(objectListBuilder, <const> [])
  .merge(subSelectParserBuilder, <const> []);
