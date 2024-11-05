import type { TokenType } from 'chevrotain';
import * as l from '../lexer';
import { allTokens, ChevSparqlLexer } from '../lexer';
import { Builder } from './buildExample';
import type { RuleDef } from './buildExample';

function unCapitalize<T extends string>(str: T): Uncapitalize<T> {
  return <Uncapitalize<T>> (str.charAt(0).toLowerCase() + str.slice(1));
}

function exprFunc1<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      SUBRULE(expression);
      CONSUME(l.symbols.RParen);
    },
  };
}
function exprFunc2<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE1, SUBRULE2, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      SUBRULE1(expression);
      CONSUME(l.symbols.comma);
      SUBRULE2(expression);
      CONSUME(l.symbols.RParen);
    },
  };
}
function varFunc1<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      SUBRULE(var_);
      CONSUME(l.symbols.RParen);
    },
  };
}
function exprOrNilFunc1<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, OR, SUBRULE }) => () => {
      CONSUME(func);
      OR([
        { ALT: () => {
          CONSUME(l.symbols.LParen);
          SUBRULE(expression);
          CONSUME(l.symbols.RParen);
        } },
        { ALT: () => CONSUME(l.terminals.nil) },
      ]);
    },
  };
}
function nilFunc1<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.terminals.nil);
    },
  };
}
function exprListFunc1<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE }) => () => {
      CONSUME(func);
      SUBRULE(expressionList);
    },
  };
}
function baseAggregateFunc<T extends string>(func: TokenType & { name: T }): RuleDef & { name: Uncapitalize<T> } {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE, OPTION, OR }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      OPTION(() => {
        CONSUME(l.distinct);
      });
      OR([
        { ALT: () => CONSUME(l.symbols.star) },
        { ALT: () => SUBRULE(expression) },
      ]);
      CONSUME(l.symbols.RParen);
    },
  };
}

export const queryUnit: RuleDef & { name: 'queryUnit' } = {
  name: 'queryUnit',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(query);
  },
};

export const query: RuleDef & { name: 'query' } = {
  name: 'query',
  impl: ({ SUBRULE, OR }) => () => {
    SUBRULE(prologue);
    OR([
      { ALT: () => SUBRULE(selectQuery) },
      { ALT: () => SUBRULE(constructQuery) },
      { ALT: () => SUBRULE(describeQuery) },
      { ALT: () => SUBRULE(askQuery) },
    ]);
    SUBRULE(valuesClause);
  },
};

export const updateUnit: RuleDef & { name: 'updateUnit' } = {
  name: 'updateUnit',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(update);
  },
};

export const prologue: RuleDef & { name: 'prologue' } = {
  name: 'prologue',
  impl: ({ SUBRULE, MANY, OR }) => () => {
    MANY(() => {
      OR([
        { ALT: () => SUBRULE(baseDecl) },
        { ALT: () => SUBRULE(prefixDecl) },
      ]);
    });
  },
};

export const baseDecl: RuleDef & { name: 'baseDecl' } = {
  name: 'baseDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.baseDecl);
    CONSUME(l.terminals.iriRef);
  },
};

export const prefixDecl: RuleDef & { name: 'prefixDecl' } = {
  name: 'prefixDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.prefixDecl);
    CONSUME(l.terminals.pNameNs);
    CONSUME(l.terminals.iriRef);
  },
};

export const selectQuery: RuleDef & { name: 'selectQuery' } = {
  name: 'selectQuery',
  impl: ({ SUBRULE, MANY }) => () => {
    SUBRULE(selectClause);
    MANY(() => SUBRULE(datasetClause));
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
  },
};

export const subSelect: RuleDef & { name: 'subSelect' } = {
  name: 'subSelect',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(selectClause);
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
    SUBRULE(valuesClause);
  },
};

export const selectClause: RuleDef & { name: 'selectClause' } = {
  name: 'selectClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR1, OR2, OR3 }) => () => {
    CONSUME(l.select);
    OPTION(() => {
      OR1([
        { ALT: () => CONSUME(l.distinct) },
        { ALT: () => CONSUME(l.reduced) },
      ]);
    });
    OR2([
      { ALT: () => CONSUME(l.symbols.star) },
      { ALT: () => {
        AT_LEAST_ONE(() => {
          OR3([
            { ALT: () => SUBRULE1(var_) },
            { ALT: () => {
              CONSUME(l.symbols.LParen);
              SUBRULE(expression);
              CONSUME(l.as);
              SUBRULE2(var_);
              CONSUME(l.symbols.RParen);
            } },
          ]);
        });
      } },
    ]);
  },
};

export const constructQuery: RuleDef & { name: 'constructQuery' } = {
  name: 'constructQuery',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, MANY1, MANY2, OPTION, OR }) => () => {
    CONSUME(l.construct);
    OR([
      { ALT: () => {
        SUBRULE(constructTemplate);
        MANY1(() => {
          SUBRULE1(datasetClause);
        });
        SUBRULE(whereClause);
        SUBRULE1(solutionModifier);
      } },
      { ALT: () => {
        MANY2(() => {
          SUBRULE2(datasetClause);
        });
        CONSUME(l.where);
        CONSUME(l.symbols.LCurly);
        OPTION(() => {
          SUBRULE(triplesTemplate);
        });
        CONSUME(l.symbols.RCurly);
        SUBRULE2(solutionModifier);
      } },
    ]);
  },
};

export const describeQuery: RuleDef & { name: 'describeQuery' } = {
  name: 'describeQuery',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME, MANY, OPTION, OR }) => () => {
    CONSUME(l.describe);
    OR([
      { ALT: () => AT_LEAST_ONE(() => SUBRULE(varOrIri)) },
      { ALT: () => CONSUME(l.symbols.star) },
    ]);
    MANY(() => {
      SUBRULE(datasetClause);
    });
    OPTION(() => {
      SUBRULE(whereClause);
    });
    SUBRULE(solutionModifier);
  },
};

export const askQuery: RuleDef & { name: 'askQuery' } = {
  name: 'askQuery',
  impl: ({ SUBRULE, CONSUME, MANY }) => () => {
    CONSUME(l.ask);
    MANY(() => {
      SUBRULE(datasetClause);
    });
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
  },
};

export const datasetClause: RuleDef & { name: 'datasetClause' } = {
  name: 'datasetClause',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.from);
    OR([
      { ALT: () => SUBRULE(defaultGraphClause) },
      { ALT: () => SUBRULE(namedGraphClause) },
    ]);
  },
};

export const defaultGraphClause: RuleDef & { name: 'defaultGraphClause' } = {
  name: 'defaultGraphClause',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(sourceSelector);
  },
};

