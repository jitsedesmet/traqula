import type { TokenType } from 'chevrotain';
import { createToken, Lexer } from 'chevrotain';
import { allBuiltInCalls } from './BuildinCalls';
import { allGraphTokens } from './graph';
import { allSymbols } from './symbols';
import { allTerminals } from './terminals';

export const baseDecl = createToken({ name: 'BaseDecl', pattern: 'base' });
export const prefixDecl = createToken({ name: 'PrefixDecl', pattern: 'prefix' });
export const select = createToken({ name: 'Select', pattern: 'SELECT' });
export const distinct = createToken({ name: 'Distinct', pattern: 'DISTINCT' });
export const reduced = createToken({ name: 'Reduced', pattern: 'REDUCED' });
export const as = createToken({ name: 'As', pattern: 'AS' });
export const construct = createToken({ name: 'Construct', pattern: 'CONSTRUCT' });
export const describe = createToken({ name: 'Describe', pattern: 'DESCRIBE' });
export const ask = createToken({ name: 'Ask', pattern: 'ASK' });
export const from = createToken({ name: 'From', pattern: 'FROM' });
export const where = createToken({ name: 'Where', pattern: 'WHERE' });
export const groupBy = createToken({ name: 'GroupBy', pattern: 'GROUP BY' });
export const having = createToken({ name: 'Having', pattern: 'HAVING' });
export const order = createToken({ name: 'Order', pattern: 'ORDER BY' });
export const orderAsc = createToken({ name: 'OrderAsc', pattern: 'ASC' });
export const orderDesc = createToken({ name: 'OrderDesc', pattern: 'DESC' });
export const limit = createToken({ name: 'Limit', pattern: 'LIMIT' });
export const offset = createToken({ name: 'Offset', pattern: 'OFFSET' });
export const values = createToken({ name: 'Values', pattern: 'VALUES' });
export const load = createToken({ name: 'Load', pattern: 'LOAD' });
export const silent = createToken({ name: 'Silent', pattern: 'SILENT' });
export const loadInto = createToken({ name: 'LoadInto', pattern: 'INTO' });
export const clear = createToken({ name: 'Clear', pattern: 'CLEAR' });
export const drop = createToken({ name: 'Drop', pattern: 'DROP' });
export const create = createToken({ name: 'Create', pattern: 'CREATE' });
export const add = createToken({ name: 'Add', pattern: 'ADD' });
export const to = createToken({ name: 'To', pattern: 'TO' });
export const move = createToken({ name: 'Move', pattern: 'MOVE' });
export const copy = createToken({ name: 'Copy', pattern: 'COPY' });
export const insertData = createToken({ name: 'InsertData', pattern: 'INSERT DATA' });
export const deleteData = createToken({ name: 'DeleteData', pattern: 'DELETE DATA' });
export const deleteWhere = createToken({ name: 'DeleteWhere', pattern: 'DELETE WHERE' });
export const modifyWith = createToken({ name: 'ModifyWith', pattern: 'WITH' });
export const deleteClause = createToken({ name: 'DeleteClause', pattern: 'DELETE' });
export const insertClause = createToken({ name: 'InsertClause', pattern: 'INSERT' });
export const usingClause = createToken({ name: 'UsingClause', pattern: 'USING' });
export const optional = createToken({ name: 'Optional', pattern: 'OPTIONAL' });
export const service = createToken({ name: 'Service', pattern: 'SERVICE' });
export const bind = createToken({ name: 'Bind', pattern: 'BIND' });
export const undef = createToken({ name: 'Undef', pattern: 'UNDEF' });
export const minus = createToken({ name: 'Minus', pattern: 'MINUS' });
export const union = createToken({ name: 'Union', pattern: 'UNION' });
export const filter = createToken({ name: 'Filter', pattern: 'FILTER' });
export const a = createToken({ name: 'a', pattern: 'a' });
export const true_ = createToken({ name: 'True', pattern: 'true' });
export const false_ = createToken({ name: 'False', pattern: 'false' });
export const in_ = createToken({ name: 'In', pattern: 'IN' });
export const notIn = createToken({ name: 'NotIn', pattern: 'NOT IN' });
export const separator = createToken({ name: 'Separator', pattern: 'SEPARATOR' });

export const allBaseTokens: TokenType[] = [
  baseDecl,
  prefixDecl,
  select,
  distinct,
  reduced,
  as,
  construct,
  describe,
  ask,
  from,
  where,
  groupBy,
  having,
  order,
  orderAsc,
  orderDesc,
  limit,
  offset,
  values,
  load,
  silent,
  loadInto,
  clear,
  drop,
  create,
  add,
  to,
  move,
  copy,
  insertData,
  deleteData,
  deleteWhere,
  modifyWith,
  deleteClause,
  insertClause,
  usingClause,
  optional,
  service,
  bind,
  undef,
  minus,
  union,
  filter,
  a,
  true_,
  false_,
  in_,
  notIn,
  separator,,
];

/**
 * [!!!ORDER MATTERS!!!](https://chevrotain.io/docs/tutorial/step1_lexing.html#creating-the-lexer)
 */
export const allTokens: TokenType[] = [
  ...allBaseTokens,
  ...allBuiltInCalls,
  ...allGraphTokens,
  ...allTerminals,
  ...allSymbols,
];

export const ChevSparqlLexer = new Lexer(allTokens, { positionTracking: 'onlyOffset' });
