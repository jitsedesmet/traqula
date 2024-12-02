import type { TokenType } from 'chevrotain';
import * as l from '../lexer/sparql11/index.js';
import { Wildcard } from '../misc/Wildcard.js';
import type { RuleDef } from './parserBuilder.js';
import { expression, expressionList } from './sparql11/expression.js';
import { var_ } from './sparql11/general.js';
import { groupGraphPattern } from './sparql11/whereClause.js';
import type { Expression, Pattern, VariableTerm } from './sparqlJSTypes.js';

export function unCapitalize<T extends string>(str: T): Uncapitalize<T> {
  return <Uncapitalize<T>> (str.charAt(0).toLowerCase() + str.slice(1));
}

export interface IExpressionFunctionX<T extends string, U extends (Expression | Pattern)[]> {
  type: 'operation';
  operator: T;
  args: U;
}
export type RuleDefExpressionFunctionX<T extends string, U extends (Expression | Pattern)[]>
  = RuleDef<T, IExpressionFunctionX<T, U>>;

export function funcExpr1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg = SUBRULE(expression);
      CONSUME(l.symbols.RParen);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args: [ arg ],
      };
    },
  };
}

export function funcExpr2<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression, Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE1, SUBRULE2, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg1 = SUBRULE1(expression);
      CONSUME(l.symbols.comma);
      const arg2 = SUBRULE2(expression);
      CONSUME(l.symbols.RParen);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args: [ arg1, arg2 ],
      };
    },
  };
}

export function funcVar1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [VariableTerm]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg = SUBRULE(var_);
      CONSUME(l.symbols.RParen);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args: [ arg ],
      };
    },
  };
}

export function funcExprOrNil1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [] | [Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, OR, SUBRULE }) => () => {
      CONSUME(func);
      const args = OR<[] | [Expression]>([
        {
          ALT: () => {
            CONSUME(l.symbols.LParen);
            const arg = SUBRULE(expression);
            CONSUME(l.symbols.RParen);
            return [ arg ];
          },
        },
        {
          ALT: () => {
            CONSUME(l.terminals.nil);
            return [];
          },
        },
      ]);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args,
      };
    },
  };
}

export function funcNil1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, []> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.terminals.nil);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args: [],
      };
    },
  };
}

export function funcExprList1<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, Expression[]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE }) => () => {
      CONSUME(func);
      const args = SUBRULE(expressionList);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args,
      };
    },
  };
}

export function funcExpr2or3<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<Uncapitalize<T>, [Expression, Expression] | [Expression, Expression, Expression]> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, CONSUME1, OPTION, CONSUME2 }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg1 = SUBRULE1(expression);
      CONSUME1(l.symbols.comma);
      const arg2 = SUBRULE2(expression);
      const arg3 = OPTION(() => {
        CONSUME2(l.symbols.comma);
        return SUBRULE3(expression);
      });
      CONSUME(l.symbols.RParen);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args: arg3 ? [ arg1, arg2, arg3 ] : [ arg1, arg2 ],
      };
    },
  };
}

export function funcExpr3or4<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<
  Uncapitalize<T>,
  [Expression, Expression, Expression] | [Expression, Expression, Expression, Expression]
> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE1, SUBRULE2, SUBRULE3, CONSUME1, OPTION, CONSUME2, SUBRULE4, CONSUME3 }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      const arg1 = SUBRULE1(expression);
      CONSUME1(l.symbols.comma);
      const arg2 = SUBRULE2(expression);
      CONSUME2(l.symbols.comma);
      const arg3 = SUBRULE3(expression);
      const arg4 = OPTION(() => {
        CONSUME3(l.symbols.comma);
        return SUBRULE4(expression);
      });
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args: arg4 ? [ arg1, arg2, arg3, arg4 ] : [ arg1, arg2, arg3 ],
      };
    },
  };
}

export function funcGroupGraphPattern<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionFunctionX<
    Uncapitalize<T>,
    Pattern[]
  > {
  return {
    name: unCapitalize(func.name),
    impl: ({ SUBRULE, CONSUME }) => () => {
      CONSUME(func);
      const args = SUBRULE(groupGraphPattern);
      return {
        type: 'operation',
        operator: unCapitalize(func.name),
        args,
      };
    },
  };
}

export interface IExpressionAggregator<T extends string> {
  type: 'aggregate';
  expression: Expression | Wildcard;
  aggregation: T;
  separator: string | undefined;
}
export type RuleDefExpressionAggregatorX<T extends string> = RuleDef<T, IExpressionAggregator<T>>;
export function baseAggregateFunc<T extends string>(func: TokenType & { name: T }):
RuleDefExpressionAggregatorX<Uncapitalize<T>> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE, OPTION, OR }) => () => {
      CONSUME(func);
      CONSUME(l.symbols.LParen);
      const distinct = Boolean(OPTION(() => CONSUME(l.distinct)));
      const expressionVal = OR<Expression | Wildcard>([
        {
          ALT: () => {
            CONSUME(l.symbols.star);
            return new Wildcard();
          },
        },
        { ALT: () => SUBRULE(expression) },
      ]);
      CONSUME(l.symbols.RParen);
      return {
        type: 'aggregate',
        aggregation: unCapitalize(func.name),
        expression: expressionVal,
        distinct,
        separator: undefined,
      };
    },
  };
}
