import type { NamedNode } from 'rdf-data-factory';
import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import type { Expression } from '../sparqlJSTypes';
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
  args: any[];
  distinct: boolean;
}

export type Operation = '||' | '&&' | RelationalOperator | AdditiveOperator | aggregatorOperator | buildInOperator;
export type RelationalOperator = '=' | '!=' | '<' | '>' | '<=' | '>=' | 'IN' | 'NOT IN';
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
        const distinct = OPTION(() => {
          CONSUME(l.distinct);
          return true;
        }) ?? false;

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
  impl: ({ SUBRULE }) => () => {
    SUBRULE(conditionalOrExpression);
  },
};

/**
 * [[111]](https://www.w3.org/TR/sparql11-query/#rConditionalOrExpression)
 */
export const conditionalOrExpression: RuleDef<'conditionalOrExpression'> = {
  name: 'conditionalOrExpression',
  impl: ({ MANY_SEP, SUBRULE }) => () => {
    MANY_SEP({
      DEF: () => SUBRULE(conditionalAndExpression),
      SEP: l.symbols.logicOr,
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
export const iriOrFunction: RuleDef<'iriOrFunction', { iri: NamedNode; argList: ArgList | undefined }> = {
  name: 'iriOrFunction',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(iri);
    OPTION(() => {
      SUBRULE(argList);
    });
  },
};
