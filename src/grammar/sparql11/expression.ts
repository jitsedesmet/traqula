import * as l from '../../lexer/sparql11/index';
import type { CstDef, RuleDef } from '../parserBuilder';
import type { Expression, IriTerm } from '../sparqlJSTypes';
import { builtInCall } from './builtIn';
import {
  var_,
} from './general';
import {
  booleanLiteral,
  iri,
  numericLiteral,
  numericLiteralNegative,
  numericLiteralPositive,
  rdfLiteral,
} from './literals';

/**
 * [[71]](https://www.w3.org/TR/sparql11-query/#rArgList)
 */
export interface IArgList {
  type: 'functionCall';
  args: Expression[];
  distinct: boolean;
}

export type Operation = '||' | '&&' | RelationalOperator | AdditiveOperator | aggregatorOperator | buildInOperator;
export type RelationalOperator = '=' | '!=' | '<' | '>' | '<=' | '>=' | 'in' | 'notin';
export type AdditiveOperator = '+' | '-' | '*' | '/';
export type unaryOperator = '!' | '+' | '-';
export type buildInOperator = 'STR' | 'LANG' | 'LANGMATCHES' | 'DATATYPE' | 'BOUND' | 'IRI' | 'URI' | 'BNODE' |
  'RAND' | 'ABS' | 'CEIL' | 'FLOOR' | 'ROUND' | 'CONCAT' | 'STRLEN' | 'UCASE' | 'LCASE' | 'ENCODE_FOR_URI' |
  'CONTAINS' | 'STRSTARTS' | 'STRENDS' | 'STRBEFORE' | 'STRAFTER' | 'YEAR' | 'MONTH' | 'DAY' | 'HOURS' | 'MINUTES' |
  'SECONDS' | 'TIMEZONE' | 'TZ' | 'NOW' | 'UUID' | 'STRUUID' | 'MD5' | 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512' |
  'COALESCE' | 'IF' | 'STRLANG' | 'STRDT' | 'sameTerm' | 'isIRI' | 'isURI' | 'isBLANK' | 'isLITERAL' | 'isNUMERIC' |
  'REGEX' | 'SUBSTR' | 'REPLACE' | 'EXISTS' | 'NOT EXISTS';
export type aggregatorOperator = 'COUNT' | 'SUM' | 'MIN' | 'MAX' | 'AVG' | 'SAMPLE' | 'GROUP_CONCAT';
export interface IExpression {

}

export const argList: RuleDef<'argList', IArgList> = {
  name: 'argList',
  impl: ({ CONSUME, SUBRULE1, OPTION, OR, MANY_SEP }) => () => OR([
    {
      ALT: () => {
        CONSUME(l.terminals.nil);
        return {
          type: 'functionCall',
          args: [],
          distinct: false,
        };
      },
    },
    {
      ALT: () => {
        const args: Expression[] = [];
        CONSUME(l.symbols.LParen);
        const distinct = Boolean(OPTION(() => CONSUME(l.distinct)));

        MANY_SEP({
          DEF: () => args.push(SUBRULE1(expression)),
          SEP: l.symbols.comma,
        });
        CONSUME(l.symbols.RParen);

        return {
          type: 'functionCall',
          args,
          distinct,
        };
      },
    },
  ]),
};

export const expressionList: RuleDef<'expressionList', Expression[]> = {
  name: 'expressionList',
  impl: ({ CONSUME, SUBRULE, MANY_SEP, OR }) => () => OR([
    {
      ALT: () => {
        CONSUME(l.terminals.nil);
        return [];
      },
    },
    {
      ALT: () => {
        const args: Expression[] = [];
        CONSUME(l.symbols.LParen);
        MANY_SEP({
          SEP: l.symbols.comma,
          DEF: () => {
            args.push(SUBRULE(expression));
          },
        });
        CONSUME(l.symbols.RParen);
        return args;
      },
    },
  ]),
};

/**
 * [[110]](https://www.w3.org/TR/sparql11-query/#rExpression)
 */
export const expression: RuleDef<'expression', Expression> = {
  name: 'expression',
  impl: ({ SUBRULE }) => () => SUBRULE(conditionalOrExpression),
};

interface LeftDeepBuildArgs<T extends string = string> {
  expr: Expression;
  operator: T;
}

function constructLeftDeep<T extends string = string>(
  startGenerator: () => Expression,
  restGenerator: () => LeftDeepBuildArgs<T>,
  ACTION: CstDef['ACTION'],
  MANY: CstDef['MANY'],
): Expression {
// By using iterExpression, we avoid creating unnecessary arrays
  let iterExpr = startGenerator();
  MANY(() => {
    const res = restGenerator();
    ACTION(() => {
      iterExpr = {
        type: 'operation',
        operator: res.operator,
        args: [ iterExpr, res.expr ],
      };
    });
  });
  return iterExpr;
}

