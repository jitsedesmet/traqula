import type { TokenType } from 'chevrotain';
import * as l from '../lexer';
import { ChevSparqlLexer } from '../lexer';
import { Builder } from './buildExample';
import type { RuleDef } from './buildExample';

// Const aggregate: RuleDef = {
//     name: 'aggregate',
//     impl: ({SUBRULE, OR}) => () => {
//         OR([
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Count])},
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Sum])},
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Min])},
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Max])},
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Avg])},
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Sample])},
//             {ALT: () => SUBRULE([l.buildIn.BuiltInCalls.Group_concat])},
//         ]);
//     }
// };

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
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      SUBRULE(expression);
      CONSUME(l.symbols.comma);
      SUBRULE(expression);
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

const query: RuleDef & { name: 'query' } = {
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

const prologue: RuleDef & { name: 'prologue' } = {
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

const baseDecl: RuleDef & { name: 'baseDecl' } = {
  name: 'baseDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.baseDecl);
    CONSUME(l.terminals.iriRef);
  },
};

const prefixDecl: RuleDef & { name: 'prefixDecl' } = {
  name: 'prefixDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.prefixDecl);
    CONSUME(l.terminals.pNameNs);
    CONSUME(l.terminals.iriRef);
  },
};

const selectQuery: RuleDef & { name: 'selectQuery' } = {
  name: 'selectQuery',
  impl: ({ SUBRULE, MANY }) => () => {
    SUBRULE(selectClause);
    MANY(() => SUBRULE(datasetClause));
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
  },
};

const subSelect: RuleDef & { name: 'subSelect' } = {
  name: 'subSelect',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(selectClause);
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
    SUBRULE(valuesClause);
  },
};

const selectClause: RuleDef & { name: 'selectClause' } = {
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

const constructQuery: RuleDef & { name: 'constructQuery' } = {
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

const describeQuery: RuleDef & { name: 'describeQuery' } = {
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

const askQuery: RuleDef & { name: 'askQuery' } = {
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

const datasetClause: RuleDef & { name: 'datasetClause' } = {
  name: 'datasetClause',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.from);
    OR([
      { ALT: () => SUBRULE(defaultGraphClause) },
      { ALT: () => SUBRULE(namedGraphClause) },
    ]);
  },
};

const defaultGraphClause: RuleDef & { name: 'defaultGraphClause' } = {
  name: 'defaultGraphClause',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(sourceSelector);
  },
};

const namedGraphClause: RuleDef & { name: 'namedGraphClause' } = {
  name: 'namedGraphClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.named);
    SUBRULE(sourceSelector);
  },
};

const sourceSelector: RuleDef & { name: 'sourceSelector' } = {
  name: 'sourceSelector',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
  },
};

const whereClause: RuleDef & { name: 'whereClause' } = {
  name: 'whereClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.where);
    });
    SUBRULE(groupGraphPattern);
  },
};

const solutionModifier: RuleDef & { name: 'solutionModifier' } = {
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

const groupClause: RuleDef & { name: 'groupClause' } = {
  name: 'groupClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.groupBy);
    AT_LEAST_ONE(() => {
      SUBRULE(groupCondition);
    });
  },
};

const groupCondition: RuleDef & { name: 'groupCondition' } = {
  name: 'groupCondition',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(buildInCall) },
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

const havingClause: RuleDef & { name: 'havingClause' } = {
  name: 'havingClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.having);
    AT_LEAST_ONE(() => {
      SUBRULE(havingCondition);
    });
  },
};

const havingCondition: RuleDef & { name: 'havingCondition' } = {
  name: 'havingCondition',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(constraint);
  },
};

const orderClause: RuleDef & { name: 'orderClause' } = {
  name: 'orderClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.order);
    AT_LEAST_ONE(() => {
      SUBRULE(orderCondition);
    });
  },
};

const orderCondition: RuleDef & { name: 'orderCondition' } = {
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

const limitOffsetClauses: RuleDef & { name: 'limitOffsetClauses' } = {
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

const limitClause: RuleDef & { name: 'limitClause' } = {
  name: 'limitClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.limit);
    SUBRULE(integer);
  },
};

const offsetClause: RuleDef & { name: 'offsetClause' } = {
  name: 'offsetClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.offset);
    SUBRULE(integer);
  },
};

