import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { iri, prologue, triplesTemplate, varOrIri } from './general';
import { groupGraphPattern } from './whereClause';

/**
 * [[3]](https://www.w3.org/TR/sparql11-query/#rUpdateUnit)
 */
export const updateUnit: RuleDef & { name: 'updateUnit' } = {
  name: 'updateUnit',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(update);
  },
};

/**
 * [[29]](https://www.w3.org/TR/sparql11-query/#rUpdate)
 */
export const update: RuleDef & { name: 'update' } = {
  name: 'update',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(prologue);
    OPTION1(() => {
      SUBRULE(update1);
      OPTION2(() => {
        CONSUME(l.symbols.semi);
        SUBRULE(update);
      });
    });
  },
};

/**
 * [[30]](https://www.w3.org/TR/sparql11-query/#rUpdate1)
 */
export const update1: RuleDef & { name: 'update1' } = {
  name: 'update1',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
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
    ]);
  },
};

/**
 * [[31]](https://www.w3.org/TR/sparql11-query/#rLoad)
 */
export const load: RuleDef & { name: 'load' } = {
  name: 'load',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    CONSUME(l.load);
    OPTION1(() => CONSUME(l.silent));
    SUBRULE(iri);
    OPTION2(() => {
      CONSUME(l.loadInto);
      SUBRULE(graphRef);
    });
  },
};

/**
 * [[32]](https://www.w3.org/TR/sparql11-query/#rClear)
 */
export const clear: RuleDef & { name: 'clear' } = {
  name: 'clear',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.clear);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRefAll);
  },
};

/**
 * [[33]](https://www.w3.org/TR/sparql11-query/#rDrop)
 */
export const drop: RuleDef & { name: 'drop' } = {
  name: 'drop',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.drop);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRefAll);
  },
};

/**
 * [[34]](https://www.w3.org/TR/sparql11-query/#rCreate)
 */
export const create: RuleDef & { name: 'create' } = {
  name: 'create',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.create);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRef);
  },
};

/**
 * [[35]](https://www.w3.org/TR/sparql11-query/#rAdd)
 */
export const add: RuleDef & { name: 'add' } = {
  name: 'add',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.add);
    OPTION(() => CONSUME(l.silent));
    SUBRULE1(graphOrDefault);
    CONSUME(l.to);
    SUBRULE2(graphOrDefault);
  },
};

/**
 * [[36]](https://www.w3.org/TR/sparql11-query/#rMove)
 */
export const move: RuleDef & { name: 'move' } = {
  name: 'move',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.move);
    OPTION(() => CONSUME(l.silent));
    SUBRULE1(graphOrDefault);
    CONSUME(l.to);
    SUBRULE2(graphOrDefault);
  },
};

/**
 * [[37]](https://www.w3.org/TR/sparql11-query/#rCopy)
 */
export const copy: RuleDef & { name: 'copy' } = {
  name: 'copy',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.copy);
    OPTION(() => CONSUME(l.silent));
    SUBRULE1(graphOrDefault);
    CONSUME(l.to);
    SUBRULE2(graphOrDefault);
  },
};

/**
 * [[38]](https://www.w3.org/TR/sparql11-query/#rInsertData)
 */
export const insertData: RuleDef & { name: 'insertData' } = {
  name: 'insertData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertData);
    SUBRULE(quadData);
  },
};

/**
 * [[39]](https://www.w3.org/TR/sparql11-query/#rDeleteData)
 */
export const deleteData: RuleDef & { name: 'deleteData' } = {
  name: 'deleteData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteData);
    SUBRULE(quadData);
  },
};

/**
 * [[40]](https://www.w3.org/TR/sparql11-query/#rDeleteWhere)
 */
export const deleteWhere: RuleDef & { name: 'deleteWhere' } = {
  name: 'deleteWhere',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteWhere);
    SUBRULE(quadPattern);
  },
};

/**
 * [[41]](https://www.w3.org/TR/sparql11-query/#rModify)
 */