export const namedGraphClause: RuleDef & { name: 'namedGraphClause' } = {
  name: 'namedGraphClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.named);
    SUBRULE(sourceSelector);
  },
};

export const sourceSelector: RuleDef & { name: 'sourceSelector' } = {
  name: 'sourceSelector',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
  },
};

export const whereClause: RuleDef & { name: 'whereClause' } = {
  name: 'whereClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.where);
    });
    SUBRULE(groupGraphPattern);
  },
};

export const solutionModifier: RuleDef & { name: 'solutionModifier' } = {
  name: 'solutionModifier',
  impl: ({ SUBRULE, OPTION1, OPTION2, OPTION3, OPTION4 }) => () => {
    OPTION1(() => {
      SUBRULE(groupClause);
    });
    OPTION2(() => {
      SUBRULE(havingClause);
    });
    OPTION3(() => {
      SUBRULE(orderClause);
    });
    OPTION4(() => {
      SUBRULE(limitOffsetClauses);
    });
  },
};

export const groupClause: RuleDef & { name: 'groupClause' } = {
  name: 'groupClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.groupBy);
    AT_LEAST_ONE(() => {
      SUBRULE(groupCondition);
    });
  },
};

export const groupCondition: RuleDef & { name: 'groupCondition' } = {
  name: 'groupCondition',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(builtInCall) },
      { ALT: () => SUBRULE(functionCall) },
      { ALT: () => {
        CONSUME(l.symbols.LParen);
        SUBRULE(expression);
        OPTION(() => {
          CONSUME(l.as);
          SUBRULE1(var_);
        });
        CONSUME(l.symbols.RParen);
      } },
      { ALT: () => SUBRULE2(var_) },
    ]);
  },
};

export const havingClause: RuleDef & { name: 'havingClause' } = {
  name: 'havingClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.having);
    AT_LEAST_ONE(() => {
      SUBRULE(havingCondition);
    });
  },
};

export const havingCondition: RuleDef & { name: 'havingCondition' } = {
  name: 'havingCondition',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(constraint);
  },
};

export const orderClause: RuleDef & { name: 'orderClause' } = {
  name: 'orderClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.order);
    AT_LEAST_ONE(() => {
      SUBRULE(orderCondition);
    });
  },
};

export const orderCondition: RuleDef & { name: 'orderCondition' } = {
  name: 'orderCondition',
  impl: ({ SUBRULE, CONSUME, OR1, OR2 }) => () => {
    OR1([
      { ALT: () => {
        OR2([
          { ALT: () => CONSUME(l.orderAsc) },
          { ALT: () => CONSUME(l.orderDesc) },
        ]);
        SUBRULE(brackettedExpression);
      } },
      { ALT: () => SUBRULE(constraint) },
      { ALT: () => SUBRULE(var_) },
    ]);
  },
};

export const limitOffsetClauses: RuleDef & { name: 'limitOffsetClauses' } = {
  name: 'limitOffsetClauses',
  impl: ({ SUBRULE1, SUBRULE2, OPTION1, OPTION2, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE1(limitClause);
        OPTION1(() => {
          SUBRULE1(offsetClause);
        });
      } },
      { ALT: () => {
        SUBRULE2(offsetClause);
        OPTION2(() => {
          SUBRULE2(limitClause);
        });
      } },
    ]);
  },
};

export const limitClause: RuleDef & { name: 'limitClause' } = {
  name: 'limitClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.limit);
    SUBRULE(integer);
  },
};

export const offsetClause: RuleDef & { name: 'offsetClause' } = {
  name: 'offsetClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.offset);
    SUBRULE(integer);
  },
};

export const valuesClause: RuleDef & { name: 'valuesClause' } = {
  name: 'valuesClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.values);
      SUBRULE(dataBlock);
    });
  },
};

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

export const clear: RuleDef & { name: 'clear' } = {
  name: 'clear',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.clear);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRefAll);
  },
};

export const drop: RuleDef & { name: 'drop' } = {
  name: 'drop',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.drop);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRefAll);
  },
};

export const create: RuleDef & { name: 'create' } = {
  name: 'create',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.create);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRef);
  },
};

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

export const insertData: RuleDef & { name: 'insertData' } = {
  name: 'insertData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertData);
    SUBRULE(quadData);
  },
};

export const deleteData: RuleDef & { name: 'deleteData' } = {
  name: 'deleteData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteData);
    SUBRULE(quadData);
  },
};

export const deleteWhere: RuleDef & { name: 'deleteWhere' } = {
  name: 'deleteWhere',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteWhere);
    SUBRULE(quadPattern);
  },
};

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

export const deleteClause: RuleDef & { name: 'deleteClause' } = {
  name: 'deleteClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteClause);
    SUBRULE(quadPattern);
  },
};

export const insertClause: RuleDef & { name: 'insertClause' } = {
  name: 'insertClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertClause);
    SUBRULE(quadPattern);
  },
};

export const usingClause: RuleDef & { name: 'usingClause' } = {
  name: 'usingClause',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR }) => () => {
    CONSUME(l.usingClause);
    OR([
      { ALT: () => SUBRULE1(iri) },
      { ALT: () => {
        CONSUME(l.graph.named);
        SUBRULE2(iri);
      } },
    ]);
  },
};

export const graphOrDefault: RuleDef & { name: 'graphOrDefault' } = {
  name: 'graphOrDefault',
  impl: ({ SUBRULE, CONSUME, OPTION, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.graph.default_) },
      { ALT: () => {
        OPTION(() => CONSUME(l.graph.graph));
        SUBRULE(iri);
      } },
    ]);
  },
};

export const graphRef: RuleDef & { name: 'graphRef' } = {
  name: 'graphRef',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(iri);
  },
};

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

export const quadPattern: RuleDef & { name: 'quadPattern' } = {
  name: 'quadPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
  },
};

export const quadData: RuleDef & { name: 'quadData' } = {
  name: 'quadData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
  },
};

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

export const triplesTemplate: RuleDef & { name: 'triplesTemplate' } = {
  name: 'triplesTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubject);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(triplesTemplate);
      });
    });
  },
};

export const groupGraphPattern: RuleDef & { name: 'groupGraphPattern' } = {
  name: 'groupGraphPattern',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.symbols.LCurly);
    OR([
      { ALT: () => SUBRULE(subSelect) },
      { ALT: () => SUBRULE(groupGraphPatternSub) },
    ]);
    CONSUME(l.symbols.RCurly);
  },
};

export const groupGraphPatternSub: RuleDef & { name: 'groupGraphPatternSub' } = {
  name: 'groupGraphPatternSub',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION1, OPTION2, OPTION3 }) => () => {
    OPTION1(() => {
      SUBRULE1(triplesBlock);
    });
    MANY(() => {
      SUBRULE(graphPatternNotTriples);
      OPTION2(() => {
        CONSUME(l.symbols.dot);
      });
      OPTION3(() => {
        SUBRULE2(triplesBlock);
      });
    });
  },
};

