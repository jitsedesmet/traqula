import type { IOrAlt } from '@chevrotain/types';
import * as l from '../lexer';
import type { ImplArgs, RuleDef } from '@traqula/core';
import type { RuleDefExpressionFunctionX } from '../expressionHelpers';
import {
  baseAggregateFunc,
  funcExpr1,
  funcExpr2,
  funcExpr2or3,
  funcExpr3,
  funcExpr3or4,
  funcExprList1,
  funcGroupGraphPattern,
  funcNil1,
  funcVar1,
} from '../expressionHelpers';
import {
  unCapitalize,
} from '@traqula/core';
import { expression } from './expression';
import { string } from './literals';
import type { AggregateExpression, Expression } from '../Sparql11types';

export const builtInStr = funcExpr1(l.builtIn.str);
export const builtInLang = funcExpr1(l.builtIn.lang);
export const builtInLangmatches = funcExpr2(l.builtIn.langmatches);
export const builtInDatatype = funcExpr1(l.builtIn.datatype);
export const builtInBound = funcVar1(l.builtIn.bound);
export const builtInIri = funcExpr1(l.builtIn.iri);
export const builtInUri = funcExpr1(l.builtIn.uri);
// Todo: so ugly, just to be compatible with sparqlJS
export const builtInBnodeSparqlJs: RuleDefExpressionFunctionX<Uncapitalize<'builtInBnode'>, [] | [Expression]> = {
  name: 'builtInBnode',
  impl: ({ CONSUME, OR, SUBRULE }) => () => {
    const operator = CONSUME(l.builtIn.bnode);
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
      operator: operator.image,
      args,
    };
  },
};
// Export const builtInBnode = funcExprOrNil1(l.builtIn.bnode);
export const builtInRand = funcNil1(l.builtIn.rand);
export const builtInAbs = funcExpr1(l.builtIn.abs);
export const builtInCeil = funcExpr1(l.builtIn.ceil);
export const builtInFloor = funcExpr1(l.builtIn.floor);
export const builtInRound = funcExpr1(l.builtIn.round);
export const builtInConcat = funcExprList1(l.builtIn.concat);
export const builtInStrlen = funcExpr1(l.builtIn.strlen);
export const builtInUcase = funcExpr1(l.builtIn.ucase);
export const builtInLcase = funcExpr1(l.builtIn.lcase);
export const builtInEncode_for_uri = funcExpr1(l.builtIn.encode_for_uri);
export const builtInContains = funcExpr2(l.builtIn.contains);
export const builtInStrstarts = funcExpr2(l.builtIn.strstarts);
export const builtInStrends = funcExpr2(l.builtIn.strends);
export const builtInStrbefore = funcExpr2(l.builtIn.strbefore);
export const builtInStrafter = funcExpr2(l.builtIn.strafter);
export const builtInYear = funcExpr1(l.builtIn.year);
export const builtInMonth = funcExpr1(l.builtIn.month);
export const builtInDay = funcExpr1(l.builtIn.day);
export const builtInHours = funcExpr1(l.builtIn.hours);
export const builtInMinutes = funcExpr1(l.builtIn.minutes);
export const builtInSeconds = funcExpr1(l.builtIn.seconds);
export const builtInTimezone = funcExpr1(l.builtIn.timezone);
export const builtInTz = funcExpr1(l.builtIn.tz);
export const builtInNow = funcNil1(l.builtIn.now);
export const builtInUuid = funcNil1(l.builtIn.uuid);
export const builtInStruuid = funcNil1(l.builtIn.struuid);
export const builtInMd5 = funcExpr1(l.builtIn.md5);
export const builtInSha1 = funcExpr1(l.builtIn.sha1);
export const builtInSha256 = funcExpr1(l.builtIn.sha256);
export const builtInSha384 = funcExpr1(l.builtIn.sha384);
export const builtInSha512 = funcExpr1(l.builtIn.sha512);
export const builtInCoalesce = funcExprList1(l.builtIn.coalesce);
export const builtInIf = funcExpr3(l.builtIn.if_);
export const builtInStrlang = funcExpr2(l.builtIn.strlang);
export const builtInStrdt = funcExpr2(l.builtIn.strdt);
export const builtInSameterm = funcExpr2(l.builtIn.sameterm);
export const builtInIsiri = funcExpr1(l.builtIn.isiri);
export const builtInIsuri = funcExpr1(l.builtIn.isuri);
export const builtInIsblank = funcExpr1(l.builtIn.isblank);
export const builtInIsliteral = funcExpr1(l.builtIn.isliteral);
export const builtInIsnumeric = funcExpr1(l.builtIn.isnumeric);

