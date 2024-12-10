import { Builder } from '../../grammar/parserBuilder.js';

import { updateNoModifyParserBuilder } from './updateNoModifyParser.js';

export const updateParserBuilder = Builder.createBuilder(updateNoModifyParserBuilder);
// .patchRule(update1)
// .addMany(modify, deleteClause, insertClause, usingClause, groupGraphPattern)
// // This substitutes all of propertyListNotEmpty
// .merge(objectListBuilder, <const> [])
// .merge(subSelectParserBuilder, <const> []);
