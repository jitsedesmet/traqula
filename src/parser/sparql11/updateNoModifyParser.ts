import { Builder } from '../../grammar/parserBuilder.js';
import { baseDecl, prefixDecl, prologue } from '../../grammar/sparql11/general.js';
import { iri, prefixedName } from '../../grammar/sparql11/literals.js';
import {
  add,
  clear,
  copy,
  create,
  deleteData,
  deleteWhere,
  drop,
  graphOrDefault,
  graphRef,
  graphRefAll,
  insertData,
  load,
  move,
  quadData,
  quadPattern,
  quads,
  quadsNotTriples,
  update,
  update1,
  updateUnit,
} from '../../grammar/sparql11/updateUnit/updateUnit.js';
import { triplesTemplateParserBuilder } from './triplesTemplateParserBuilder.js';

const update1Patch: typeof update1 = {
  name: 'update1',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(load) },
    { ALT: () => SUBRULE(clear) },
    { ALT: () => SUBRULE(drop) },
    { ALT: () => SUBRULE(add) },
    { ALT: () => SUBRULE(move) },
    { ALT: () => SUBRULE(copy) },
    { ALT: () => SUBRULE(create) },
    { ALT: () => SUBRULE(insertData) },
    { ALT: () => SUBRULE(deleteData) },
    { ALT: () => SUBRULE(deleteWhere) },
  ]),
};

/**
 * Simple SPARQL 1.1 Update parser excluding MODIFY operations.
 * Top enable MODIFY, you need to path the update1 rule.
 */
export const updateNoModifyParserBuilder = Builder.createBuilder([
  updateUnit,
  update,
  prologue,
  update1,
])
  .patchRule(update1Patch)
  .addMany(
    baseDecl,
    prefixDecl,
    load,
    clear,
    drop,
    add,
    move,
    copy,
    create,
    insertData,
    deleteData,
    deleteWhere,
    iri,
    prefixedName,
    graphRef,
    graphRefAll,
    graphOrDefault,
    quadData,
    quads,
  )
  .merge(triplesTemplateParserBuilder, [])
  .addRule(quadPattern)
  .addRule(quadsNotTriples);