const valuesClause: RuleDef & { name: 'valuesClause' } = {
  name: 'valuesClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.values);
      SUBRULE(dataBlock);
    });
  },
};

const update: RuleDef & { name: 'update' } = {
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

const update1: RuleDef & { name: 'update1' } = {
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

const load: RuleDef & { name: 'load' } = {
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

const clear: RuleDef & { name: 'clear' } = {
  name: 'clear',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.clear);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRefAll);
  },
};

const drop: RuleDef & { name: 'drop' } = {
  name: 'drop',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.drop);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRefAll);
  },
};

const create: RuleDef & { name: 'create' } = {
  name: 'create',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.create);
    OPTION(() => CONSUME(l.silent));
    SUBRULE(graphRef);
  },
};

const add: RuleDef & { name: 'add' } = {
  name: 'add',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.add);
    OPTION(() => CONSUME(l.silent));
    SUBRULE1(graphOrDefault);
    CONSUME(l.to);
    SUBRULE2(graphOrDefault);
  },
};

const move: RuleDef & { name: 'move' } = {
  name: 'move',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.move);
    OPTION(() => CONSUME(l.silent));
    SUBRULE1(graphOrDefault);
    CONSUME(l.to);
    SUBRULE2(graphOrDefault);
  },
};

const copy: RuleDef & { name: 'copy' } = {
  name: 'copy',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.copy);
    OPTION(() => CONSUME(l.silent));
    SUBRULE1(graphOrDefault);
    CONSUME(l.to);
    SUBRULE2(graphOrDefault);
  },
};

const insertData: RuleDef & { name: 'insertData' } = {
  name: 'insertData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertData);
    SUBRULE(quadData);
  },
};

const deleteData: RuleDef & { name: 'deleteData' } = {
  name: 'deleteData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteData);
    SUBRULE(quadData);
  },
};

const deleteWhere: RuleDef & { name: 'deleteWhere' } = {
  name: 'deleteWhere',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteWhere);
    SUBRULE(quadPattern);
  },
};

const modify: RuleDef & { name: 'modify' } = {
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

const deleteClause: RuleDef & { name: 'deleteClause' } = {
  name: 'deleteClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.deleteClause);
    SUBRULE(quadPattern);
  },
};

const insertClause: RuleDef & { name: 'insertClause' } = {
  name: 'insertClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.insertClause);
    SUBRULE(quadPattern);
  },
};

const usingClause: RuleDef & { name: 'usingClause' } = {
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

const graphOrDefault: RuleDef & { name: 'graphOrDefault' } = {
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

const graphRef: RuleDef & { name: 'graphRef' } = {
  name: 'graphRef',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(iri);
  },
};

const graphRefAll: RuleDef & { name: 'graphRefAll' } = {
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

const quadPattern: RuleDef & { name: 'quadPattern' } = {
  name: 'quadPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
  },
};

const quadData: RuleDef & { name: 'quadData' } = {
  name: 'quadData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LCurly);
    SUBRULE(quads);
    CONSUME(l.symbols.RCurly);
  },
};