export const triplesBlock: RuleDef & { name: 'triplesBlock' } = {
  name: 'triplesBlock',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubjectPath);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(triplesBlock);
      });
    });
  },
};

export const graphPatternNotTriples: RuleDef & { name: 'graphPatternNotTriples' } = {
  name: 'graphPatternNotTriples',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(groupOrUnionGraphPattern) },
      { ALT: () => SUBRULE(optionalGraphPattern) },
      { ALT: () => SUBRULE(minusGraphPattern) },
      { ALT: () => SUBRULE(graphGraphPattern) },
      { ALT: () => SUBRULE(serviceGraphPattern) },
      { ALT: () => SUBRULE(filter) },
      { ALT: () => SUBRULE(bind) },
      { ALT: () => SUBRULE(inlineData) },
    ]);
  },
};

export const optionalGraphPattern: RuleDef & { name: 'optionalGraphPattern' } = {
  name: 'optionalGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.optional);
    SUBRULE(groupGraphPattern);
  },
};

export const graphGraphPattern: RuleDef & { name: 'graphGraphPattern' } = {
  name: 'graphGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(varOrIri);
    SUBRULE(groupGraphPattern);
  },
};

export const serviceGraphPattern: RuleDef & { name: 'serviceGraphPattern' } = {
  name: 'serviceGraphPattern',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.service);
    OPTION(() => {
      CONSUME(l.silent);
    });
    SUBRULE(varOrIri);
    SUBRULE(groupGraphPattern);
  },
};

export const bind: RuleDef & { name: 'bind' } = {
  name: 'bind',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.bind);
    CONSUME(l.symbols.LParen);
    SUBRULE(expression);
    CONSUME(l.as);
    SUBRULE(var_);
    CONSUME(l.symbols.RParen);
  },
};

export const inlineData: RuleDef & { name: 'inlineData' } = {
  name: 'inlineData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.values);
    SUBRULE(dataBlock);
  },
};

export const dataBlock: RuleDef & { name: 'dataBlock' } = {
  name: 'dataBlock',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE(inlineDataOneVar);
      } },
      { ALT: () => {
        SUBRULE(inlineDataFull);
      } },
    ]);
  },
};

export const inlineDataOneVar: RuleDef & { name: 'inlineDataOneVar' } = {
  name: 'inlineDataOneVar',
  impl: ({ SUBRULE, CONSUME, MANY }) => () => {
    SUBRULE(var_);
    CONSUME(l.symbols.LCurly);
    MANY(() => {
      SUBRULE(dataBlockValue);
    });
    CONSUME(l.symbols.RCurly);
  },
};

export const inlineDataFull: RuleDef & { name: 'inlineDataFull' } = {
  name: 'inlineDataFull',
  impl: ({ SUBRULE, CONSUME, MANY1, MANY2, OR1, OR2, CONSUME1, MANY3, CONSUME2 }) => () => {
    OR1([
      { ALT: () => {
        CONSUME1(l.terminals.nil);
      } },
      { ALT: () => {
        CONSUME1(l.symbols.LParen);
        MANY1(() => {
          SUBRULE(var_);
        });
        CONSUME1(l.symbols.RParen);
      } },
    ]);
    CONSUME(l.symbols.LCurly);
    MANY2(() => {
      OR2([
        { ALT: () => {
          CONSUME2(l.symbols.LParen);
          MANY3(() => {
            SUBRULE(dataBlockValue);
          });
          CONSUME2(l.symbols.RParen);
        } },
        { ALT: () => {
          CONSUME2(l.terminals.nil);
        } },
      ]);
    });
    CONSUME(l.symbols.RCurly);
  },
};

export const dataBlockValue: RuleDef & { name: 'dataBlockValue' } = {
  name: 'dataBlockValue',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE(iri);
      } },
      { ALT: () => {
        SUBRULE(rdfLiteral);
      } },
      { ALT: () => {
        SUBRULE(numericLiteral);
      } },
      { ALT: () => {
        SUBRULE(booleanLiteral);
      } },
      { ALT: () => {
        CONSUME(l.undef);
      } },
    ]);
  },
};

export const minusGraphPattern: RuleDef & { name: 'minusGraphPattern' } = {
  name: 'minusGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.minus);
    SUBRULE(groupGraphPattern);
  },
};

export const groupOrUnionGraphPattern: RuleDef & { name: 'groupOrUnionGraphPattern' } = {
  name: 'groupOrUnionGraphPattern',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(groupGraphPattern);
    MANY(() => {
      CONSUME(l.union);
      SUBRULE2(groupGraphPattern);
    });
  },
};

export const filter: RuleDef & { name: 'filter' } = {
  name: 'filter',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.filter);
    SUBRULE(constraint);
  },
};

export const constraint: RuleDef & { name: 'constraint' } = {
  name: 'constraint',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(brackettedExpression) },
      { ALT: () => SUBRULE(builtInCall) },
      { ALT: () => SUBRULE(functionCall) },
    ]);
  },
};

export const functionCall: RuleDef & { name: 'functionCall' } = {
  name: 'functionCall',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
    SUBRULE(argList);
  },
};

export const argList: RuleDef & { name: 'argList' } = {
  name: 'argList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.nil) },
      { ALT: () => {
        CONSUME(l.symbols.LParen);
        OPTION(() => {
          CONSUME(l.distinct);
        });
        SUBRULE1(expression);
        MANY(() => {
          CONSUME(l.symbols.comma);
          SUBRULE2(expression);
        });
        CONSUME(l.symbols.RParen);
      } },
    ]);
  },
};

export const expressionList: RuleDef & { name: 'expressionList' } = {
  name: 'expressionList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.nil) },
      { ALT: () => {
        CONSUME(l.symbols.LParen);
        SUBRULE1(expression);
        MANY(() => {
          CONSUME(l.symbols.comma);
          SUBRULE2(expression);
        });
        CONSUME(l.symbols.RParen);
      } },
    ]);
  },
};

export const constructTemplate: RuleDef & { name: 'constructTemplate' } = {
  name: 'constructTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.symbols.LCurly);
    OPTION(() => {
      SUBRULE(constructTriples);
    });
    CONSUME(l.symbols.RCurly);
  },
};

export const constructTriples: RuleDef & { name: 'constructTriples' } = {
  name: 'constructTriples',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubject);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(constructTriples);
      });
    });
  },
};