export function builtInCallList(SUBRULE: ImplArgs['SUBRULE']): IOrAlt<Expression>[] {
  return [
    { ALT: () => SUBRULE(aggregate) },
    { ALT: () => SUBRULE(builtInStr) },
    { ALT: () => SUBRULE(builtInLang) },
    { ALT: () => SUBRULE(builtInLangmatches) },
    { ALT: () => SUBRULE(builtInDatatype) },
    { ALT: () => SUBRULE(builtInBound) },
    { ALT: () => SUBRULE(builtInIri) },
    { ALT: () => SUBRULE(builtInUri) },
    { ALT: () => SUBRULE(builtInBnodeSparqlJs) },
    { ALT: () => SUBRULE(builtInRand) },
    { ALT: () => SUBRULE(builtInAbs) },
    { ALT: () => SUBRULE(builtInCeil) },
    { ALT: () => SUBRULE(builtInFloor) },
    { ALT: () => SUBRULE(builtInRound) },
    { ALT: () => SUBRULE(builtInConcat) },
    { ALT: () => SUBRULE(substringExpression) },
    { ALT: () => SUBRULE(builtInStrlen) },
    { ALT: () => SUBRULE(strReplaceExpression) },
    { ALT: () => SUBRULE(builtInUcase) },
    { ALT: () => SUBRULE(builtInLcase) },
    { ALT: () => SUBRULE(builtInEncode_for_uri) },
    { ALT: () => SUBRULE(builtInContains) },
    { ALT: () => SUBRULE(builtInStrstarts) },
    { ALT: () => SUBRULE(builtInStrends) },
    { ALT: () => SUBRULE(builtInStrbefore) },
    { ALT: () => SUBRULE(builtInStrafter) },
    { ALT: () => SUBRULE(builtInYear) },
    { ALT: () => SUBRULE(builtInMonth) },
    { ALT: () => SUBRULE(builtInDay) },
    { ALT: () => SUBRULE(builtInHours) },
    { ALT: () => SUBRULE(builtInMinutes) },
    { ALT: () => SUBRULE(builtInSeconds) },
    { ALT: () => SUBRULE(builtInTimezone) },
    { ALT: () => SUBRULE(builtInTz) },
    { ALT: () => SUBRULE(builtInNow) },
    { ALT: () => SUBRULE(builtInUuid) },
    { ALT: () => SUBRULE(builtInStruuid) },
    { ALT: () => SUBRULE(builtInMd5) },
    { ALT: () => SUBRULE(builtInSha1) },
    { ALT: () => SUBRULE(builtInSha256) },
    { ALT: () => SUBRULE(builtInSha384) },
    { ALT: () => SUBRULE(builtInSha512) },
    { ALT: () => SUBRULE(builtInCoalesce) },
    { ALT: () => SUBRULE(builtInIf) },
    { ALT: () => SUBRULE(builtInStrlang) },
    { ALT: () => SUBRULE(builtInStrdt) },
    { ALT: () => SUBRULE(builtInSameterm) },
    { ALT: () => SUBRULE(builtInIsiri) },
    { ALT: () => SUBRULE(builtInIsuri) },
    { ALT: () => SUBRULE(builtInIsblank) },
    { ALT: () => SUBRULE(builtInIsliteral) },
    { ALT: () => SUBRULE(builtInIsnumeric) },
    { ALT: () => SUBRULE(regexExpression) },
    { ALT: () => SUBRULE(existsFunc) },
    { ALT: () => SUBRULE(notExistsFunc) },
  ];
}

