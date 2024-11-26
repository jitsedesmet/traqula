/* eslint-disable */
import type { TokenType } from 'chevrotain';
import { Lexer } from 'chevrotain';
import { allBuiltInCalls } from './BuildinCalls';
import { allGraphTokens } from './graph';
import { createToken } from './helpers';
import { allSymbols } from './symbols';
import { allTerminals } from './terminals';

export const baseDecl = createToken({ name: 'BaseDecl', pattern: /base/i, label: 'BASE' });
export const prefixDecl = createToken({ name: 'PrefixDecl', pattern: /PREFIX/i, label: 'PREFIX' });
export const select = createToken({ name: 'Select', pattern: /SELECT/i, label: 'SELECT' });
export const distinct = createToken({ name: 'Distinct', pattern: /DISTINCT/i, label: 'DISTINCT' });
export const reduced = createToken({ name: 'Reduced', pattern: /REDUCED/i, label: 'REDUCED' });
export const as = createToken({ name: 'As', pattern: /AS/i, label: 'AS' });
export const construct = createToken({ name: 'Construct', pattern: /CONSTRUCT/i, label: 'CONSTRUCT' });
export const describe = createToken({ name: 'Describe', pattern: /DESCRIBE/i, label: 'DESCRIBE' });
export const ask = createToken({ name: 'Ask', pattern: /ASK/i, label: 'ASK' });
export const from = createToken({ name: 'From', pattern: /FROM/i, label: 'FROM' });
export const where = createToken({ name: 'Where', pattern: /WHERE/i, label: 'WHERE' });
export const groupBy = createToken({ name: 'GroupBy', pattern: /GROUP BY/i, label: 'GROUP BY' });
export const having = createToken({ name: 'Having', pattern: /HAVING/i, label: 'HAVING' });
export const order = createToken({ name: 'Order', pattern: /ORDER BY/i, label: 'ORDER BY' });
export const orderAsc = createToken({ name: 'OrderAsc', pattern: /ASC/i, label: 'ASC' });
export const orderDesc = createToken({ name: 'OrderDesc', pattern: /DESC/i, label: 'DESC' });
export const limit = createToken({ name: 'Limit', pattern: /LIMIT/i, label: 'LIMIT' });
export const offset = createToken({ name: 'Offset', pattern: /OFFSET/i, label: 'OFFSET' });
export const values = createToken({ name: 'Values', pattern: /VALUES/i, label: 'VALUES' });
export const load = createToken({ name: 'Load', pattern: /LOAD/i, label: 'LOAD' });
export const silent = createToken({ name: 'Silent', pattern: /SILENT/i, label: 'SILENT' });
export const loadInto = createToken({ name: 'LoadInto', pattern: /INTO/i, label: 'INTO' });
export const clear = createToken({ name: 'Clear', pattern: /CLEAR/i, label: 'CLEAR' });
export const drop = createToken({ name: 'Drop', pattern: /DROP/i, label: 'DROP' });
export const create = createToken({ name: 'Create', pattern: /CREATE/i, label: 'CREATE' });
export const add = createToken({ name: 'Add', pattern: /ADD/i, label: 'ADD' });
export const to = createToken({ name: 'To', pattern: /TO/i, label: 'TO' });
export const move = createToken({ name: 'Move', pattern: /MOVE/i, label: 'MOVE' });
export const copy = createToken({ name: 'Copy', pattern: /COPY/i, label: 'COPY' });
export const insertData = createToken({ name: 'InsertData', pattern: /INSERT DATA/i, label: 'INSERT DATA' });
export const deleteData = createToken({ name: 'DeleteData', pattern: /DELETE DATA/i, label: 'DELETE DATA' });
export const deleteWhere = createToken({ name: 'DeleteWhere', pattern: /DELETE WHERE/i, label: 'DELETE WHERE' });
export const modifyWith = createToken({ name: 'ModifyWith', pattern: /WITH/i, label: 'WITH' });
export const deleteClause = createToken({ name: 'DeleteClause', pattern: /DELETE/i, label: 'DELETE' });
export const insertClause = createToken({ name: 'InsertClause', pattern: /INSERT/i, label: 'INSERT' });
export const usingClause = createToken({ name: 'UsingClause', pattern: /USING/i, label: 'USING' });
export const optional = createToken({ name: 'Optional', pattern: /OPTIONAL/i, label: 'OPTIONAL' });
export const service = createToken({ name: 'Service', pattern: /SERVICE/i, label: 'SERVICE' });
export const bind = createToken({ name: 'Bind', pattern: /BIND/i, label: 'BIND' });
export const undef = createToken({ name: 'Undef', pattern: /UNDEF/i, label: 'UNDEF' });
export const minus = createToken({ name: 'Minus', pattern: /MINUS/i, label: 'MINUS' });
export const union = createToken({ name: 'Union', pattern: /UNION/i, label: 'UNION' });
export const filter = createToken({ name: 'Filter', pattern: /FILTER/i, label: 'FILTER' });
export const a = createToken({ name: 'a', pattern: 'a', label: 'type declaration \'a\'' });
export const true_ = createToken({ name: 'True', pattern: /true/i, label: 'true' });
export const false_ = createToken({ name: 'False', pattern: /false/i, label: 'false' });
export const in_ = createToken({ name: 'In', pattern: /IN/i, label: 'IN' });
export const notIn = createToken({ name: 'NotIn', pattern: /NOT IN/i, label: 'NOT IN' });
export const separator = createToken({ name: 'Separator', pattern: /SEPARATOR/i, label: 'SEPARATOR' });

export const allBaseTokens: TokenType[] = [
  baseDecl,
  prefixDecl,
  select,
  distinct,
  reduced,
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
  separator,
  as,
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

export const ChevSparqlLexer = new Lexer(allTokens, {
  positionTracking: 'onlyOffset',
  ensureOptimizations: true,
});