const quads: RuleDef & { name: 'quads' } = {
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

const quadsNotTriples: RuleDef & { name: 'quadsNotTriples' } = {
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

const triplesTemplate: RuleDef & { name: 'triplesTemplate' } = {
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

const groupGraphPattern: RuleDef & { name: 'groupGraphPattern' } = {
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

const groupGraphPatternSub: RuleDef & { name: 'groupGraphPatternSub' } = {
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

const triplesBlock: RuleDef & { name: 'triplesBlock' } = {
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

const graphPatternNotTriples: RuleDef & { name: 'graphPatternNotTriples' } = {
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

const optionalGraphPattern: RuleDef & { name: 'optionalGraphPattern' } = {
  name: 'optionalGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.optional);
    SUBRULE(groupGraphPattern);
  },
};

const graphGraphPattern: RuleDef & { name: 'graphGraphPattern' } = {
  name: 'graphGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(varOrIri);
    SUBRULE(groupGraphPattern);
  },
};

const serviceGraphPattern: RuleDef & { name: 'serviceGraphPattern' } = {
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

const bind: RuleDef & { name: 'bind' } = {
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

const inlineData: RuleDef & { name: 'inlineData' } = {
  name: 'inlineData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.values);
    SUBRULE(dataBlock);
  },
};

const dataBlock: RuleDef & { name: 'dataBlock' } = {
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

const inlineDataOneVar: RuleDef & { name: 'inlineDataOneVar' } = {
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

const inlineDataFull: RuleDef & { name: 'inlineDataFull' } = {
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

const dataBlockValue: RuleDef & { name: 'dataBlockValue' } = {
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

const minusGraphPattern: RuleDef & { name: 'minusGraphPattern' } = {
  name: 'minusGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.minus);
    SUBRULE(groupGraphPattern);
  },
};

const groupOrUnionGraphPattern: RuleDef & { name: 'groupOrUnionGraphPattern' } = {
  name: 'groupOrUnionGraphPattern',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(groupGraphPattern);
    MANY(() => {
      CONSUME(l.union);
      SUBRULE2(groupGraphPattern);
    });
  },
};

const filter: RuleDef & { name: 'filter' } = {
  name: 'filter',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.filter);
    SUBRULE(constraint);
  },
};

const constraint: RuleDef & { name: 'constraint' } = {
  name: 'constraint',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(brackettedExpression) },
      { ALT: () => SUBRULE(buildInCall) },
      { ALT: () => SUBRULE(functionCall) },
    ]);
  },
};

const functionCall: RuleDef & { name: 'functionCall' } = {
  name: 'functionCall',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
    SUBRULE(argList);
  },
};

const argList: RuleDef & { name: 'argList' } = {
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

const expressionList: RuleDef & { name: 'expressionList' } = {
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

const constructTemplate: RuleDef & { name: 'constructTemplate' } = {
  name: 'constructTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.symbols.LCurly);
    OPTION(() => {
      SUBRULE(constructTriples);
    });
    CONSUME(l.symbols.RCurly);
  },
};

const constructTriples: RuleDef & { name: 'constructTriples' } = {
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

const triplesSameSubject: RuleDef & { name: 'triplesSameSubject' } = {
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

const propertyList: RuleDef & { name: 'propertyList' } = {
  name: 'propertyList',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListNotEmpty);
    });
  },
};

const propertyListNotEmpty: RuleDef & { name: 'propertyListNotEmpty' } = {
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

const verb: RuleDef & { name: 'verb' } = {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrIri) },
      { ALT: () => CONSUME(l.a) },
    ]);
  },
};

const objectList: RuleDef & { name: 'objectList' } = {
  name: 'objectList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(object);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(object);
    });
  },
};

const object: RuleDef & { name: 'object' } = {
  name: 'object',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNode);
  },
};

const triplesSameSubjectPath: RuleDef & { name: 'triplesSameSubjectPath' } = {
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

const propertyListPath: RuleDef & { name: 'propertyListPath' } = {
  name: 'propertyListPath',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListPathNotEmpty);
    });
  },
};

const propertyListPathNotEmpty: RuleDef & { name: 'propertyListPathNotEmpty' } = {
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

const verbPath: RuleDef & { name: 'verbPath' } = {
  name: 'verbPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(path);
  },
};

const verbSimple: RuleDef & { name: 'verbSimple' } = {
  name: 'verbSimple',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(var_);
  },
};

const objectListPath: RuleDef & { name: 'objectListPath' } = {
  name: 'objectListPath',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(objectPath);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(objectPath);
    });
  },
};

const objectPath: RuleDef & { name: 'objectPath' } = {
  name: 'objectPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNodePath);
  },
};

const path: RuleDef & { name: 'path' } = {
  name: 'path',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(pathAlternative);
  },
};

const pathAlternative: RuleDef & { name: 'pathAlternative' } = {
  name: 'pathAlternative',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(pathSequence);
    MANY(() => {
      CONSUME(l.symbols.pipe);
      SUBRULE2(pathSequence);
    });
  },
};

const pathSequence: RuleDef & { name: 'pathSequence' } = {
  name: 'pathSequence',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(pathEltOrInverse);
    MANY(() => {
      CONSUME(l.symbols.slash);
      SUBRULE2(pathEltOrInverse);
    });
  },
};

const pathElt: RuleDef & { name: 'pathElt' } = {
  name: 'pathElt',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(pathPrimary);
    OPTION(() => {
      SUBRULE(pathMod);
    });
  },
};