/**
 * [[111]](https://www.w3.org/TR/sparql11-query/#rConditionalOrExpression)
 */
export const conditionalOrExpression: RuleDef<'conditionalOrExpression', Expression> = {
  name: 'conditionalOrExpression',
  impl: ({ ACTION, MANY, CONSUME, SUBRULE1, SUBRULE2 }) => () =>
    constructLeftDeep(() => SUBRULE1(conditionalAndExpression), () => {
      CONSUME(l.symbols.logicOr);
      return {
        expr: SUBRULE2(conditionalAndExpression),
        operator: '||',
      };
    }, ACTION, MANY)
  ,
};

/**
 * [[112]](https://www.w3.org/TR/sparql11-query/#rConditionalAndExpression)
 */
export const conditionalAndExpression: RuleDef<'conditionalAndExpression', Expression> = {
  name: 'conditionalAndExpression',
  impl: ({ ACTION, MANY, SUBRULE1, SUBRULE2, CONSUME }) => () => constructLeftDeep(
    () => SUBRULE1(valueLogical),
    () => {
      CONSUME(l.symbols.logicAnd);
      return {
        expr: SUBRULE2(valueLogical),
        operator: '&&',
      };
    },
    ACTION,
    MANY,
  ),
};

/**
 * [[113]](https://www.w3.org/TR/sparql11-query/#rValueLogical)
 */
export const valueLogical: RuleDef<'valueLogical', Expression> = {
  name: 'valueLogical',
  impl: ({ SUBRULE }) => () => SUBRULE(relationalExpression),
};

/**
 * [[114]](https://www.w3.org/TR/sparql11-query/#rRelationalExpression)
 */
export const relationalExpression: RuleDef<'relationalExpression', Expression> = {
  name: 'relationalExpression',
  impl: ({ ACTION, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR, SUBRULE3, SUBRULE4, SUBRULE5, SUBRULE6, SUBRULE7 }) => () => {
    const args1 = SUBRULE1(numericExpression);
    const arg2 = OPTION(() => OR<{ operator: RelationalOperator; args: Expression[] }>([
      {
        ALT: () => {
          CONSUME(l.symbols.equal);
          const expr = SUBRULE2(numericExpression);
          return { operator: '=', args: [ expr ]};
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.notEqual);
          const expr = SUBRULE3(numericExpression);
          return { operator: '!=', args: [ expr ]};
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.lessThan);
          const expr = SUBRULE4(numericExpression);
          return { operator: '<', args: [ expr ]};
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.greaterThan);
          const expr = SUBRULE5(numericExpression);
          return { operator: '>', args: [ expr ]};
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.lessThanEqual);
          const expr = SUBRULE6(numericExpression);
          return { operator: '<=', args: [ expr ]};
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.greaterThanEqual);
          const expr = SUBRULE7(numericExpression);
          return { operator: '>=', args: [ expr ]};
        },
      },
      {
        ALT: () => {
          CONSUME(l.in_);
          const args = SUBRULE1(expressionList);
          return { operator: 'in', args };
        },
      },
      {
        ALT: () => {
          CONSUME(l.notIn);
          const args = SUBRULE2(expressionList);
          return { operator: 'notin', args };
        },
      },
    ]));
    if (!arg2) {
      return args1;
    }
    return ACTION(() => ({
      type: 'operation',
      operator: arg2.operator,
      args: [ args1, ...arg2.args ],
    }));
  },
};

/**
 * [[115]](https://www.w3.org/TR/sparql11-query/#rNumericExpression)
 */
export const numericExpression: RuleDef<'numericExpression', Expression> = {
  name: 'numericExpression',
  impl: ({ SUBRULE }) => () => SUBRULE(additiveExpression),
};

/**
 * [[116]](https://www.w3.org/TR/sparql11-query/#rAdditiveExpression)
 */
