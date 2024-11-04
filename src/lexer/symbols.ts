import { createToken } from 'chevrotain';

export const LCurly = createToken({ name: 'LCurly', pattern: '{' });
export const RCurly = createToken({ name: 'RCurly', pattern: '}' });
export const dot = createToken({ name: 'Dot', pattern: '.' });
export const comma = createToken({ name: 'Comma', pattern: ',' });
export const semi = createToken({ name: 'Semi', pattern: ';' });
export const LParen = createToken({ name: 'LParen', pattern: '(' });
export const RParen = createToken({ name: 'RParen', pattern: ')' });
export const LSquare = createToken({ name: 'LSquare', pattern: '[' });
export const RSquare = createToken({ name: 'RSquare', pattern: ']' });
export const pipe = createToken({ name: 'Pipe', pattern: '|' });
export const slash = createToken({ name: 'Slash', pattern: '/' });
export const hat = createToken({ name: 'Hat', pattern: '^' });
export const question = createToken({ name: 'Question', pattern: '?' });
export const star = createToken({ name: 'Star', pattern: '*' });
export const plus = createToken({ name: 'Plus', pattern: '+' });
export const minus_ = createToken({ name: 'Minus', pattern: '-' });
export const exclamation = createToken({ name: 'Exclamation', pattern: '!' });
export const logicAnd = createToken({ name: 'LogicAnd', pattern: '&&' });
export const logicOr = createToken({ name: 'LogicOr', pattern: '||' });
export const equal = createToken({ name: 'Equal', pattern: '=' });
export const notEqual = createToken({ name: 'NotEqual', pattern: '!=' });
export const lessThan = createToken({ name: 'LessThan', pattern: '<' });
export const greaterThan = createToken({ name: 'GreaterThan', pattern: '>' });
export const lessThanEqual = createToken({ name: 'LessThanEqual', pattern: '<=' });
export const greaterThanEqual = createToken({ name: 'GreaterThanEqual', pattern: '>=' });
export const hathat = createToken({ name: 'Hathat', pattern: '^^' });

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