export const triplesSameSubject: RuleDef & { name: 'triplesSameSubject' } = {
  name: 'triplesSameSubject',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE(varOrTerm);
        SUBRULE(propertyListNotEmpty);
      } },
      { ALT: () => {
        SUBRULE(triplesNode);
        SUBRULE(propertyList);
      } },
    ]);
  },
};

export const propertyList: RuleDef & { name: 'propertyList' } = {
  name: 'propertyList',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListNotEmpty);
    });
  },
};

export const propertyListNotEmpty: RuleDef & { name: 'propertyListNotEmpty' } = {
  name: 'propertyListNotEmpty',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION }) => () => {
    SUBRULE1(verb);
    SUBRULE1(objectList);
    MANY(() => {
      CONSUME(l.symbols.semi);
      OPTION(() => {
        SUBRULE2(verb);
        SUBRULE2(objectList);
      });
    });
  },
};

export const verb: RuleDef & { name: 'verb' } = {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrIri) },
      { ALT: () => CONSUME(l.a) },
    ]);
  },
};

export const objectList: RuleDef & { name: 'objectList' } = {
  name: 'objectList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(object);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(object);
    });
  },
};

export const object: RuleDef & { name: 'object' } = {
  name: 'object',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNode);
  },
};

export const triplesSameSubjectPath: RuleDef & { name: 'triplesSameSubjectPath' } = {
  name: 'triplesSameSubjectPath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE(varOrTerm);
        SUBRULE(propertyListPathNotEmpty);
      } },
      { ALT: () => {
        SUBRULE(triplesNodePath);
        SUBRULE(propertyListPath);
      } },
    ]);
  },
};

export const propertyListPath: RuleDef & { name: 'propertyListPath' } = {
  name: 'propertyListPath',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListPathNotEmpty);
    });
  },
};

export const propertyListPathNotEmpty: RuleDef & { name: 'propertyListPathNotEmpty' } = {
  name: 'propertyListPathNotEmpty',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR1, OR2 }) => () => {
    OR1([
      { ALT: () => {
        SUBRULE1(verbPath);
      } },
      { ALT: () => {
        SUBRULE1(verbSimple);
      } },
    ]);
    SUBRULE(objectListPath);
    MANY(() => {
      CONSUME(l.symbols.semi);
      OPTION(() => {
        OR2([
          { ALT: () => SUBRULE2(verbPath) },
          { ALT: () => SUBRULE2(verbSimple) },
        ]);
        SUBRULE(objectList);
      });
    });
  },
};

export const verbPath: RuleDef & { name: 'verbPath' } = {
  name: 'verbPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(path);
  },
};

export const verbSimple: RuleDef & { name: 'verbSimple' } = {
  name: 'verbSimple',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(var_);
  },
};

export const objectListPath: RuleDef & { name: 'objectListPath' } = {
  name: 'objectListPath',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(objectPath);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(objectPath);
    });
  },
};

export const objectPath: RuleDef & { name: 'objectPath' } = {
  name: 'objectPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNodePath);
  },
};

export const path: RuleDef & { name: 'path' } = {
  name: 'path',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(pathAlternative);
  },
};

export const pathAlternative: RuleDef & { name: 'pathAlternative' } = {
  name: 'pathAlternative',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(pathSequence);
    MANY(() => {
      CONSUME(l.symbols.pipe);
      SUBRULE2(pathSequence);
    });
  },
};

export const pathSequence: RuleDef & { name: 'pathSequence' } = {
  name: 'pathSequence',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(pathEltOrInverse);
    MANY(() => {
      CONSUME(l.symbols.slash);
      SUBRULE2(pathEltOrInverse);
    });
  },
};

export const pathElt: RuleDef & { name: 'pathElt' } = {
  name: 'pathElt',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(pathPrimary);
    OPTION(() => {
      SUBRULE(pathMod);
    });
  },
};

export const pathEltOrInverse: RuleDef & { name: 'pathEltOrInverse' } = {
  name: 'pathEltOrInverse',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE1(pathElt);
      } },
      { ALT: () => {
        CONSUME(l.symbols.hat);
        SUBRULE2(pathElt);
      } },
    ]);
  },
};

export const pathMod: RuleDef & { name: 'pathMod' } = {
  name: 'pathMod',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.symbols.question) },
      { ALT: () => CONSUME(l.symbols.star) },
      { ALT: () => CONSUME(l.symbols.plus) },
    ]);
  },
};

export const pathPrimary: RuleDef & { name: 'pathPrimary' } = {
  name: 'pathPrimary',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(iri) },
      { ALT: () => CONSUME(l.a) },
      { ALT: () => {
        CONSUME(l.symbols.exclamation);
        SUBRULE(pathNegatedPropertySet);
      } },
      { ALT: () => {
        CONSUME(l.symbols.LParen);
        SUBRULE(path);
        CONSUME(l.symbols.RParen);
      } },
    ]);
  },
};

export const pathNegatedPropertySet: RuleDef & { name: 'pathNegatedPropertySet' } = {
  name: 'pathNegatedPropertySet',
  impl: ({ SUBRULE3, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE1(pathOneInPropertySet);
      } },
      { ALT: () => {
        CONSUME(l.symbols.LParen);
        OPTION(() => {
          SUBRULE2(pathOneInPropertySet);
          MANY(() => {
            CONSUME(l.symbols.pipe);
            SUBRULE3(pathOneInPropertySet);
          });
        });
        CONSUME(l.symbols.RParen);
      } },
    ]);
  },
};

export const pathOneInPropertySet: RuleDef & { name: 'pathOneInPropertySet' } = {
  name: 'pathOneInPropertySet',
  impl: ({ CONSUME1, CONSUME2, CONSUME, SUBRULE1, SUBRULE2, OR1, OR2 }) => () => {
    OR1([
      { ALT: () => SUBRULE1(iri) },
      { ALT: () => CONSUME1(l.a) },
      { ALT: () => {
        CONSUME(l.symbols.hat);
        OR2([
          { ALT: () => SUBRULE2(iri) },
          { ALT: () => CONSUME2(l.a) },
        ]);
      } },
    ]);
  },
};

export const integer: RuleDef & { name: 'integer' } = {
  name: 'integer',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.terminals.integer);
  },
};

export const triplesNode: RuleDef & { name: 'triplesNode' } = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collection) },
      { ALT: () => SUBRULE(blankNodePropertyList) },
    ]);
  },
};

export const blankNodePropertyList: RuleDef & { name: 'blankNodePropertyList' } = {
  name: 'blankNodePropertyList',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

export const triplesNodePath: RuleDef & { name: 'triplesNodePath' } = {
  name: 'triplesNodePath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collectionPath) },
      { ALT: () => SUBRULE(blankNodePropertyListPath) },
    ]);
  },
};

