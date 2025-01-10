import { Builder } from '@traqula/core/lib/grammar-builder/parserBuilder';

import {
  deleteClause,
  insertClause,
  modify,
  update1,
  usingClause,
} from '@traqula/rules-sparql-1-1/lib/grammar/updateUnit/updateUnit';
import { groupGraphPattern } from '@traqula/rules-sparql-1-1/lib/grammar/whereClause';
import { objectListBuilder } from './objectListParser';
import { subSelectParserBuilder } from './subSelectParser';
import { updateNoModifyParserBuilder } from './updateNoModifyParser';

export const updateParserBuilder = Builder.createBuilder(updateNoModifyParserBuilder)
  .patchRule(update1)
  .addMany(modify, deleteClause, insertClause, usingClause, groupGraphPattern)
// This substitutes all of propertyListNotEmpty
  .merge(objectListBuilder, <const> [])
  .merge(subSelectParserBuilder, <const> []);
