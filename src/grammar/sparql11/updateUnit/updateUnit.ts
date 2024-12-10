import type { TokenType } from 'chevrotain';
import * as l from '../../../lexer/sparql11/index.js';
import type { RuleDef, RuleDefReturn } from '../../builder/ruleDefTypes.js';
import type {
  ClearDropOperation,
  GraphOrDefault,
  GraphQuads,
  GraphReference,
  InsertDeleteOperation,
  IriTerm,
  LoadOperation,
  Quads,
  Update,
  UpdateOperation,
} from '../../sparqlJsTypes';
import { unCapitalize } from '../../utils.js';
import { prologue, triplesTemplate, varOrIri } from '../general.js';
import { iri } from '../literals.js';
import { groupGraphPattern } from '../whereClause.js';

/**
 * [[3]](https://www.w3.org/TR/sparql11-query/#rUpdateUnit)
 */
export const updateUnit: RuleDef<'updateUnit', Update> = <const> {
  name: 'updateUnit',
  impl: ({ ACTION, SUBRULE }) => () => {
    const data = SUBRULE(update);

    ACTION(() => data.updates.reverse());
    return data;
  },
};

/**
 * [[29]](https://www.w3.org/TR/sparql11-query/#rUpdate)
 */
export const update: RuleDef<'update', Update> = <const> {
  name: 'update',
  impl: ({ ACTION, SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    const prologueValues = SUBRULE(prologue);
    const result: Update = {
      type: 'update',
      base: prologueValues.base,
      prefixes: prologueValues.prefixes,
      updates: [],
    };
    OPTION1(() => {
      const updateOperation = SUBRULE(update1);
      const recursiveRes = OPTION2(() => {
        CONSUME(l.symbols.semi);
        return SUBRULE(update);
      });

      return ACTION(() => {
        result.updates.push(updateOperation);
        if (recursiveRes) {
          result.updates.push(...recursiveRes.updates);
          result.base = recursiveRes.base ?? result.base;
          result.prefixes = recursiveRes.prefixes ? { ...result.prefixes, ...recursiveRes.prefixes } : result.prefixes;
        }
      });
    });
    return result;
  },
};

/**
 * [[30]](https://www.w3.org/TR/sparql11-query/#rUpdate1)
 */
export const update1: RuleDef<'update1', UpdateOperation> = <const> {
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
    { ALT: () => SUBRULE(modify) },
  ]),
};

/**
 * [[31]](https://www.w3.org/TR/sparql11-query/#rLoad)
 */
export const load: RuleDef<'load', LoadOperation> = <const> {
  name: 'load',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    CONSUME(l.load);
    const silent = Boolean(OPTION1(() => CONSUME(l.silent)));
    const source = SUBRULE(iri);
    const destination = OPTION2(() => {
      CONSUME(l.loadInto);
      return SUBRULE(graphRef);
    });
    return {
      type: 'load',
      silent,
      source,
      ...(destination && { destination }),
    };
  },
};

/**
 * [[32]](https://www.w3.org/TR/sparql11-query/#rClear)
 */
export const clear: RuleDef<'clear', ClearDropOperation> = <const> {
  name: 'clear',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.clear);
    const silent = Boolean(OPTION(() => CONSUME(l.silent)));
    const graph = SUBRULE(graphRefAll);
    return {
      type: 'clear',
      silent,
      graph,
    };
  },
};

/**
 * [[33]](https://www.w3.org/TR/sparql11-query/#rDrop)
 */
export const drop: RuleDef<'drop', UpdateOperation> = <const> {
  name: 'drop',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.drop);
    const silent = Boolean(OPTION(() => CONSUME(l.silent)));
    const graph = SUBRULE(graphRefAll);
    return {
      type: 'drop',
      silent,
      graph,
    };
  },
};

/**
 * [[34]](https://www.w3.org/TR/sparql11-query/#rCreate)
 */
export const create: RuleDef<'create', UpdateOperation> = <const> {
  name: 'create',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.create);
    const silent = Boolean(OPTION(() => CONSUME(l.silent)));
    const graph = SUBRULE(graphRef);
    return {
      type: 'create',
      silent,
      graph: {
        type: 'graph',
        name: graph,
      },
    };
  },
};

