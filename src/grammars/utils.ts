import type { TokenType } from 'chevrotain';
import * as l from '../lexer/index';
import type { RuleDef } from './buildExample';
import { expression, expressionList } from './sparql11/expression';
import { var_ } from './sparql11/general';

export function unCapitalize<T extends string>(str: T): Uncapitalize<T> {
  return <Uncapitalize<T>> (str.charAt(0).toLowerCase() + str.slice(1));
}

export function exprFunc1<T extends string>(func: TokenType & { name: T }): RuleDef<Uncapitalize<T>> {
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

export function exprFunc2<T extends string>(func: TokenType & { name: T }): RuleDef<Uncapitalize<T>> {
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

export function varFunc1<T extends string>(func: TokenType & { name: T }): RuleDef<Uncapitalize<T>> {
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

export function exprOrNilFunc1<T extends string>(func: TokenType & { name: T }): RuleDef<Uncapitalize<T>> {
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

export function nilFunc1<T extends string>(func: TokenType & { name: T }): RuleDef<Uncapitalize<T>> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME }) => () => {
      CONSUME(func);
      CONSUME(l.terminals.nil);
    },
  };
}

export function exprListFunc1<T extends string>(func: TokenType & { name: T }): RuleDef<Uncapitalize<T>> {
  return {
    name: unCapitalize(func.name),
    impl: ({ CONSUME, SUBRULE }) => () => {
      CONSUME(func);
      SUBRULE(expressionList);
    },
  };
}

export function baseAggregateFunc<T extends string>(func: TokenType & { name: T }):
RuleDef<Uncapitalize<T>> {
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