/**
 * [[121]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const builtInCall: RuleDef<'builtInCall', Expression> = <const> {
  name: 'builtInCall',
  impl: ({ OR, SUBRULE, cache }) => () => {
    const cached = <IOrAlt<Expression>[]>cache.get(builtInCall);
    if (cached) {
      return OR<Expression>(cached);
    }
    const builtIns = builtInCallList(SUBRULE);
    cache.set(builtInCall, builtIns);
    return OR<Expression>(builtIns);
  },
};

/**
 * [[122]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const regexExpression = funcExpr2or3(l.builtIn.regex);

/**
 * [[123]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const substringExpression = funcExpr2or3(l.builtIn.substr);

/**
 * [[124]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const strReplaceExpression = funcExpr3or4(l.builtIn.replace);

/**
 * [[125]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const existsFunc = funcGroupGraphPattern(l.builtIn.exists);

/**
 * [[126]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const notExistsFunc = funcGroupGraphPattern(l.builtIn.notexists);

export const aggregateCount = baseAggregateFunc(l.builtIn.count);
export const aggregateSum = baseAggregateFunc(l.builtIn.sum);
export const aggregateMin = baseAggregateFunc(l.builtIn.min);
export const aggregateMax = baseAggregateFunc(l.builtIn.max);
export const aggregateAvg = baseAggregateFunc(l.builtIn.avg);
export const aggregateSample = baseAggregateFunc(l.builtIn.sample);
export const aggregateGroup_concat: RuleDef<'builtInGroup_concat', AggregateExpression> = <const> {
  name: unCapitalize(l.builtIn.groupConcat.name),
  impl: ({ CONSUME, OPTION1, SUBRULE, OPTION2 }) => () => {
    CONSUME(l.builtIn.groupConcat);
    CONSUME(l.symbols.LParen);
    const distinct = OPTION1(() => CONSUME(l.distinct));
    const expr = SUBRULE(expression);
    const separator = OPTION2(() => {
      CONSUME(l.symbols.semi);
      CONSUME(l.separator);
      CONSUME(l.symbols.equal);
      return SUBRULE(string);
    }) ?? ' ';
    CONSUME(l.symbols.RParen);

    return {
      type: 'aggregate',
      aggregation: 'group_concat',
      expression: expr,
      distinct: Boolean(distinct),
      separator,
    };
  },
};

export const canParseAggregate = Symbol('canParseAggregate');
export const inAggregate = Symbol('inAggregate');
/**
 * [[127]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const aggregate: RuleDef<'aggregate', Expression> = <const> {
  name: 'aggregate',
  impl: ({ ACTION, SUBRULE, OR, context }) => () => {
    // https://www.w3.org/2013/sparql-errata#errata-query-5 - Or note 15 in SPARQL1.2 spec
    //  An aggregate function is not allowed within an aggregate function.
    const wasInAggregate = context.parseMode.has(inAggregate);
    ACTION(() => context.parseMode.add(inAggregate));
    const result = OR<Expression>([
      { ALT: () => SUBRULE(aggregateCount) },
      { ALT: () => SUBRULE(aggregateSum) },
      { ALT: () => SUBRULE(aggregateMin) },
      { ALT: () => SUBRULE(aggregateMax) },
      { ALT: () => SUBRULE(aggregateAvg) },
      { ALT: () => SUBRULE(aggregateSample) },
      { ALT: () => SUBRULE(aggregateGroup_concat) },
    ]);
    ACTION(() => !wasInAggregate && context.parseMode.delete(inAggregate));

    ACTION(() => {
      if (!context.parseMode.has(canParseAggregate)) {
        throw new Error('Aggregates are only allowed in SELECT, HAVING, and ORDER BY clauses.');
      }
      if (context.parseMode.has(inAggregate)) {
        throw new Error('An aggregate function is not allowed within an aggregate function.');
      }
    });

    return result;
  },
};
