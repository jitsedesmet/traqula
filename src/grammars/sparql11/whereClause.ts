import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { builtInCall } from './builtIn';
import { brackettedExpression, expression } from './expression';
import { booleanLiteral, iri, numericLiteral, rdfLiteral, var_, varOrIri } from './general';
import { subSelect } from './queryUnit';
import { triplesBlock } from './tripleBlock';

/**
 * [[17]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const whereClause: RuleDef & { name: 'whereClause' } = {
  name: 'whereClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.where);
    });
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[53]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPattern)
 */
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

/**
 * [[54]](https://www.w3.org/TR/sparql11-query/#rGroupGraphPatternSub)
 */
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

/**
 * [[56]](https://www.w3.org/TR/sparql11-query/#rGraphPatternNotTriples)
 */
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
      {
        ALT: () => {
          SUBRULE(inlineDataOneVar);
        },
      },
      {
        ALT: () => {
          SUBRULE(inlineDataFull);
        },
      },
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
      {
        ALT: () => {
          CONSUME1(l.terminals.nil);
        },
      },
      {
        ALT: () => {
          CONSUME1(l.symbols.LParen);
          MANY1(() => {
            SUBRULE(var_);
          });
          CONSUME1(l.symbols.RParen);
        },
      },
    ]);
    CONSUME(l.symbols.LCurly);
    MANY2(() => {
      OR2([
        {
          ALT: () => {
            CONSUME2(l.symbols.LParen);
            MANY3(() => {
              SUBRULE(dataBlockValue);
            });
            CONSUME2(l.symbols.RParen);
          },
        },
        {
          ALT: () => {
            CONSUME2(l.terminals.nil);
          },
        },
      ]);
    });
    CONSUME(l.symbols.RCurly);
  },
};
export const dataBlockValue: RuleDef & { name: 'dataBlockValue' } = {
  name: 'dataBlockValue',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(iri) },
      { ALT: () => SUBRULE(rdfLiteral) },
      { ALT: () => SUBRULE(numericLiteral) },
      { ALT: () => SUBRULE(booleanLiteral) },
      { ALT: () => CONSUME(l.undef) },
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
      {
        ALT: () => {
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
        },
      },
    ]);
  },
};