export const blankNodePropertyListPath: RuleDef & { name: 'blankNodePropertyListPath' } = {
  name: 'blankNodePropertyListPath',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListPathNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

export const collection: RuleDef & { name: 'collection' } = {
  name: 'collection',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNode);
    });
    CONSUME(l.symbols.RParen);
  },
};

export const collectionPath: RuleDef & { name: 'collectionPath' } = {
  name: 'collectionPath',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNodePath);
    });
    CONSUME(l.symbols.RParen);
  },
};

export const graphNode: RuleDef & { name: 'graphNode' } = {
  name: 'graphNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNode) },
    ]);
  },
};

export const graphNodePath: RuleDef & { name: 'graphNodePath' } = {
  name: 'graphNodePath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNodePath) },
    ]);
  },
};

export const varOrTerm: RuleDef & { name: 'varOrTerm' } = {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(var_) },
      { ALT: () => SUBRULE(graphTerm) },
    ]);
  },
};

export const varOrIri: RuleDef & { name: 'varOrIri' } = {
  name: 'varOrIri',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(var_) },
      { ALT: () => SUBRULE(iri) },
    ]);
  },
};

export const var_: RuleDef & { name: 'var' } = {
  name: 'var',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.var1) },
      { ALT: () => CONSUME(l.terminals.var2) },
    ]);
  },
};

export const graphTerm: RuleDef & { name: 'graphTerm' } = {
  name: 'graphTerm',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(iri) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(numericLiteral) },
      { ALT: () => SUBRULE(booleanLiteral) },
      { ALT: () => SUBRULE(blankNode) },
      { ALT: () => CONSUME(l.terminals.nil) },
    ]);
  },
};

export const expression: RuleDef & { name: 'expression' } = {
  name: 'expression',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(conditionalOrExpression);
  },
};

export const conditionalOrExpression: RuleDef & { name: 'conditionalOrExpression' } = {
  name: 'conditionalOrExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(conditionalAndExpression);
    MANY(() => {
      CONSUME(l.symbols.logicOr);
      SUBRULE2(conditionalAndExpression);
    });
  },
};

export const conditionalAndExpression: RuleDef & { name: 'conditionalAndExpression' } = {
  name: 'conditionalAndExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(valueLogical);
    MANY(() => {
      CONSUME(l.symbols.logicAnd);
      SUBRULE2(valueLogical);
    });
  },
};

export const valueLogical: RuleDef & { name: 'valueLogical' } = {
  name: 'valueLogical',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(relationalExpression);
  },
};

export const relationalExpression: RuleDef & { name: 'relationalExpression' } = {
  name: 'relationalExpression',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION, OR, SUBRULE3, SUBRULE4, SUBRULE5, SUBRULE6, SUBRULE7 }) => () => {
    SUBRULE1(numericExpression);
    OPTION(() => {
      OR([
        { ALT: () => {
          CONSUME(l.symbols.equal);
          SUBRULE2(numericExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.notEqual);
          SUBRULE3(numericExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.lessThan);
          SUBRULE4(numericExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.greaterThan);
          SUBRULE5(numericExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.lessThanEqual);
          SUBRULE6(numericExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.greaterThanEqual);
          SUBRULE7(numericExpression);
        } },
        { ALT: () => {
          CONSUME(l.in_);
          SUBRULE1(expressionList);
        } },
        { ALT: () => {
          CONSUME(l.notIn);
          SUBRULE2(expressionList);
        } },
      ]);
    });
  },
};

export const numericExpression: RuleDef & { name: 'numericExpression' } = {
  name: 'numericExpression',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(additiveExpression);
  },
};

export const additiveExpression: RuleDef & { name: 'additiveExpression' } = {
  name: 'additiveExpression',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, MANY1, MANY2, OR1, OR2, OR3 }) => () => {
    SUBRULE1(multiplicativeExpression);
    MANY1(() => {
      OR1([
        { ALT: () => {
          CONSUME(l.symbols.plus);
          SUBRULE2(multiplicativeExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.minus_);
          SUBRULE3(multiplicativeExpression);
        } },
        { ALT: () => {
          OR2([
            { ALT: () => SUBRULE(numericLiteralPositive) },
            { ALT: () => SUBRULE(numericLiteralNegative) },
          ]);
          MANY2(() => {
            OR3([
              { ALT: () => {
                CONSUME(l.symbols.star);
                SUBRULE1(unaryExpression);
              } },
              { ALT: () => {
                CONSUME(l.symbols.slash);
                SUBRULE2(unaryExpression);
              } },
            ]);
          });
        } },
      ]);
    });
  },
};

export const multiplicativeExpression: RuleDef & { name: 'multiplicativeExpression' } = {
  name: 'multiplicativeExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, SUBRULE3, OR }) => () => {
    SUBRULE1(unaryExpression);
    MANY(() => {
      OR([
        { ALT: () => {
          CONSUME(l.symbols.star);
          SUBRULE2(unaryExpression);
        } },
        { ALT: () => {
          CONSUME(l.symbols.slash);
          SUBRULE3(unaryExpression);
        } },
      ]);
    });
  },
};

export const unaryExpression: RuleDef & { name: 'unaryExpression' } = {
  name: 'unaryExpression',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, SUBRULE4, OR }) => () => {
    OR([
      { ALT: () => {
        CONSUME(l.symbols.exclamation);
        SUBRULE1(primaryExpression);
      } },
      { ALT: () => {
        CONSUME(l.symbols.plus);
        SUBRULE2(primaryExpression);
      } },
      { ALT: () => {
        CONSUME(l.symbols.minus_);
        SUBRULE3(primaryExpression);
      } },
      { ALT: () => SUBRULE4(primaryExpression) },
    ]);
  },
};

export const primaryExpression: RuleDef & { name: 'primaryExpression' } = {
  name: 'primaryExpression',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(brackettedExpression) },
      { ALT: () => SUBRULE(builtInCall) },
      { ALT: () => SUBRULE(iriOrFunction) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(numericLiteral) },
      { ALT: () => SUBRULE(booleanLiteral) },
      { ALT: () => SUBRULE(var_) },
    ]);
  },
};

export const brackettedExpression: RuleDef & { name: 'brackettedExpression' } = {
  name: 'brackettedExpression',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    SUBRULE(expression);
    CONSUME(l.symbols.RParen);
  },
};