function copyMoveAddOperation<T extends 'Copy' | 'Move' | 'Add'>(operation: TokenType & { name: T }):
RuleDef<Uncapitalize<T>, UpdateOperation> {
  return {
    name: unCapitalize(operation.name),
    impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
      CONSUME(operation);
      const silent = Boolean(OPTION(() => CONSUME(l.silent)));
      const source = SUBRULE1(graphOrDefault);
      CONSUME(l.to);
      const destination = SUBRULE2(graphOrDefault);
      return {
        type: unCapitalize(operation.name),
        silent,
        source,
        destination,
      };
    },
  };
}

/**
 * [[35]](https://www.w3.org/TR/sparql11-query/#rAdd)
 */
export const add = copyMoveAddOperation(l.add);

/**
 * [[36]](https://www.w3.org/TR/sparql11-query/#rMove)
 */
export const move = copyMoveAddOperation(l.move);

/**
 * [[37]](https://www.w3.org/TR/sparql11-query/#rCopy)
 */
export const copy = copyMoveAddOperation(l.copy);

/**
 * [[38]](https://www.w3.org/TR/sparql11-query/#rInsertData)
 */
export const insertData: RuleDef<'insertData', InsertDeleteOperation> = <const> {
  name: 'insertData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertData);
    const insert = SUBRULE(quadData);
    return {
      updateType: 'insert',
      insert,
    };
  },
};

/**
 * [[39]](https://www.w3.org/TR/sparql11-query/#rDeleteData)
 */
export const deleteData: RuleDef<'deleteData', InsertDeleteOperation> = <const> {
  name: 'deleteData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteData);
    const del = SUBRULE(quadData);
    return {
      updateType: 'delete',
      delete: del,
    };
  },
};

/**
 * [[40]](https://www.w3.org/TR/sparql11-query/#rDeleteWhere)
 */
export const deleteWhere: RuleDef<'deleteWhere', InsertDeleteOperation> = <const> {
  name: 'deleteWhere',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteWhere);
    const del = SUBRULE(quadPattern);
    return {
      updateType: 'deletewhere',
      delete: del,
    };
  },
};

/**
 * [[41]](https://www.w3.org/TR/sparql11-query/#rModify)
 */
export const modify: RuleDef<'modify', UpdateOperation> = <const> {
  name: 'modify',
  impl: ({ ACTION, SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OR }) => () => {
    const graph = OPTION1(() => {
      CONSUME(l.modifyWith);
      return SUBRULE(iri);
    });
    const { insert, delete: del } = OR([
      {
        ALT: () => {
          const del = SUBRULE(deleteClause);
          const insert = OPTION2(() => SUBRULE1(insertClause)) ?? [];
          return { delete: del, insert };
        },
      },
      { ALT: () => {
        const insert = SUBRULE2(insertClause);
        return { insert, delete: []};
      } },
    ]);
    const usingArr: RuleDefReturn<typeof usingClause>[] = [];
    MANY(() => {
      usingArr.push(SUBRULE(usingClause));
    });
    CONSUME(l.where);
    const where = SUBRULE(groupGraphPattern);

    return ACTION(() => {
      const def: IriTerm[] = [];
      const named: IriTerm[] = [];
      for (const { value, type } of usingArr) {
        if (type === 'default') {
          def.push(value);
        } else {
          named.push(value);
        }
      }
      return {
        updateType: 'insertdelete',
        graph,
        insert,
        delete: del,
        using: usingArr.length > 0 ? { default: def, named } : undefined,
        where: where.patterns,
      };
    });
  },
};

/**
 * [[42]](https://www.w3.org/TR/sparql11-query/#rDeleteClause)
 */
export const deleteClause: RuleDef<'deleteClause', Quads[]> = <const> {
  name: 'deleteClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteClause);
    return SUBRULE(quadPattern);
  },
};

/**
 * [[43]](https://www.w3.org/TR/sparql11-query/#rInsertClause)
 */
export const insertClause: RuleDef<'insertClause', Quads[]> = <const> {
  name: 'insertClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertClause);
    return SUBRULE(quadPattern);
  },
};