const pathEltOrInverse: RuleDef & { name: 'pathEltOrInverse' } = {
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

const pathMod: RuleDef & { name: 'pathMod' } = {
  name: 'pathMod',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.symbols.question) },
      { ALT: () => CONSUME(l.symbols.star) },
      { ALT: () => CONSUME(l.symbols.plus) },
    ]);
  },
};

const pathPrimary: RuleDef & { name: 'pathPrimary' } = {
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

const pathNegatedPropertySet: RuleDef & { name: 'pathNegatedPropertySet' } = {
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

const pathOneInPropertySet: RuleDef & { name: 'pathOneInPropertySet' } = {
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

const integer: RuleDef & { name: 'integer' } = {
  name: 'integer',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.terminals.integer);
  },
};

const triplesNode: RuleDef & { name: 'triplesNode' } = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collection) },
      { ALT: () => SUBRULE(blankNodePropertyList) },
    ]);
  },
};

const blankNodePropertyList: RuleDef & { name: 'blankNodePropertyList' } = {
  name: 'blankNodePropertyList',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

const triplesNodePath: RuleDef & { name: 'triplesNodePath' } = {
  name: 'triplesNodePath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collectionPath) },
      { ALT: () => SUBRULE(blankNodePropertyListPath) },
    ]);
  },
};

const blankNodePropertyListPath: RuleDef & { name: 'blankNodePropertyListPath' } = {
  name: 'blankNodePropertyListPath',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListPathNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

const collection: RuleDef & { name: 'collection' } = {
  name: 'collection',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNode);
    });
    CONSUME(l.symbols.RParen);
  },
};

const collectionPath: RuleDef & { name: 'collectionPath' } = {
  name: 'collectionPath',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNodePath);
    });
    CONSUME(l.symbols.RParen);
  },
};

const graphNode: RuleDef & { name: 'graphNode' } = {
  name: 'graphNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNode) },
    ]);
  },
};

const graphNodePath: RuleDef & { name: 'graphNodePath' } = {
  name: 'graphNodePath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNodePath) },
    ]);
  },
};

const varOrTerm: RuleDef & { name: 'varOrTerm' } = {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(var_) },
      { ALT: () => SUBRULE(graphTerm) },
    ]);
  },
};

const varOrIri: RuleDef & { name: 'varOrIri' } = {
  name: 'varOrIri',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(var_) },
      { ALT: () => SUBRULE(iri) },
    ]);
  },
};

const var_: RuleDef & { name: 'var' } = {
  name: 'var',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.var1) },
      { ALT: () => CONSUME(l.terminals.var2) },
    ]);
  },
};

const graphTerm: RuleDef & { name: 'graphTerm' } = {
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

const expression: RuleDef & { name: 'expression' } = {
  name: 'expression',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(conditionalOrExpression);
  },
};

const conditionalOrExpression: RuleDef & { name: 'conditionalOrExpression' } = {
  name: 'conditionalOrExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(conditionalAndExpression);
    MANY(() => {
      CONSUME(l.symbols.logicOr);
      SUBRULE2(conditionalAndExpression);
    });
  },
};

const conditionalAndExpression: RuleDef & { name: 'conditionalAndExpression' } = {
  name: 'conditionalAndExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(valueLogical);
    MANY(() => {
      CONSUME(l.symbols.logicAnd);
      SUBRULE2(valueLogical);
    });
  },
};

const valueLogical: RuleDef & { name: 'valueLogical' } = {
  name: 'valueLogical',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(relationalExpression);
  },
};

const relationalExpression: RuleDef & { name: 'relationalExpression' } = {
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

const numericExpression: RuleDef & { name: 'numericExpression' } = {
  name: 'numericExpression',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(additiveExpression);
  },
};

const additiveExpression: RuleDef & { name: 'additiveExpression' } = {
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

const multiplicativeExpression: RuleDef & { name: 'multiplicativeExpression' } = {
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

const unaryExpression: RuleDef & { name: 'unaryExpression' } = {
  name: 'unaryExpression',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, OR }) => () => {
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
      { ALT: () => primaryExpression },
    ]);
  },
};

