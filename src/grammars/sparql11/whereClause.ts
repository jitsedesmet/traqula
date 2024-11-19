import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { builtInCall } from './builtIn';
import { argList, brackettedExpression, expression, type IExpression } from './expression';
import { var_, varOrIri } from './general';
import { booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals';
import { subSelect } from './queryUnit';
import { triplesBlock } from './tripleBlock';

/**
 * [[17]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const whereClause: RuleDef<'whereClause'> = {
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
export const groupGraphPattern: RuleDef<'groupGraphPattern', IExpression> = {
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
export const groupGraphPatternSub: RuleDef<'groupGraphPatternSub'> = {
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
export const graphPatternNotTriples: RuleDef<'graphPatternNotTriples'> = {
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

/**
 * [[57]](https://www.w3.org/TR/sparql11-query/#rOptionalGraphPattern)
 */
export const optionalGraphPattern: RuleDef<'optionalGraphPattern'> = {
  name: 'optionalGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.optional);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[67]](https://www.w3.org/TR/sparql11-query/#rGroupOrUnionGraphPattern)
 */
export const groupOrUnionGraphPattern: RuleDef<'groupOrUnionGraphPattern'> = {
  name: 'groupOrUnionGraphPattern',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(groupGraphPattern);
    MANY(() => {
      CONSUME(l.union);
      SUBRULE2(groupGraphPattern);
    });
  },
};

/**
 * [[58]](https://www.w3.org/TR/sparql11-query/#rGraphGraphPattern)
 */
export const graphGraphPattern: RuleDef<'graphGraphPattern'> = {
  name: 'graphGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.graph);
    SUBRULE(varOrIri);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[59]](https://www.w3.org/TR/sparql11-query/#rServiceGraphPattern)
 */
export const serviceGraphPattern: RuleDef<'serviceGraphPattern'> = {
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

/**
 * [[60]](https://www.w3.org/TR/sparql11-query/#rBind)
 */
export const bind: RuleDef<'bind'> = {
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

/**
 * [[61]](https://www.w3.org/TR/sparql11-query/#rInlineData)
 */
export const inlineData: RuleDef<'inlineData'> = {
  name: 'inlineData',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.values);
    SUBRULE(dataBlock);
  },
};

/**
 * [[62]](https://www.w3.org/TR/sparql11-query/#rDataBlock)
 */
export const dataBlock: RuleDef<'dataBlock'> = {
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

/**
 * [[63]](https://www.w3.org/TR/sparql11-query/#rInlineDataOneVar)
 */
export const inlineDataOneVar: RuleDef<'inlineDataOneVar'> = {
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

/**
 * [[64]](https://www.w3.org/TR/sparql11-query/#rInlineDataFull)
 */
export const inlineDataFull: RuleDef<'inlineDataFull'> = {
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

/**
 * [[65]](https://www.w3.org/TR/sparql11-query/#rDataBlockValue)
 */
export const dataBlockValue: RuleDef<'dataBlockValue'> = {
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

/**
 * [[66]](https://www.w3.org/TR/sparql11-query/#rMinusGraphPattern)
 */
export const minusGraphPattern: RuleDef<'minusGraphPattern'> = {
  name: 'minusGraphPattern',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.minus);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[68]](https://www.w3.org/TR/sparql11-query/#rFilter)
 */
export const filter: RuleDef<'filter'> = {
  name: 'filter',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.filter);
    SUBRULE(constraint);
  },
};

/**
 * [[69]](https://www.w3.org/TR/sparql11-query/#rConstraint)
 */
export const constraint: RuleDef<'constraint'> = {
  name: 'constraint',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(brackettedExpression) },
      { ALT: () => SUBRULE(builtInCall) },
      { ALT: () => SUBRULE(functionCall) },
    ]);
  },
};

/**
 * [[70]](https://www.w3.org/TR/sparql11-query/#rFunctionCall)
 */
export const functionCall: RuleDef<'functionCall'> = {
  name: 'functionCall',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
    SUBRULE(argList);
  },
};