export const builtInStr = exprFunc1(l.builtIn.str);
export const builtInLang = exprFunc1(l.builtIn.lang);
export const builtInLangmatches = exprFunc2(l.builtIn.langmatches);
export const builtInDatatype = exprFunc1(l.builtIn.datatype);
export const builtInBound = varFunc1(l.builtIn.bound);
export const builtInIri = exprFunc1(l.builtIn.iri);
export const builtInUri = exprFunc1(l.builtIn.uri);
export const builtInBnode = exprOrNilFunc1(l.builtIn.bnode);
export const builtInRand = nilFunc1(l.builtIn.rand);
export const builtInAbs = exprFunc1(l.builtIn.abs);
export const builtInCeil = exprFunc1(l.builtIn.ceil);
export const builtInFloor = exprFunc1(l.builtIn.floor);
export const builtInRound = exprFunc1(l.builtIn.round);
export const builtInConcat = exprListFunc1(l.builtIn.concat);
export const builtInStrlen = exprFunc1(l.builtIn.strlen);
export const builtInUcase = exprFunc1(l.builtIn.ucase);
export const builtInLcase = exprFunc1(l.builtIn.lcase);
export const builtInEncode_for_uri = exprFunc1(l.builtIn.encode_for_uri);
export const builtInContains = exprFunc2(l.builtIn.contains);
export const builtInStrstarts = exprFunc2(l.builtIn.strstarts);
export const builtInStrends = exprFunc2(l.builtIn.strends);
export const builtInStrbefore = exprFunc2(l.builtIn.strbefore);
export const builtInStrafter = exprFunc2(l.builtIn.strafter);
export const builtInYear = exprFunc1(l.builtIn.year);
export const builtInMonth = exprFunc1(l.builtIn.month);
export const builtInDay = exprFunc1(l.builtIn.day);
export const builtInHours = exprFunc1(l.builtIn.hours);
export const builtInMinutes = exprFunc1(l.builtIn.minutes);
export const builtInSeconds = exprFunc1(l.builtIn.seconds);
export const builtInTimezone = exprFunc1(l.builtIn.timezone);
export const builtInTz = exprFunc1(l.builtIn.tz);
export const builtInNow = nilFunc1(l.builtIn.now);
export const builtInUuid = nilFunc1(l.builtIn.uuid);
export const builtInStruuid = nilFunc1(l.builtIn.struuid);
export const builtInMd5 = exprFunc1(l.builtIn.md5);
export const builtInSha1 = exprFunc1(l.builtIn.sha1);
export const builtInSha256 = exprFunc1(l.builtIn.sha256);
export const builtInSha384 = exprFunc1(l.builtIn.sha384);
export const builtInSha512 = exprFunc1(l.builtIn.sha512);
export const builtInCoalesce = exprListFunc1(l.builtIn.coalesce);
export const builtInIf = exprFunc2(l.builtIn.if_);
export const builtInStrlang = exprFunc2(l.builtIn.strlang);
export const builtInStrdt = exprFunc2(l.builtIn.strdt);
export const builtInSameterm = exprFunc2(l.builtIn.sameterm);
export const builtInIsiri = exprFunc1(l.builtIn.isiri);
export const builtInIsuri = exprFunc1(l.builtIn.isuri);
export const builtInIsblank = exprFunc1(l.builtIn.isblank);
export const builtInIsliteral = exprFunc1(l.builtIn.isliteral);
export const builtInIsnumeric = exprFunc1(l.builtIn.isnumeric);

export const builtInCall: RuleDef & { name: 'builtInCall' } = {
  name: 'builtInCall',
  impl: ({ OR, SUBRULE }) => () => {
    OR([
      { ALT: () => SUBRULE(aggregate) },
      { ALT: () => SUBRULE(builtInStr) },
      { ALT: () => SUBRULE(builtInLang) },
      { ALT: () => SUBRULE(builtInLangmatches) },
      { ALT: () => SUBRULE(builtInDatatype) },
      { ALT: () => SUBRULE(builtInBound) },
      { ALT: () => SUBRULE(builtInIri) },
      { ALT: () => SUBRULE(builtInUri) },
      { ALT: () => SUBRULE(builtInBnode) },
      { ALT: () => SUBRULE(builtInRand) },
      { ALT: () => SUBRULE(builtInAbs) },
      { ALT: () => SUBRULE(builtInCeil) },
      { ALT: () => SUBRULE(builtInFloor) },
      { ALT: () => SUBRULE(builtInRound) },
      { ALT: () => SUBRULE(builtInConcat) },
      { ALT: () => SUBRULE(substringExpression) },
      { ALT: () => SUBRULE(builtInStrlen) },
      { ALT: () => SUBRULE(strReplaceExpression) },
      { ALT: () => SUBRULE(builtInUcase) },
      { ALT: () => SUBRULE(builtInLcase) },
      { ALT: () => SUBRULE(builtInEncode_for_uri) },
      { ALT: () => SUBRULE(builtInContains) },
      { ALT: () => SUBRULE(builtInStrstarts) },
      { ALT: () => SUBRULE(builtInStrends) },
      { ALT: () => SUBRULE(builtInStrbefore) },
      { ALT: () => SUBRULE(builtInStrafter) },
      { ALT: () => SUBRULE(builtInYear) },
      { ALT: () => SUBRULE(builtInMonth) },
      { ALT: () => SUBRULE(builtInDay) },
      { ALT: () => SUBRULE(builtInHours) },
      { ALT: () => SUBRULE(builtInMinutes) },
      { ALT: () => SUBRULE(builtInSeconds) },
      { ALT: () => SUBRULE(builtInTimezone) },
      { ALT: () => SUBRULE(builtInTz) },
      { ALT: () => SUBRULE(builtInNow) },
      { ALT: () => SUBRULE(builtInUuid) },
      { ALT: () => SUBRULE(builtInStruuid) },
      { ALT: () => SUBRULE(builtInMd5) },
      { ALT: () => SUBRULE(builtInSha1) },
      { ALT: () => SUBRULE(builtInSha256) },
      { ALT: () => SUBRULE(builtInSha384) },
      { ALT: () => SUBRULE(builtInSha512) },
      { ALT: () => SUBRULE(builtInCoalesce) },
      { ALT: () => SUBRULE(builtInIf) },
      { ALT: () => SUBRULE(builtInStrlang) },
      { ALT: () => SUBRULE(builtInStrdt) },
      { ALT: () => SUBRULE(builtInSameterm) },
      { ALT: () => SUBRULE(builtInIsiri) },
      { ALT: () => SUBRULE(builtInIsuri) },
      { ALT: () => SUBRULE(builtInIsblank) },
      { ALT: () => SUBRULE(builtInIsliteral) },
      { ALT: () => SUBRULE(builtInIsnumeric) },
      { ALT: () => SUBRULE(regexExpression) },
      { ALT: () => SUBRULE(existsFunc) },
      { ALT: () => SUBRULE(notExistsFunc) },
    ]);
  },
};