const primaryExpression: RuleDef & { name: 'primaryExpression' } = {
  name: 'primaryExpression',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(brackettedExpression) },
      { ALT: () => SUBRULE(buildInCall) },
      { ALT: () => SUBRULE(iriOrFunction) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(numericLiteral) },
      { ALT: () => SUBRULE(booleanLiteral) },
      { ALT: () => SUBRULE(var_) },
    ]);
  },
};

const brackettedExpression: RuleDef & { name: 'brackettedExpression' } = {
  name: 'brackettedExpression',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    SUBRULE(expression);
    CONSUME(l.symbols.RParen);
  },
};

const buildInStr = exprFunc1(l.buildIn.str);
const buildInLang = exprFunc1(l.buildIn.lang);
const buildInLangmatches = exprFunc2(l.buildIn.langmatches);
const buildInDatatype = exprFunc1(l.buildIn.datatype);
const buildInBound = varFunc1(l.buildIn.bound);
const buildInIri = exprFunc1(l.buildIn.iri);
const buildInUri = exprFunc1(l.buildIn.uri);
const buildInBnode = exprOrNilFunc1(l.buildIn.bnode);
const buildInRand = nilFunc1(l.buildIn.rand);
const buildInAbs = exprFunc1(l.buildIn.abs);
const buildInCeil = exprFunc1(l.buildIn.ceil);
const buildInFloor = exprFunc1(l.buildIn.floor);
const buildInRound = exprFunc1(l.buildIn.round);
const buildInConcat = exprListFunc1(l.buildIn.concat);

const buildInStrlen = exprFunc1(l.buildIn.strlen);

const buildInUcase = exprFunc1(l.buildIn.ucase);
const buildInLcase = exprFunc1(l.buildIn.lcase);
const buildInEncode_for_uri = exprFunc1(l.buildIn.encode_for_uri);
const buildInContains = exprFunc2(l.buildIn.contains);
const buildInStrstarts = exprFunc2(l.buildIn.strstarts);
const buildInStrends = exprFunc2(l.buildIn.strends);
const buildInStrbefore = exprFunc2(l.buildIn.strbefore);
const buildInStrafter = exprFunc2(l.buildIn.strafter);
const buildInYear = exprFunc1(l.buildIn.year);
const buildInMonth = exprFunc1(l.buildIn.month);
const buildInDay = exprFunc1(l.buildIn.day);
const buildInHours = exprFunc1(l.buildIn.hours);
const buildInMinutes = exprFunc1(l.buildIn.minutes);
const buildInSeconds = exprFunc1(l.buildIn.seconds);
const buildInTimezone = exprFunc1(l.buildIn.timezone);
const buildInTz = exprFunc1(l.buildIn.tz);
const buildInNow = nilFunc1(l.buildIn.now);
const buildInUuid = nilFunc1(l.buildIn.uuid);
const buildInStruuid = nilFunc1(l.buildIn.struuid);
const buildInMd5 = exprFunc1(l.buildIn.md5);
const buildInSha1 = exprFunc1(l.buildIn.sha1);
const buildInSha256 = exprFunc1(l.buildIn.sha256);
const buildInSha384 = exprFunc1(l.buildIn.sha384);
const buildInSha512 = exprFunc1(l.buildIn.sha512);
const buildInCoalesce = exprListFunc1(l.buildIn.coalesce);
const buildInIf = exprFunc2(l.buildIn.if_);
const buildInStrlang = exprFunc2(l.buildIn.strlang);
const buildInStrdt = exprFunc2(l.buildIn.strdt);
const buildInSameterm = exprFunc2(l.buildIn.sameterm);
const buildInIsiri = exprFunc1(l.buildIn.isiri);
const buildInIsuri = exprFunc1(l.buildIn.isuri);
const buildInIsblank = exprFunc1(l.buildIn.isblank);
const buildInIsliteral = exprFunc1(l.buildIn.isliteral);
const buildInIsnumeric = exprFunc1(l.buildIn.isnumeric);

