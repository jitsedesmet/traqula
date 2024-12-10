import { Builder } from '../../grammar/builder/parserBuilder';
import { baseDecl, prefixDecl, prologue } from '../../grammar/sparql11/general.js';
import { iri, prefixedName } from '../../grammar/sparql11/literals.js';
import type {
  update1,
} from '../../grammar/sparql11/updateUnit/updateUnit.js';
import {
  quadPattern,
  quadsNotTriples,
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
  quads,
  update,
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

const rulesNoUpdate1 = <const>[
  updateUnit,
  update,
  prologue,
  // Update1,
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
];

/**
 * Simple SPARQL 1.1 Update parser excluding MODIFY operations.
 * Top enable MODIFY, you need to path the update1 rule.
 */
export const updateNoModifyParserBuilder = Builder
  .createBuilder(rulesNoUpdate1)
  .addRule(update1Patch)
  .merge(triplesTemplateParserBuilder, <const> [])
  .addRule(quadPattern)
  .addRule(quadsNotTriples);

// Export type A = typeof triplesTemplateParserBuilder;
// export type B = A extends Builder<infer T, any> ? T : never;
// export const a = <const> [];
// export type C = B | RuleNames<typeof a>;
// export type D = RuleDefsToRecord<typeof a>;
// export type E = A extends Builder<any, infer U> ? U : never;
// export type F = Omit<E, RuleNames<typeof a>>;
// export type G = Omit<E, 'triplesTemplate'>;
// export type H = E & Record<'triplesTemplate', never>;
// const a2: G = <G> <unknown> null;
// a2.string = null;
//
// export type I = typeof updateNoModifyParserBuilder;
// export type J = I extends Builder<infer T, any> ? T : never;
// export type K = I extends Builder<any, infer U> ? U : never;
//
// // Export type G = Exclude<E, Record<, any>>
// const a1: K = <any> null;
// a1.quadPattern = null;
//
// export const updateParserBuilder = Builder.createBuilder(updateNoModifyParserBuilder);
