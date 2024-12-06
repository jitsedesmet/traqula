import { Builder } from '../../grammar/parserBuilder.js';
import {
  baseDecl,
  prefixDecl,
  prologue,
} from '../../grammar/sparql11/general.js';
import {
  iri,
  prefixedName,
} from '../../grammar/sparql11/literals.js';
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
import {
  triplesTemplateParserBuilder,
  type TriplesTemplateParserArgs,
} from './triplesTemplateParserBuilder.js';

export type UpdateUnitBuilderArgs = '' |
  'updateUnit' |
  'update' |
  'prologue' |
  'update1' |
  'baseDecl' |
  'prefixDecl' |
  'load' |
  'clear' |
  'drop' |
  'add' |
  'move' |
  'copy' |
  'create' |
  'insertData' |
  'deleteData' |
  'deleteWhere' |
  'iri' |
  'prefixedName' |
  'graphRef' |
  'graphRefAll' |
  'graphOrDefault' |
  'quadData' |
  'quads' |
  TriplesTemplateParserArgs |
  'quadPattern' |
  'quadsNotTriples';

export const updateNoModifyParserBuilder: Builder<UpdateUnitBuilderArgs> = Builder.createBuilder()
  .addRule(updateUnit)
  .addRule(update)
  .addRule(prologue)
  .addRule(update1)
  .patchRule('update1', ({ SUBRULE, OR }) => () => OR([
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
  ]))
  .addRule(baseDecl)
  .addRule(prefixDecl)
  .addRule(load)
  .addRule(clear)
  .addRule(drop)
  .addRule(add)
  .addRule(move)
  .addRule(copy)
  .addRule(create)
  .addRule(insertData)
  .addRule(deleteData)
  .addRule(deleteWhere)
  .addRule(iri)
  .addRule(prefixedName)
  .addRule(graphRef)
  .addRule(graphRefAll)
  .addRule(graphOrDefault)
  .addRule(quadData)
  .addRule(quads)
  .merge(triplesTemplateParserBuilder)
  .addRule(quadPattern)
  .addRule(quadsNotTriples);