const buildInCall: RuleDef & { name: 'buildInCall' } = {
  name: 'buildInCall',
  impl: ({ OR, SUBRULE }) => () => {
    OR([
      { ALT: () => SUBRULE(aggregate) },
      { ALT: () => SUBRULE(buildInStr) },
      { ALT: () => SUBRULE(buildInLang) },
      { ALT: () => SUBRULE(buildInLangmatches) },
      { ALT: () => SUBRULE(buildInDatatype) },
      { ALT: () => SUBRULE(buildInBound) },
      { ALT: () => SUBRULE(buildInIri) },
      { ALT: () => SUBRULE(buildInUri) },
      { ALT: () => SUBRULE(buildInBnode) },
      { ALT: () => SUBRULE(buildInRand) },
      { ALT: () => SUBRULE(buildInAbs) },
      { ALT: () => SUBRULE(buildInCeil) },
      { ALT: () => SUBRULE(buildInFloor) },
      { ALT: () => SUBRULE(buildInRound) },
      { ALT: () => SUBRULE(buildInConcat) },
      { ALT: () => SUBRULE(substringExpression) },
      { ALT: () => SUBRULE(buildInStrlen) },
      { ALT: () => SUBRULE(strReplaceExpression) },
      { ALT: () => SUBRULE(buildInUcase) },
      { ALT: () => SUBRULE(buildInLcase) },
      { ALT: () => SUBRULE(buildInEncode_for_uri) },
      { ALT: () => SUBRULE(buildInContains) },
      { ALT: () => SUBRULE(buildInStrstarts) },
      { ALT: () => SUBRULE(buildInStrends) },
      { ALT: () => SUBRULE(buildInStrbefore) },
      { ALT: () => SUBRULE(buildInStrafter) },
      { ALT: () => SUBRULE(buildInYear) },
      { ALT: () => SUBRULE(buildInMonth) },
      { ALT: () => SUBRULE(buildInDay) },
      { ALT: () => SUBRULE(buildInHours) },
      { ALT: () => SUBRULE(buildInMinutes) },
      { ALT: () => SUBRULE(buildInSeconds) },
      { ALT: () => SUBRULE(buildInTimezone) },
      { ALT: () => SUBRULE(buildInTz) },
      { ALT: () => SUBRULE(buildInNow) },
      { ALT: () => SUBRULE(buildInUuid) },
      { ALT: () => SUBRULE(buildInStruuid) },
      { ALT: () => SUBRULE(buildInMd5) },
      { ALT: () => SUBRULE(buildInSha1) },
      { ALT: () => SUBRULE(buildInSha256) },
      { ALT: () => SUBRULE(buildInSha384) },
      { ALT: () => SUBRULE(buildInSha512) },
      { ALT: () => SUBRULE(buildInCoalesce) },
      { ALT: () => SUBRULE(buildInIf) },
      { ALT: () => SUBRULE(buildInStrlang) },
      { ALT: () => SUBRULE(buildInStrdt) },
      { ALT: () => SUBRULE(buildInSameterm) },
      { ALT: () => SUBRULE(buildInIsiri) },
      { ALT: () => SUBRULE(buildInIsuri) },
      { ALT: () => SUBRULE(buildInIsblank) },
      { ALT: () => SUBRULE(buildInIsliteral) },
      { ALT: () => SUBRULE(buildInIsnumeric) },
      { ALT: () => SUBRULE(regexExpression) },
      { ALT: () => SUBRULE(existsFunc) },
      { ALT: () => SUBRULE(notExistsFunc) },
    ]);
  },
};