export const additiveExpression: RuleDef<'additiveExpression', Expression> = {
  name: 'additiveExpression',
  impl: ({ ACTION, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, MANY1, MANY2, OR1, OR2, OR3 }) => () =>
    constructLeftDeep(
      () => SUBRULE1(multiplicativeExpression),
      () => OR1([
        {
          ALT: () => {
            CONSUME(l.symbols.plus);
            return {
              operator: '+',
              expr: SUBRULE2(multiplicativeExpression),
            };
          },
        },
        {
          ALT: () => {
            CONSUME(l.symbols.minus_);
            return {
              operator: '-',
              expr: SUBRULE3(multiplicativeExpression),
            };
          },
        },
        {
          ALT: () => {
            // The operator of this alternative is actually parsed as part of the signed numeric literal. (note #6)
            const { operator, args } = OR2([
              {
                ALT: () => {
                  // Note #6. No spaces are allowed between the sign and a number.
                  // In this rule however, we do not want to care about this.
                  const integer = SUBRULE(numericLiteralPositive);
                  return {
                    operator: '+',
                    args: [ integer ],
                  };
                },
              },
              {
                ALT: () => {
                  const integer = SUBRULE(numericLiteralNegative);
                  return ACTION(() => {
                    integer.value = integer.value.replace(/^(-)/u, '');
                    return {
                      operator: '-',
                      args: [ integer ],
                    };
                  });
                },
              },
            ]);
            const expr = constructLeftDeep(
              () => ACTION(() => args[0]),
              () => OR3<{ expr: Expression; operator: string }>([
                {
                  ALT: () => {
                    CONSUME(l.symbols.star);
                    const expr = SUBRULE1(unaryExpression);
                    return {
                      operator: '*',
                      expr,
                    };
                  },
                },
                {
                  ALT: () => {
                    CONSUME(l.symbols.slash);
                    const expr = SUBRULE2(unaryExpression);
                    return {
                      operator: '/',
                      expr,
                    };
                  },
                },
              ]),
              ACTION,
              MANY2,
            );
            return {
              operator,
              expr,
            };
          },
        },
      ]),
      ACTION,
      MANY1,
    ),
};

/**
 * [[117]](https://www.w3.org/TR/sparql11-query/#rMultiplicativeExpression)
 */
export const multiplicativeExpression: RuleDef<'multiplicativeExpression', Expression> = {
  name: 'multiplicativeExpression',
  impl: ({ ACTION, CONSUME, MANY, SUBRULE1, SUBRULE2, SUBRULE3, OR }) => () => constructLeftDeep(
    () => SUBRULE1(unaryExpression),
    () => OR<LeftDeepBuildArgs>([
      {
        ALT: () => {
          CONSUME(l.symbols.star);
          const expr = SUBRULE2(unaryExpression);
          return {
            operator: '*',
            expr,
          };
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.slash);
          const expr = SUBRULE3(unaryExpression);
          return {
            operator: '/',
            expr,
          };
        },
      },
    ]),
    ACTION,
    MANY,
  ),
};

/**
 * [[118]](https://www.w3.org/TR/sparql11-query/#rUnaryExpression)
 */
export const unaryExpression: RuleDef<'unaryExpression', Expression> = {
  name: 'unaryExpression',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, SUBRULE4, OR }) => () => OR<Expression>([
    {
      ALT: () => {
        CONSUME(l.symbols.exclamation);
        const expr = SUBRULE1(primaryExpression);
        return {
          type: 'operation',
          operator: '!',
          args: [ expr ],
        };
      },
    },
    {
      ALT: () => {
        CONSUME(l.symbols.plus);
        const expr = SUBRULE2(primaryExpression);
        return {
          type: 'operation',
          operator: '+',
          args: [ expr ],
        };
      },
    },
    {
      ALT: () => {
        CONSUME(l.symbols.minus_);
        const expr = SUBRULE3(primaryExpression);
        return {
          type: 'operation',
          operator: '-',
          args: [ expr ],
        };
      },
    },
    { ALT: () => SUBRULE4(primaryExpression) },
  ]),
};

/**
 * [[119]](https://www.w3.org/TR/sparql11-query/#rPrimaryExpression)
 */
export const primaryExpression: RuleDef<'primaryExpression', Expression> = {
  name: 'primaryExpression',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(brackettedExpression) },
    { ALT: () => SUBRULE(builtInCall) },
    { ALT: () => SUBRULE(iriOrFunction) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(var_) },
  ]),
};

/**
 * [[120]](https://www.w3.org/TR/sparql11-query/#rBrackettedExpression)
 */
export const brackettedExpression: RuleDef<'brackettedExpression', Expression> = {
  name: 'brackettedExpression',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    const expr = SUBRULE(expression);
    CONSUME(l.symbols.RParen);

    return expr;
  },
};

/**
 * [[128]](https://www.w3.org/TR/sparql11-query/#ririOrFunction)
 */
export const iriOrFunction: RuleDef<'iriOrFunction', IriTerm | (IArgList & { function: IriTerm })> = {
  name: 'iriOrFunction',
  impl: ({ SUBRULE, OPTION }) => () => {
    const iriVal = SUBRULE(iri);
    const args = OPTION(() => SUBRULE(argList));
    return args ?
        {
          ...args,
          function: iriVal,
        } :
      iriVal;
  },
};