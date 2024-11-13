import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { builtInCall } from './builtIn';
import {
  booleanLiteral,
  iri,
  numericLiteral,
  numericLiteralNegative,
  numericLiteralPositive,
  rdfLiteral,
  var_,
} from './general';

/**
 * [[71]](https://www.w3.org/TR/sparql11-query/#rArgList)
 */
export const argList: RuleDef<'argList'> = {
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

export const expressionList: RuleDef<'expressionList'> = {
  name: 'expressionList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.terminals.nil) },
      {
        ALT: () => {
          CONSUME(l.symbols.LParen);
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

/**
 * [[110]](https://www.w3.org/TR/sparql11-query/#rExpression)
 */
export const expression: RuleDef<'expression'> = {
  name: 'expression',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(conditionalOrExpression);
  },
};

/**
 * [[111]](https://www.w3.org/TR/sparql11-query/#rConditionalOrExpression)
 */
export const conditionalOrExpression: RuleDef<'conditionalOrExpression'> = {
  name: 'conditionalOrExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(conditionalAndExpression);
    MANY(() => {
      CONSUME(l.symbols.logicOr);
      SUBRULE2(conditionalAndExpression);
    });
  },
};

/**
 * [[112]](https://www.w3.org/TR/sparql11-query/#rConditionalAndExpression)
 */
export const conditionalAndExpression: RuleDef<'conditionalAndExpression'> = {
  name: 'conditionalAndExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(valueLogical);
    MANY(() => {
      CONSUME(l.symbols.logicAnd);
      SUBRULE2(valueLogical);
    });
  },
};

/**
 * [[113]](https://www.w3.org/TR/sparql11-query/#rValueLogical)
 */
export const valueLogical: RuleDef<'valueLogical'> = {
  name: 'valueLogical',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(relationalExpression);
  },
};

/**
 * [[114]](https://www.w3.org/TR/sparql11-query/#rRelationalExpression)
 */
export const relationalExpression: RuleDef<'relationalExpression'> = {
  name: 'relationalExpression',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OPTION, OR, SUBRULE3, SUBRULE4, SUBRULE5, SUBRULE6, SUBRULE7 }) => () => {
    SUBRULE1(numericExpression);
    OPTION(() => {
      OR([
        {
          ALT: () => {
            CONSUME(l.symbols.equal);
            SUBRULE2(numericExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.notEqual);
            SUBRULE3(numericExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.lessThan);
            SUBRULE4(numericExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.greaterThan);
            SUBRULE5(numericExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.lessThanEqual);
            SUBRULE6(numericExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.greaterThanEqual);
            SUBRULE7(numericExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.in_);
            SUBRULE1(expressionList);
          },
        },
        {
          ALT: () => {
            CONSUME(l.notIn);
            SUBRULE2(expressionList);
          },
        },
      ]);
    });
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql11-query/#rNumericExpression)
 */
export const numericExpression: RuleDef<'numericExpression'> = {
  name: 'numericExpression',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(additiveExpression);
  },
};

/**
 * [[116]](https://www.w3.org/TR/sparql11-query/#rAdditiveExpression)
 */
export const additiveExpression: RuleDef<'additiveExpression'> = {
  name: 'additiveExpression',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, MANY1, MANY2, OR1, OR2, OR3 }) => () => {
    SUBRULE1(multiplicativeExpression);
    MANY1(() => {
      OR1([
        {
          ALT: () => {
            CONSUME(l.symbols.plus);
            SUBRULE2(multiplicativeExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.minus_);
            SUBRULE3(multiplicativeExpression);
          },
        },
        {
          ALT: () => {
            OR2([
              { ALT: () => SUBRULE(numericLiteralPositive) },
              { ALT: () => SUBRULE(numericLiteralNegative) },
            ]);
            MANY2(() => {
              OR3([
                {
                  ALT: () => {
                    CONSUME(l.symbols.star);
                    SUBRULE1(unaryExpression);
                  },
                },
                {
                  ALT: () => {
                    CONSUME(l.symbols.slash);
                    SUBRULE2(unaryExpression);
                  },
                },
              ]);
            });
          },
        },
      ]);
    });
  },
};

/**
 * [[117]](https://www.w3.org/TR/sparql11-query/#rMultiplicativeExpression)
 */
export const multiplicativeExpression: RuleDef<'multiplicativeExpression'> = {
  name: 'multiplicativeExpression',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, SUBRULE3, OR }) => () => {
    SUBRULE1(unaryExpression);
    MANY(() => {
      OR([
        {
          ALT: () => {
            CONSUME(l.symbols.star);
            SUBRULE2(unaryExpression);
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.slash);
            SUBRULE3(unaryExpression);
          },
        },
      ]);
    });
  },
};

/**
 * [[118]](https://www.w3.org/TR/sparql11-query/#rUnaryExpression)
 */
export const unaryExpression: RuleDef<'unaryExpression'> = {
  name: 'unaryExpression',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, SUBRULE4, OR }) => () => {
    OR([
      {
        ALT: () => {
          CONSUME(l.symbols.exclamation);
          SUBRULE1(primaryExpression);
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.plus);
          SUBRULE2(primaryExpression);
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.minus_);
          SUBRULE3(primaryExpression);
        },
      },
      { ALT: () => SUBRULE4(primaryExpression) },
    ]);
  },
};

/**
 * [[119]](https://www.w3.org/TR/sparql11-query/#rPrimaryExpression)
 */
export const primaryExpression: RuleDef<'primaryExpression'> = {
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

/**
 * [[120]](https://www.w3.org/TR/sparql11-query/#rBrackettedExpression)
 */
export const brackettedExpression: RuleDef<'brackettedExpression'> = {
  name: 'brackettedExpression',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    SUBRULE(expression);
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[128]](https://www.w3.org/TR/sparql11-query/#ririOrFunction)
 */
export const iriOrFunction: RuleDef<'iriOrFunction'> = {
  name: 'iriOrFunction',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(iri);
    OPTION(() => {
      SUBRULE(argList);
    });
  },
};