const regexExpression: RuleDef & { name: 'regexExpression' } = {
  name: 'regexExpression',
  impl: ({ CONSUME1, CONSUME2, SUBRULE3, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.buildIn.regex);
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

const substringExpression: RuleDef & { name: 'substringExpression' } = {
  name: 'substringExpression',
  impl: ({ CONSUME1, CONSUME2, SUBRULE3, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.buildIn.substr);
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

const strReplaceExpression: RuleDef & { name: 'strReplaceExpression' } = {
  name: 'strReplaceExpression',
  impl: ({ CONSUME1, CONSUME2, CONSUME3, SUBRULE3, SUBRULE4, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.buildIn.replace);
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

const existsFunc: RuleDef & { name: 'existsFunc' } = {
  name: 'existsFunc',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.buildIn.exists);
    SUBRULE(groupGraphPattern);
  },
};

const notExistsFunc: RuleDef & { name: 'notExistsFunc' } = {
  name: 'notExistsFunc',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.buildIn.notexists);
    SUBRULE(groupGraphPattern);
  },
};

const aggregateCount = baseAggregateFunc(l.buildIn.count);
const aggregateSum = baseAggregateFunc(l.buildIn.sum);
const aggregateMin = baseAggregateFunc(l.buildIn.min);
const aggregateMax = baseAggregateFunc(l.buildIn.max);
const aggregateAvg = baseAggregateFunc(l.buildIn.avg);
const aggregateSample = baseAggregateFunc(l.buildIn.sample);
const aggregateGroup_concat: RuleDef & { name: Uncapitalize<typeof l.buildIn.groupConcat.name> } = {
  name: unCapitalize(l.buildIn.groupConcat.name),
  impl: ({ CONSUME, OPTION1, SUBRULE, OPTION2 }) => () => {
    CONSUME(l.buildIn.groupConcat);
    CONSUME(l.symbols.LParen);
    OPTION1(() => {
      CONSUME(l.distinct);
    });
    SUBRULE(expression);
    OPTION2(() => {
      CONSUME(l.symbols.semi);
      CONSUME(l.buildIn.separator);
      CONSUME(l.symbols.equal);
      SUBRULE(string);
    });
    CONSUME(l.symbols.RParen);
  },
};

const aggregate: RuleDef & { name: 'aggregate' } = {
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

const iriOrFunction: RuleDef & { name: 'iriOrFunction' } = {
  name: 'iriOrFunction',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(iri);
    OPTION(() => {
      SUBRULE(argList);
    });
  },
};

const rdfLiteral: RuleDef & { name: 'rdfLiteral' } = {
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

const numericLiteral: RuleDef & { name: 'numericLiteral' } = {
  name: 'numericLiteral',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(numericLiteralUnsigned) },
      { ALT: () => SUBRULE(numericLiteralPositive) },
      { ALT: () => SUBRULE(numericLiteralNegative) },
    ]);
  },
};

const numericLiteralUnsigned: RuleDef & { name: 'numericLiteralUnsigned' } = {
  name: 'numericLiteralUnsigned',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.integer) },
      { ALT: () => CONSUME(l.terminals.decimal) },
      { ALT: () => CONSUME(l.terminals.double) },
    ]);
  },
};

const numericLiteralPositive: RuleDef & { name: 'numericLiteralPositive' } = {
  name: 'numericLiteralPositive',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.interferePositive) },
      { ALT: () => CONSUME(l.terminals.decimalPositive) },
      { ALT: () => CONSUME(l.terminals.doublePositive) },
    ]);
  },
};

const numericLiteralNegative: RuleDef & { name: 'numericLiteralNegative' } = {
  name: 'numericLiteralNegative',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.interfereNegative) },
      { ALT: () => CONSUME(l.terminals.decimalNegative) },
      { ALT: () => CONSUME(l.terminals.doubleNegative) },
    ]);
  },
};

const booleanLiteral: RuleDef & { name: 'booleanLiteral' } = {
  name: 'booleanLiteral',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.true_) },
      { ALT: () => CONSUME(l.false_) },
    ]);
  },
};

const string: RuleDef & { name: 'string' } = {
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

const iri: RuleDef & { name: 'iri' } = {
  name: 'iri',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.iriRef) },
      { ALT: () => SUBRULE(prefixedName) },
    ]);
  },
};

const prefixedName: RuleDef & { name: 'prefixedName' } = {
  name: 'prefixedName',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.pNameLn) },
      { ALT: () => CONSUME(l.terminals.pNameNs) },
    ]);
  },
};

const blankNode: RuleDef & { name: 'blankNode' } = {
  name: 'blankNode',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.blankNodeLabel) },
      { ALT: () => CONSUME(l.terminals.anon) },
    ]);
  },
};