export const regexExpression: RuleDef & { name: 'regexExpression' } = {
  name: 'regexExpression',
  impl: ({ CONSUME1, CONSUME2, SUBRULE3, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.builtIn.regex);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME1(l.symbols.comma);
    SUBRULE2(expression);
    OPTION(() => {
      CONSUME2(l.symbols.comma);
      SUBRULE3(expression);
    });
    CONSUME(l.symbols.RParen);
  },
};

export const substringExpression: RuleDef & { name: 'substringExpression' } = {
  name: 'substringExpression',
  impl: ({ CONSUME1, CONSUME2, SUBRULE3, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.builtIn.substr);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME1(l.symbols.comma);
    SUBRULE2(expression);
    OPTION(() => {
      CONSUME2(l.symbols.comma);
      SUBRULE3(expression);
    });
    CONSUME(l.symbols.RParen);
  },
};

export const strReplaceExpression: RuleDef & { name: 'strReplaceExpression' } = {
  name: 'strReplaceExpression',
  impl: ({ CONSUME1, CONSUME2, CONSUME3, SUBRULE3, SUBRULE4, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.builtIn.replace);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME1(l.symbols.comma);
    SUBRULE2(expression);
    CONSUME2(l.symbols.comma);
    SUBRULE3(expression);
    OPTION(() => {
      CONSUME3(l.symbols.comma);
      SUBRULE4(expression);
    });
    CONSUME(l.symbols.RParen);
  },
};

export const existsFunc: RuleDef & { name: 'existsFunc' } = {
  name: 'existsFunc',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.builtIn.exists);
    SUBRULE(groupGraphPattern);
  },
};

export const notExistsFunc: RuleDef & { name: 'notExistsFunc' } = {
  name: 'notExistsFunc',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.builtIn.notexists);
    SUBRULE(groupGraphPattern);
  },
};

export const aggregateCount = baseAggregateFunc(l.builtIn.count);
export const aggregateSum = baseAggregateFunc(l.builtIn.sum);
export const aggregateMin = baseAggregateFunc(l.builtIn.min);
export const aggregateMax = baseAggregateFunc(l.builtIn.max);
export const aggregateAvg = baseAggregateFunc(l.builtIn.avg);
export const aggregateSample = baseAggregateFunc(l.builtIn.sample);
export const aggregateGroup_concat: RuleDef & { name: Uncapitalize<typeof l.builtIn.groupConcat.name> } = {
  name: unCapitalize(l.builtIn.groupConcat.name),
  impl: ({ CONSUME, OPTION1, SUBRULE, OPTION2 }) => () => {
    CONSUME(l.builtIn.groupConcat);
    CONSUME(l.symbols.LParen);
    OPTION1(() => {
      CONSUME(l.distinct);
    });
    SUBRULE(expression);
    OPTION2(() => {
      CONSUME(l.symbols.semi);
      CONSUME(l.builtIn.separator);
      CONSUME(l.symbols.equal);
      SUBRULE(string);
    });
    CONSUME(l.symbols.RParen);
  },
};

export const aggregate: RuleDef & { name: 'aggregate' } = {
  name: 'aggregate',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(aggregateCount) },
      { ALT: () => SUBRULE(aggregateSum) },
      { ALT: () => SUBRULE(aggregateMin) },
      { ALT: () => SUBRULE(aggregateMax) },
      { ALT: () => SUBRULE(aggregateAvg) },
      { ALT: () => SUBRULE(aggregateSample) },
      { ALT: () => SUBRULE(aggregateGroup_concat) },
    ]);
  },
};

export const iriOrFunction: RuleDef & { name: 'iriOrFunction' } = {
  name: 'iriOrFunction',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(iri);
    OPTION(() => {
      SUBRULE(argList);
    });
  },
};

export const rdfLiteral: RuleDef & { name: 'rdfLiteral' } = {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, CONSUME, OPTION, OR }) => () => {
    SUBRULE(string);
    OPTION(() => {
      OR([
        { ALT: () => CONSUME(l.terminals.langTag) },
        { ALT: () => {
          CONSUME(l.symbols.hathat);
          SUBRULE(iri);
        } },
      ]);
    });
  },
};

export const numericLiteral: RuleDef & { name: 'numericLiteral' } = {
  name: 'numericLiteral',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(numericLiteralUnsigned) },
      { ALT: () => SUBRULE(numericLiteralPositive) },
      { ALT: () => SUBRULE(numericLiteralNegative) },
    ]);
  },
};

export const numericLiteralUnsigned: RuleDef & { name: 'numericLiteralUnsigned' } = {
  name: 'numericLiteralUnsigned',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.integer) },
      { ALT: () => CONSUME(l.terminals.decimal) },
      { ALT: () => CONSUME(l.terminals.double) },
    ]);
  },
};

export const numericLiteralPositive: RuleDef & { name: 'numericLiteralPositive' } = {
  name: 'numericLiteralPositive',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.interferePositive) },
      { ALT: () => CONSUME(l.terminals.decimalPositive) },
      { ALT: () => CONSUME(l.terminals.doublePositive) },
    ]);
  },
};

export const numericLiteralNegative: RuleDef & { name: 'numericLiteralNegative' } = {
  name: 'numericLiteralNegative',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.interfereNegative) },
      { ALT: () => CONSUME(l.terminals.decimalNegative) },
      { ALT: () => CONSUME(l.terminals.doubleNegative) },
    ]);
  },
};

export const booleanLiteral: RuleDef & { name: 'booleanLiteral' } = {
  name: 'booleanLiteral',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.true_) },
      { ALT: () => CONSUME(l.false_) },
    ]);
  },
};

export const string: RuleDef & { name: 'string' } = {
  name: 'string',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.stringLiteral1) },
      { ALT: () => CONSUME(l.terminals.stringLiteral2) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong1) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong2) },
    ]);
  },
};

export const iri: RuleDef & { name: 'iri' } = {
  name: 'iri',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.iriRef) },
      { ALT: () => SUBRULE(prefixedName) },
    ]);
  },
};

export const prefixedName: RuleDef & { name: 'prefixedName' } = {
  name: 'prefixedName',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.pNameLn) },
      { ALT: () => CONSUME(l.terminals.pNameNs) },
    ]);
  },
};

export const blankNode: RuleDef & { name: 'blankNode' } = {
  name: 'blankNode',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.blankNodeLabel) },
      { ALT: () => CONSUME(l.terminals.anon) },
    ]);
  },
};