export const modify: RuleDef & { name: 'modify' } = {
  name: 'modify',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OR }) => () => {
    OPTION1(() => {
      CONSUME(l.modifyWith);
      SUBRULE(iri);
    });
    OR([
      { ALT: () => {
        SUBRULE(deleteClause);
        OPTION2(() => SUBRULE1(insertClause));
      } },
      { ALT: () => SUBRULE2(insertClause) },
    ]);
    MANY(() => SUBRULE(usingClause));
    CONSUME(l.where);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[42]](https://www.w3.org/TR/sparql11-query/#rDeleteClause)
 */
export const deleteClause: RuleDef & { name: 'deleteClause' } = {
  name: 'deleteClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteClause);
    SUBRULE(quadPattern);
  },
};

/**
 * [[43]](https://www.w3.org/TR/sparql11-query/#rInsertClause)
 */
export const insertClause: RuleDef & { name: 'insertClause' } = {
  name: 'insertClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertClause);
    SUBRULE(quadPattern);
  },
};

/**
 * [[44]](https://www.w3.org/TR/sparql11-query/#rUsingClause)
 */
export const usingClause: RuleDef & { name: 'usingClause' } = {
  name: 'usingClause',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR }) => () => {
    CONSUME(l.usingClause);
    OR([
      { ALT: () => SUBRULE1(iri) },
      {
        ALT: () => {
          CONSUME(l.graph.named);
          SUBRULE2(iri);
        },
      },
    ]);
  },
};

/**
 * [[45]](https://www.w3.org/TR/sparql11-query/#rGraphOrDefault)
 */
export const graphOrDefault: RuleDef & { name: 'graphOrDefault' } = {
  name: 'graphOrDefault',
  impl: ({ SUBRULE, CONSUME, OPTION, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.graph.default_) },
      {
        ALT: () => {
          OPTION(() => CONSUME(l.graph.graph));
          SUBRULE(iri);
        },
      },
    ]);
  },
};

/**
 * [[46]](https://www.w3.org/TR/sparql11-query/#rGraphRef)
 */
export const graphRef: RuleDef & { name: 'graphRef' } = {
  name: 'graphRef',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(iri);
  },
};

/**
 * [[47]](https://www.w3.org/TR/sparql11-query/#rGraphRefAll)
 */
export const graphRefAll: RuleDef & { name: 'graphRefAll' } = {
  name: 'graphRefAll',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(graphRef) },
      { ALT: () => CONSUME(l.graph.default_) },
      { ALT: () => CONSUME(l.graph.named) },
      { ALT: () => CONSUME(l.graph.graphAll) },
    ]);
  },
};

/**
 * [[48]](https://www.w3.org/TR/sparql11-query/#rQuadPattern)
 */
export const quadPattern: RuleDef & { name: 'quadPattern' } = {
  name: 'quadPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
  },
};

/**
 * [[49]](https://www.w3.org/TR/sparql11-query/#rQuadData)
 */
export const quadData: RuleDef & { name: 'quadData' } = {
  name: 'quadData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
  },
};

/**
 * [[50]](https://www.w3.org/TR/sparql11-query/#rQuads)
 */
export const quads: RuleDef & { name: 'quads' } = {
  name: 'quads',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OPTION3 }) => () => {
    OPTION1(() => {
      SUBRULE1(triplesTemplate);
    });
    MANY(() => {
      SUBRULE(quadsNotTriples);
      OPTION2(() => {
        CONSUME(l.symbols.dot);
      });
      OPTION3(() => {
        SUBRULE2(triplesTemplate);
      });
    });
  },
};

/**
 * [[51]](https://www.w3.org/TR/sparql11-query/#rQuadsNotTriples)
 */
export const quadsNotTriples: RuleDef & { name: 'quadsNotTriples' } = {
  name: 'quadsNotTriples',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(varOrIri);
    CONSUME(l.symbols.LCurly);
    OPTION(() => {
      SUBRULE(triplesTemplate);
    });
    CONSUME(l.symbols.RCurly);
  },
};