const builder = Builder.createBuilder()
// .addRule(queryUnit)
// .addRule(query)
// .addRule(updateUnit)
// .addRule(prologue)
// .addRule(baseDecl)
// .addRule(prefixDecl)
// .addRule(selectQuery)
// .addRule(subSelect)
// .addRule(selectClause)
// .addRule(constructQuery)
// .addRule(describeQuery)
// .addRule(askQuery)
// .addRule(datasetClause)
// .addRule(defaultGraphClause)
// .addRule(namedGraphClause)
// .addRule(sourceSelector)
// .addRule(whereClause)
// .addRule(solutionModifier)
// .addRule(groupClause)
// .addRule(groupCondition)
// .addRule(havingClause)
// .addRule(havingCondition)
// .addRule(orderClause)
// .addRule(orderCondition)
// .addRule(limitOffsetClauses)
// .addRule(limitClause)
// .addRule(offsetClause)
// .addRule(valuesClause)
// .addRule(update)
// .addRule(update1)
// .addRule(load)
// .addRule(clear)
// .addRule(drop)
// .addRule(create)
// .addRule(add)
// .addRule(move)
// .addRule(copy)
// .addRule(insertData)
// .addRule(deleteData)
// .addRule(deleteWhere)
// .addRule(modify)
// .addRule(deleteClause)
// .addRule(insertClause)
// .addRule(usingClause)
// .addRule(graphOrDefault)
// .addRule(graphRef)
// .addRule(graphRefAll)
// .addRule(quadPattern)
// .addRule(quadData)
// .addRule(quads)
// .addRule(quadsNotTriples)
// .addRule(triplesTemplate)
// .addRule(groupGraphPattern)
// .addRule(groupGraphPatternSub)
// .addRule(triplesBlock)
// .addRule(graphPatternNotTriples)
// .addRule(optionalGraphPattern)
// .addRule(graphGraphPattern)
// .addRule(serviceGraphPattern)
// .addRule(bind)
// .addRule(inlineData)
// .addRule(dataBlock)
// .addRule(inlineDataOneVar)
// .addRule(inlineDataFull)
// .addRule(dataBlockValue)
// .addRule(minusGraphPattern)
// .addRule(groupOrUnionGraphPattern)
// .addRule(filter)
// .addRule(constraint)
// .addRule(functionCall)
// .addRule(argList)
// .addRule(expressionList)
// .addRule(constructTemplate)
// .addRule(constructTriples)
// .addRule(triplesSameSubject)
// .addRule(propertyList)
// .addRule(propertyListNotEmpty)
// .addRule(verb)
// .addRule(objectList)
// .addRule(object)
// .addRule(triplesSameSubjectPath)
// .addRule(propertyListPath)
// .addRule(propertyListPathNotEmpty)
// .addRule(verbPath)
// .addRule(verbSimple)
// .addRule(objectListPath)
// .addRule(objectPath)
// .addRule(path)
// .addRule(pathAlternative)
// .addRule(pathSequence)
// .addRule(pathElt)
// .addRule(pathEltOrInverse)
// .addRule(pathMod)
// .addRule(pathPrimary)
// .addRule(pathNegatedPropertySet)
// .addRule(pathOneInPropertySet)
// .addRule(integer)
// .addRule(triplesNode)
// .addRule(blankNodePropertyList)
// .addRule(triplesNodePath)
// .addRule(blankNodePropertyListPath)
// .addRule(collection)
// .addRule(collectionPath)
// .addRule(graphNode)
// .addRule(graphNodePath)
// .addRule(varOrTerm)
// .addRule(varOrIri)
// .addRule(var_)
// .addRule(graphTerm)
// .addRule(expression)
// .addRule(conditionalOrExpression)
// .addRule(conditionalAndExpression)
// .addRule(valueLogical)
// .addRule(relationalExpression)
// .addRule(numericExpression)
// .addRule(additiveExpression)
// .addRule(multiplicativeExpression)
// .addRule(unaryExpression)
// .addRule(primaryExpression)
// .addRule(brackettedExpression)
// .addRule(buildInCall)
// .addRule(regexExpression)
// .addRule(substringExpression)
// .addRule(strReplaceExpression)
// .addRule(existsFunc)
// .addRule(notExistsFunc)
// .addRule(aggregateGroup_concat)
// .addRule(aggregate)
// .addRule(iriOrFunction)
// .addRule(rdfLiteral)
// .addRule(numericLiteral)
// .addRule(numericLiteralUnsigned)
// .addRule(numericLiteralPositive)
// .addRule(numericLiteralNegative)
// .addRule(booleanLiteral)
// .addRule(string)
// .addRule(iri)
// .addRule(prefixedName)
  .addRule(blankNode);

export function build(): void {
  const lexer = ChevSparqlLexer;
  const parser = builder.consume([ l.terminals.blankNodeLabel, l.terminals.anon ]);

  const lexResult = lexer.tokenize('SELECT * WHERE { ?s ?p ?o }');
  parser.input = lexResult.tokens;
}