/**
 * [[44]](https://www.w3.org/TR/sparql11-query/#rUsingClause)
 */
export const usingClause: RuleDef<'usingClause', { value: IriTerm; type: 'default' | 'named' }> = <const> {
  name: 'usingClause',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR }) => () => {
    CONSUME(l.usingClause);
    return OR<RuleDefReturn<typeof usingClause>>([
      { ALT: () => {
        const value = SUBRULE1(iri);
        return { value, type: 'default' };
      } },
      {
        ALT: () => {
          CONSUME(l.graph.named);
          const value = SUBRULE2(iri);
          return { value, type: 'named' };
        },
      },
    ]);
  },
};

/**
 * [[45]](https://www.w3.org/TR/sparql11-query/#rGraphOrDefault)
 */
export const graphOrDefault: RuleDef<'graphOrDefault', GraphOrDefault> = <const> {
  name: 'graphOrDefault',
  impl: ({ SUBRULE, CONSUME, OPTION, OR }) => () => OR<GraphOrDefault>([
    { ALT: () => {
      CONSUME(l.graph.default_);
      return { type: 'graph', default: true };
    } },
    {
      ALT: () => {
        OPTION(() => CONSUME(l.graph.graph));
        const name = SUBRULE(iri);
        return {
          type: 'graph',
          name,
        };
      },
    },
  ]),
};

/**
 * [[46]](https://www.w3.org/TR/sparql11-query/#rGraphRef)
 */
export const graphRef: RuleDef<'graphRef', IriTerm> = <const> {
  name: 'graphRef',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    return SUBRULE(iri);
  },
};

/**
 * [[47]](https://www.w3.org/TR/sparql11-query/#rGraphRefAll)
 */
export const graphRefAll: RuleDef<'graphRefAll', GraphReference> = <const> {
  name: 'graphRefAll',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR<GraphReference>([
    { ALT: () => {
      const name = SUBRULE(graphRef);
      return { type: 'graph', name };
    } },
    { ALT: () => {
      CONSUME(l.graph.default_);
      return { default: true };
    } },
    { ALT: () => {
      CONSUME(l.graph.named);
      return { named: true };
    } },
    { ALT: () => {
      CONSUME(l.graph.graphAll);
      return { all: true };
    } },
  ]),
};

/**
 * [[48]](https://www.w3.org/TR/sparql11-query/#rQuadPattern)
 */
export const quadPattern: RuleDef<'quadPattern', Quads[]> = <const> {
  name: 'quadPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    const val = SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
    return val;
  },
};

/**
 * [[49]](https://www.w3.org/TR/sparql11-query/#rQuadData)
 */
export const quadData: RuleDef<'quadData', Quads[]> = <const> {
  name: 'quadData',
  impl: quadPattern.impl,
};

/**
 * [[50]](https://www.w3.org/TR/sparql11-query/#rQuads)
 */
export const quads: RuleDef<'quads', Quads[]> = <const> {
  name: 'quads',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OPTION3 }) => () => {
    const quads: Quads[] = [];

    OPTION1(() => {
      const triples = SUBRULE1(triplesTemplate);
      quads.push({
        type: 'bgp',
        triples,
      });
    });

    MANY(() => {
      quads.push(SUBRULE(quadsNotTriples));
      OPTION2(() => CONSUME(l.symbols.dot));
      OPTION3(() => {
        const triples = SUBRULE2(triplesTemplate);
        quads.push({
          type: 'bgp',
          triples,
        });
      });
    });

    return quads;
  },
};

/**
 * [[51]](https://www.w3.org/TR/sparql11-query/#rQuadsNotTriples)
 */
export const quadsNotTriples: RuleDef<'quadsNotTriples', GraphQuads> = <const> {
  name: 'quadsNotTriples',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.graph.graph);
    const name = SUBRULE(varOrIri);
    CONSUME(l.symbols.LCurly);
    const triples = OPTION(() => SUBRULE(triplesTemplate)) ?? [];
    CONSUME(l.symbols.RCurly);

    return {
      type: 'graph',
      name,
      triples,
    };
  },
};
