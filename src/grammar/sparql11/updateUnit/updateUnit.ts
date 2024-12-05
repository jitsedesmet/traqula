import type { TokenType } from 'chevrotain';
import * as l from '../../../lexer/sparql11/index.js';
import type { RuleDef, RuleDefReturn } from '../../parserBuilder.js';
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
} from '../../sparqlJSTypes.js';
import { unCapitalize } from '../../utils.js';
import { prologue, triplesTemplate, varOrIri } from '../general.js';
import { iri } from '../literals.js';
import { groupGraphPattern } from '../whereClause.js';

/**
 * [[3]](https://www.w3.org/TR/sparql11-query/#rUpdateUnit)
 */
export const updateUnit: RuleDef<'updateUnit', Update> = {
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
export const update: RuleDef<'update', Update> = {
  name: 'update',
  impl: ({ ACTION, SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    const prologValue = SUBRULE(prologue);
    const optionalResult = OPTION1<Update>(() => {
      const updateOperation = SUBRULE(update1);
      const recursiveRes = OPTION2(() => {
        CONSUME(l.symbols.semi);
        return SUBRULE(update);
      });

      return ACTION(() => {
        if (recursiveRes) {
          recursiveRes.updates.push(updateOperation);
          return {
            type: 'update',
            base: recursiveRes.base ?? prologValue.base,
            prefixes: recursiveRes.prefixes ?
                { ...prologValue.prefixes, ...recursiveRes.prefixes } :
              prologValue.prefixes,
            updates: recursiveRes.updates,
          };
        }
        return {
          type: 'update',
          base: prologValue.base,
          prefixes: prologValue.prefixes,
          updates: [ updateOperation ],
        };
      });
    });
    return ACTION(() => optionalResult ?? {
      type: 'update',
      base: prologValue.base,
      prefixes: prologValue.prefixes,
      updates: [],
    });
  },
};

/**
 * [[30]](https://www.w3.org/TR/sparql11-query/#rUpdate1)
 */
export const update1: RuleDef<'update1', UpdateOperation> = {
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
export const load: RuleDef<'load', LoadOperation> = {
  name: 'load',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    CONSUME(l.load);
    const silent = Boolean(OPTION1(() => CONSUME(l.silent)));
    const source = SUBRULE(iri);
    const destination = OPTION2(() => {
      CONSUME(l.loadInto);
      return SUBRULE(graphRef);
    }) ?? false;
    return {
      type: 'load',
      silent,
      source,
      destination,
    };
  },
};

/**
 * [[32]](https://www.w3.org/TR/sparql11-query/#rClear)
 */
export const clear: RuleDef<'clear', ClearDropOperation> = {
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
export const drop: RuleDef<'drop', UpdateOperation> = {
  name: 'drop',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.drop);
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
 * [[34]](https://www.w3.org/TR/sparql11-query/#rCreate)
 */
export const create: RuleDef<'create', UpdateOperation> = {
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
export const insertData: RuleDef<'insertData', InsertDeleteOperation> = {
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
export const deleteData: RuleDef<'deleteData', InsertDeleteOperation> = {
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
export const deleteWhere: RuleDef<'deleteWhere', InsertDeleteOperation> = {
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
export const modify: RuleDef<'modify', UpdateOperation> = {
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
export const deleteClause: RuleDef<'deleteClause', Quads[]> = {
  name: 'deleteClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteClause);
    return SUBRULE(quadPattern);
  },
};

/**
 * [[43]](https://www.w3.org/TR/sparql11-query/#rInsertClause)
 */
export const insertClause: RuleDef<'insertClause', Quads[]> = {
  name: 'insertClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertClause);
    return SUBRULE(quadPattern);
  },
};

/**
 * [[44]](https://www.w3.org/TR/sparql11-query/#rUsingClause)
 */
export const usingClause: RuleDef<'usingClause', { value: IriTerm; type: 'default' | 'named' }> = {
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
export const graphOrDefault: RuleDef<'graphOrDefault', GraphOrDefault> = {
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
export const graphRef: RuleDef<'graphRef', IriTerm> = {
  name: 'graphRef',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    return SUBRULE(iri);
  },
};

/**
 * [[47]](https://www.w3.org/TR/sparql11-query/#rGraphRefAll)
 */
export const graphRefAll: RuleDef<'graphRefAll', GraphReference> = {
  name: 'graphRefAll',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR<GraphReference>([
    { ALT: () => {
      const name = SUBRULE(graphRef);
      return { type: 'graph', name };
    } },
    { ALT: () => {
      CONSUME(l.graph.default_);
      return { type: 'graph', default: true };
    } },
    { ALT: () => {
      CONSUME(l.graph.named);
      return { type: 'graph', named: true };
    } },
    { ALT: () => {
      CONSUME(l.graph.graphAll);
      return { type: 'graph', all: true };
    } },
  ]),
};

/**
 * [[48]](https://www.w3.org/TR/sparql11-query/#rQuadPattern)
 */
export const quadPattern: RuleDef<'quadPattern', Quads[]> = {
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
export const quadData: RuleDef<'quadData', Quads[]> = {
  name: 'quadData',
  impl: quadPattern.impl,
};

/**
 * [[50]](https://www.w3.org/TR/sparql11-query/#rQuads)
 */
export const quads: RuleDef<'quads', Quads[]> = {
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
export const quadsNotTriples: RuleDef<'quadsNotTriples', GraphQuads> = {
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
