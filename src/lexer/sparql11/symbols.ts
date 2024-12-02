import { createToken } from './helpers.js';

export const LCurly = createToken({ name: 'LCurly', pattern: '{', label: '{' });
export const RCurly = createToken({ name: 'RCurly', pattern: '}', label: '}' });
export const dot = createToken({ name: 'Dot', pattern: '.', label: '.' });
export const comma = createToken({ name: 'Comma', pattern: ',', label: ',' });
export const semi = createToken({ name: 'Semi', pattern: ';', label: ';' });
export const LParen = createToken({ name: 'LParen', pattern: '(', label: '(' });
export const RParen = createToken({ name: 'RParen', pattern: ')', label: ')' });
export const LSquare = createToken({ name: 'LSquare', pattern: '[', label: '[' });
export const RSquare = createToken({ name: 'RSquare', pattern: ']', label: ']' });
export const pipe = createToken({ name: 'Pipe', pattern: '|', label: '|' });
export const slash = createToken({ name: 'Slash', pattern: '/', label: '/' });
export const hat = createToken({ name: 'Hat', pattern: '^', label: '^' });
export const question = createToken({ name: 'Question', pattern: '?', label: '?' });
export const star = createToken({ name: 'Star', pattern: '*', label: '*' });
export const plus = createToken({ name: 'Plus', pattern: '+', label: '+' });
export const minus_ = createToken({ name: 'Minus', pattern: '-', label: '-' });
export const exclamation = createToken({ name: 'Exclamation', pattern: '!', label: '!' });
export const logicAnd = createToken({ name: 'LogicAnd', pattern: '&&', label: '&&' });
export const logicOr = createToken({ name: 'LogicOr', pattern: '||', label: '||' });
export const equal = createToken({ name: 'Equal', pattern: '=', label: '=' });
export const notEqual = createToken({ name: 'NotEqual', pattern: '!=', label: '!=' });
export const lessThan = createToken({ name: 'LessThan', pattern: '<', label: '<' });
export const greaterThan = createToken({ name: 'GreaterThan', pattern: '>', label: '>' });
export const lessThanEqual = createToken({ name: 'LessThanEqual', pattern: '<=', label: '<=' });
export const greaterThanEqual = createToken({ name: 'GreaterThanEqual', pattern: '>=', label: '>=' });
export const hathat = createToken({ name: 'Hathat', pattern: '^^', label: '^^' });

export const allSymbols = [
  LCurly,
  RCurly,
  dot,
  comma,
  semi,
  LParen,
  RParen,
  LSquare,
  RSquare,
  pipe,
  slash,
  hat,
  question,
  star,
  plus,
  minus_,
  exclamation,
  logicAnd,
  logicOr,
  equal,
  notEqual,
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
  hathat,
];