export const sparql12Builder = Builder.createBuilder()
  .addRule(queryUnit)
  .addRule(query)
  .addRule(updateUnit)
  .addRule(prologue)
  .addRule(baseDecl)
  .addRule(prefixDecl)
  .addRule(selectQuery)
  .addRule(subSelect)
  .addRule(selectClause)
  .addRule(constructQuery)
  .addRule(describeQuery)
  .addRule(askQuery)
  .addRule(datasetClause)
  .addRule(defaultGraphClause)
  .addRule(namedGraphClause)
  .addRule(sourceSelector)
  .addRule(whereClause)
  .addRule(solutionModifier)
  .addRule(groupClause)
  .addRule(groupCondition)
  .addRule(havingClause)
  .addRule(havingCondition)
  .addRule(orderClause)
  .addRule(orderCondition)
  .addRule(limitOffsetClauses)
  .addRule(limitClause)
  .addRule(offsetClause)
  .addRule(valuesClause)
  .addRule(update)
  .addRule(update1)
  .addRule(load)
  .addRule(clear)
  .addRule(drop)
  .addRule(create)
  .addRule(add)
  .addRule(move)
  .addRule(copy)
  .addRule(insertData)
  .addRule(deleteData)
  .addRule(deleteWhere)
  .addRule(modify)
  .addRule(deleteClause)
  .addRule(insertClause)
  .addRule(usingClause)
  .addRule(graphOrDefault)
  .addRule(graphRef)
  .addRule(graphRefAll)
  .addRule(quadPattern)
  .addRule(quadData)
  .addRule(quads)
  .addRule(quadsNotTriples)
  .addRule(triplesTemplate)
  .addRule(groupGraphPattern)
  .addRule(groupGraphPatternSub)
  .addRule(triplesBlock)
  .addRule(graphPatternNotTriples)
  .addRule(optionalGraphPattern)
  .addRule(graphGraphPattern)
  .addRule(serviceGraphPattern)
  .addRule(bind)
  .addRule(inlineData)
  .addRule(dataBlock)
  .addRule(inlineDataOneVar)
  .addRule(inlineDataFull)
  .addRule(dataBlockValue)
  .addRule(minusGraphPattern)
  .addRule(groupOrUnionGraphPattern)
  .addRule(filter)
  .addRule(constraint)
  .addRule(functionCall)
  .addRule(argList)
  .addRule(expressionList)
  .addRule(constructTemplate)
  .addRule(constructTriples)
  .addRule(triplesSameSubject)
  .addRule(propertyList)
  .addRule(propertyListNotEmpty)
  .addRule(verb)
  .addRule(objectList)
  .addRule(object)
  .addRule(triplesSameSubjectPath)
  .addRule(propertyListPath)
  .addRule(propertyListPathNotEmpty)
  .addRule(verbPath)
  .addRule(verbSimple)
  .addRule(objectListPath)
  .addRule(objectPath)
  .addRule(path)
  .addRule(pathAlternative)
  .addRule(pathSequence)
  .addRule(pathElt)
  .addRule(pathEltOrInverse)
  .addRule(pathMod)
  .addRule(pathPrimary)
  .addRule(pathNegatedPropertySet)
  .addRule(pathOneInPropertySet)
  .addRule(integer)
  .addRule(triplesNode)
  .addRule(blankNodePropertyList)
  .addRule(triplesNodePath)
  .addRule(blankNodePropertyListPath)
  .addRule(collection)
  .addRule(collectionPath)
  .addRule(graphNode)
  .addRule(graphNodePath)
  .addRule(varOrTerm)
  .addRule(varOrIri)
  .addRule(var_)
  .addRule(graphTerm)
  .addRule(expression)
  .addRule(conditionalOrExpression)
  .addRule(conditionalAndExpression)
  .addRule(valueLogical)
  .addRule(relationalExpression)
  .addRule(numericExpression)
  .addRule(additiveExpression)
  .addRule(multiplicativeExpression)
  .addRule(unaryExpression)
  .addRule(primaryExpression)
  .addRule(brackettedExpression)
  .addRule(builtInCall)
  .addRule(builtInStr)
  .addRule(builtInLang)
  .addRule(builtInLangmatches)
  .addRule(builtInDatatype)
  .addRule(builtInBound)
  .addRule(builtInIri)
  .addRule(builtInUri)
  .addRule(builtInBnode)
  .addRule(builtInRand)
  .addRule(builtInAbs)
  .addRule(builtInCeil)
  .addRule(builtInFloor)
  .addRule(builtInRound)
  .addRule(builtInConcat)
  .addRule(builtInStrlen)
  .addRule(builtInUcase)
  .addRule(builtInLcase)
  .addRule(builtInEncode_for_uri)
  .addRule(builtInContains)
  .addRule(builtInStrstarts)
  .addRule(builtInStrends)
  .addRule(builtInStrbefore)
  .addRule(builtInStrafter)
  .addRule(builtInYear)
  .addRule(builtInMonth)
  .addRule(builtInDay)
  .addRule(builtInHours)
  .addRule(builtInMinutes)
  .addRule(builtInSeconds)
  .addRule(builtInTimezone)
  .addRule(builtInTz)
  .addRule(builtInNow)
  .addRule(builtInUuid)
  .addRule(builtInStruuid)
  .addRule(builtInMd5)
  .addRule(builtInSha1)
  .addRule(builtInSha256)
  .addRule(builtInSha384)
  .addRule(builtInSha512)
  .addRule(builtInCoalesce)
  .addRule(builtInIf)
  .addRule(builtInStrlang)
  .addRule(builtInStrdt)
  .addRule(builtInSameterm)
  .addRule(builtInIsiri)
  .addRule(builtInIsuri)
  .addRule(builtInIsblank)
  .addRule(builtInIsliteral)
  .addRule(builtInIsnumeric)
  .addRule(regexExpression)
  .addRule(substringExpression)
  .addRule(strReplaceExpression)
  .addRule(existsFunc)
  .addRule(notExistsFunc)
  .addRule(aggregateCount)
  .addRule(aggregateSum)
  .addRule(aggregateMin)
  .addRule(aggregateMax)
  .addRule(aggregateAvg)
  .addRule(aggregateSample)
  .addRule(aggregateGroup_concat)
  .addRule(aggregate)
  .addRule(iriOrFunction)
  .addRule(rdfLiteral)
  .addRule(numericLiteral)
  .addRule(numericLiteralUnsigned)
  .addRule(numericLiteralPositive)
  .addRule(numericLiteralNegative)
  .addRule(booleanLiteral)
  .addRule(string)
  .addRule(iri)
  .addRule(prefixedName)
  .addRule(blankNode);

export function trySparql12(): void {
  const lexer = ChevSparqlLexer;
  const parser = sparql12Builder.consume(allTokens);

  // Const lexResult = lexer.tokenize('SELECT * WHERE { ?s ?p ?o }');
  const lexResult = lexer.tokenize('SELECT (LANGMATCHES(?S, ?P) AS ?adjusted) WHERE { ?s ?p ?o }');

  parser.input = lexResult.tokens;
  parser.query();
  console.log(parser.errors.join('\n'));
}
