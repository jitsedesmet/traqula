import type { TokenType } from 'chevrotain';
import { Lexer } from 'chevrotain';
import { allBuiltInCalls } from './BuildinCalls';
import { allGraphTokens } from './graph';
import { createToken } from './helpers';
import { allSymbols } from './symbols';
import { allTerminals } from './terminals';

export const baseDecl = createToken({ name: 'BaseDecl', pattern: /base/ui, label: 'BASE' });
export const prefixDecl = createToken({ name: 'PrefixDecl', pattern: /PREFIX/ui, label: 'PREFIX' });
export const select = createToken({ name: 'Select', pattern: /SELECT/ui, label: 'SELECT' });
export const distinct = createToken({ name: 'Distinct', pattern: /DISTINCT/ui, label: 'DISTINCT' });
export const reduced = createToken({ name: 'Reduced', pattern: /REDUCED/ui, label: 'REDUCED' });
export const as = createToken({ name: 'As', pattern: /AS/ui, label: 'AS' });
export const construct = createToken({ name: 'Construct', pattern: /CONSTRUCT/ui, label: 'CONSTRUCT' });
export const describe = createToken({ name: 'Describe', pattern: /DESCRIBE/ui, label: 'DESCRIBE' });
export const ask = createToken({ name: 'Ask', pattern: /ASK/ui, label: 'ASK' });
export const from = createToken({ name: 'From', pattern: /FROM/ui, label: 'FROM' });
export const where = createToken({ name: 'Where', pattern: /WHERE/ui, label: 'WHERE' });
export const groupBy = createToken({ name: 'GroupBy', pattern: /GROUP BY/ui, label: 'GROUP BY' });
export const having = createToken({ name: 'Having', pattern: /HAVING/ui, label: 'HAVING' });
export const order = createToken({ name: 'Order', pattern: /ORDER BY/ui, label: 'ORDER BY' });
export const orderAsc = createToken({ name: 'OrderAsc', pattern: /ASC/ui, label: 'ASC' });
export const orderDesc = createToken({ name: 'OrderDesc', pattern: /DESC/ui, label: 'DESC' });
export const limit = createToken({ name: 'Limit', pattern: /LIMIT/ui, label: 'LIMIT' });
export const offset = createToken({ name: 'Offset', pattern: /OFFSET/ui, label: 'OFFSET' });
export const values = createToken({ name: 'Values', pattern: /VALUES/ui, label: 'VALUES' });
export const load = createToken({ name: 'Load', pattern: /LOAD/ui, label: 'LOAD' });
export const silent = createToken({ name: 'Silent', pattern: /SILENT/ui, label: 'SILENT' });
export const loadInto = createToken({ name: 'LoadInto', pattern: /INTO/ui, label: 'INTO' });
export const clear = createToken({ name: 'Clear', pattern: /CLEAR/ui, label: 'CLEAR' });
export const drop = createToken({ name: 'Drop', pattern: /DROP/ui, label: 'DROP' });
export const create = createToken({ name: 'Create', pattern: /CREATE/ui, label: 'CREATE' });
export const add = createToken({ name: 'Add', pattern: /ADD/ui, label: 'ADD' });
export const to = createToken({ name: 'To', pattern: /TO/ui, label: 'TO' });
export const move = createToken({ name: 'Move', pattern: /MOVE/ui, label: 'MOVE' });
export const copy = createToken({ name: 'Copy', pattern: /COPY/ui, label: 'COPY' });
export const insertData = createToken({ name: 'InsertData', pattern: /INSERT DATA/ui, label: 'INSERT DATA' });
export const deleteData = createToken({ name: 'DeleteData', pattern: /DELETE DATA/ui, label: 'DELETE DATA' });
export const deleteWhere = createToken({ name: 'DeleteWhere', pattern: /DELETE WHERE/ui, label: 'DELETE WHERE' });
export const modifyWith = createToken({ name: 'ModifyWith', pattern: /WITH/ui, label: 'WITH' });
export const deleteClause = createToken({ name: 'DeleteClause', pattern: /DELETE/ui, label: 'DELETE' });
export const insertClause = createToken({ name: 'InsertClause', pattern: /INSERT/ui, label: 'INSERT' });
export const usingClause = createToken({ name: 'UsingClause', pattern: /USING/ui, label: 'USING' });
export const optional = createToken({ name: 'Optional', pattern: /OPTIONAL/ui, label: 'OPTIONAL' });
export const service = createToken({ name: 'Service', pattern: /SERVICE/ui, label: 'SERVICE' });
export const bind = createToken({ name: 'Bind', pattern: /BIND/ui, label: 'BIND' });
export const undef = createToken({ name: 'Undef', pattern: /UNDEF/ui, label: 'UNDEF' });
export const minus = createToken({ name: 'Minus', pattern: /MINUS/ui, label: 'MINUS' });
export const union = createToken({ name: 'Union', pattern: /UNION/ui, label: 'UNION' });
export const filter = createToken({ name: 'Filter', pattern: /FILTER/ui, label: 'FILTER' });
export const a = createToken({ name: 'a', pattern: 'a', label: 'type declaration \'a\'' });
export const true_ = createToken({ name: 'True', pattern: /true/ui, label: 'true' });
export const false_ = createToken({ name: 'False', pattern: /false/ui, label: 'false' });
export const in_ = createToken({ name: 'In', pattern: /IN/ui, label: 'IN' });
export const notIn = createToken({ name: 'NotIn', pattern: /NOT IN/ui, label: 'NOT IN' });
export const separator = createToken({ name: 'Separator', pattern: /SEPARATOR/ui, label: 'SEPARATOR' });

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
  // EnsureOptimizations: true,
});
