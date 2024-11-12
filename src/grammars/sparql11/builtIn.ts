import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import {
  baseAggregateFunc,
  exprFunc1,
  exprFunc2,
  exprListFunc1,
  exprOrNilFunc1,
  nilFunc1,
  unCapitalize,
  varFunc1,
} from '../utils';
import { expression } from './expression';
import { string } from './general';
import { groupGraphPattern } from './whereClause';

export const builtInStr = exprFunc1(l.builtIn.str);
export const builtInLang = exprFunc1(l.builtIn.lang);
export const builtInLangmatches = exprFunc2(l.builtIn.langmatches);
export const builtInDatatype = exprFunc1(l.builtIn.datatype);
export const builtInBound = varFunc1(l.builtIn.bound);
export const builtInIri = exprFunc1(l.builtIn.iri);
export const builtInUri = exprFunc1(l.builtIn.uri);
export const builtInBnode = exprOrNilFunc1(l.builtIn.bnode);
export const builtInRand = nilFunc1(l.builtIn.rand);
export const builtInAbs = exprFunc1(l.builtIn.abs);
export const builtInCeil = exprFunc1(l.builtIn.ceil);
export const builtInFloor = exprFunc1(l.builtIn.floor);
export const builtInRound = exprFunc1(l.builtIn.round);
export const builtInConcat = exprListFunc1(l.builtIn.concat);
export const builtInStrlen = exprFunc1(l.builtIn.strlen);
export const builtInUcase = exprFunc1(l.builtIn.ucase);
export const builtInLcase = exprFunc1(l.builtIn.lcase);
export const builtInEncode_for_uri = exprFunc1(l.builtIn.encode_for_uri);
export const builtInContains = exprFunc2(l.builtIn.contains);
export const builtInStrstarts = exprFunc2(l.builtIn.strstarts);
export const builtInStrends = exprFunc2(l.builtIn.strends);
export const builtInStrbefore = exprFunc2(l.builtIn.strbefore);
export const builtInStrafter = exprFunc2(l.builtIn.strafter);
export const builtInYear = exprFunc1(l.builtIn.year);
export const builtInMonth = exprFunc1(l.builtIn.month);
export const builtInDay = exprFunc1(l.builtIn.day);
export const builtInHours = exprFunc1(l.builtIn.hours);
export const builtInMinutes = exprFunc1(l.builtIn.minutes);
export const builtInSeconds = exprFunc1(l.builtIn.seconds);
export const builtInTimezone = exprFunc1(l.builtIn.timezone);
export const builtInTz = exprFunc1(l.builtIn.tz);
export const builtInNow = nilFunc1(l.builtIn.now);
export const builtInUuid = nilFunc1(l.builtIn.uuid);
export const builtInStruuid = nilFunc1(l.builtIn.struuid);
export const builtInMd5 = exprFunc1(l.builtIn.md5);
export const builtInSha1 = exprFunc1(l.builtIn.sha1);
export const builtInSha256 = exprFunc1(l.builtIn.sha256);
export const builtInSha384 = exprFunc1(l.builtIn.sha384);
export const builtInSha512 = exprFunc1(l.builtIn.sha512);
export const builtInCoalesce = exprListFunc1(l.builtIn.coalesce);
export const builtInIf = exprFunc2(l.builtIn.if_);
export const builtInStrlang = exprFunc2(l.builtIn.strlang);
export const builtInStrdt = exprFunc2(l.builtIn.strdt);
export const builtInSameterm = exprFunc2(l.builtIn.sameterm);
export const builtInIsiri = exprFunc1(l.builtIn.isiri);
export const builtInIsuri = exprFunc1(l.builtIn.isuri);
export const builtInIsblank = exprFunc1(l.builtIn.isblank);
export const builtInIsliteral = exprFunc1(l.builtIn.isliteral);
export const builtInIsnumeric = exprFunc1(l.builtIn.isnumeric);

/**
 * [[121]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const builtInCall: RuleDef & { name: 'builtInCall' } = {
  name: 'builtInCall',
  impl: ({ OR, SUBRULE }) => () => {
    OR([
      { ALT: () => SUBRULE(aggregate) },
      { ALT: () => SUBRULE(builtInStr) },
      { ALT: () => SUBRULE(builtInLang) },
      { ALT: () => SUBRULE(builtInLangmatches) },
      { ALT: () => SUBRULE(builtInDatatype) },
      { ALT: () => SUBRULE(builtInBound) },
      { ALT: () => SUBRULE(builtInIri) },
      { ALT: () => SUBRULE(builtInUri) },
      { ALT: () => SUBRULE(builtInBnode) },
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
    ]);
  },
};

/**
 * [[122]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const regexExpression: RuleDef & { name: 'regexExpression' } = {
  name: 'regexExpression',
  impl: ({ CONSUME1, CONSUME2, SUBRULE3, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.builtIn.regex);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME1(l.symbols.comma);
    SUBRULE2(expression);
    OPTION(() => {
      CONSUME2(l.symbols.comma);
      SUBRULE3(expression);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[123]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const substringExpression: RuleDef & { name: 'substringExpression' } = {
  name: 'substringExpression',
  impl: ({ CONSUME1, CONSUME2, SUBRULE3, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.builtIn.substr);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME1(l.symbols.comma);
    SUBRULE2(expression);
    OPTION(() => {
      CONSUME2(l.symbols.comma);
      SUBRULE3(expression);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[124]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const strReplaceExpression: RuleDef & { name: 'strReplaceExpression' } = {
  name: 'strReplaceExpression',
  impl: ({ CONSUME1, CONSUME2, CONSUME3, SUBRULE3, SUBRULE4, CONSUME, SUBRULE1, SUBRULE2, OPTION }) => () => {
    CONSUME(l.builtIn.replace);
    CONSUME(l.symbols.LParen);
    SUBRULE1(expression);
    CONSUME1(l.symbols.comma);
    SUBRULE2(expression);
    CONSUME2(l.symbols.comma);
    SUBRULE3(expression);
    OPTION(() => {
      CONSUME3(l.symbols.comma);
      SUBRULE4(expression);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[125]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const existsFunc: RuleDef & { name: 'existsFunc' } = {
  name: 'existsFunc',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.builtIn.exists);
    SUBRULE(groupGraphPattern);
  },
};

/**
 * [[126]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const notExistsFunc: RuleDef & { name: 'notExistsFunc' } = {
  name: 'notExistsFunc',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.builtIn.notexists);
    SUBRULE(groupGraphPattern);
  },
};

export const aggregateCount = baseAggregateFunc(l.builtIn.count);
export const aggregateSum = baseAggregateFunc(l.builtIn.sum);
export const aggregateMin = baseAggregateFunc(l.builtIn.min);
export const aggregateMax = baseAggregateFunc(l.builtIn.max);
export const aggregateAvg = baseAggregateFunc(l.builtIn.avg);
export const aggregateSample = baseAggregateFunc(l.builtIn.sample);
export const aggregateGroup_concat: RuleDef & { name: Uncapitalize<typeof l.builtIn.groupConcat.name> } = {
  name: unCapitalize(l.builtIn.groupConcat.name),
  impl: ({ CONSUME, OPTION1, SUBRULE, OPTION2 }) => () => {
    CONSUME(l.builtIn.groupConcat);
    CONSUME(l.symbols.LParen);
    OPTION1(() => {
      CONSUME(l.distinct);
    });
    SUBRULE(expression);
    OPTION2(() => {
      CONSUME(l.symbols.semi);
      CONSUME(l.builtIn.separator);
      CONSUME(l.symbols.equal);
      SUBRULE(string);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[127]](https://www.w3.org/TR/sparql11-query/#rBuiltInCall)
 */
export const aggregate: RuleDef & { name: 'aggregate' } = {
  name: 'aggregate',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(aggregateCount) },
      { ALT: () => SUBRULE(aggregateSum) },
      { ALT: () => SUBRULE(aggregateMin) },
      { ALT: () => SUBRULE(aggregateMax) },
      { ALT: () => SUBRULE(aggregateAvg) },
      { ALT: () => SUBRULE(aggregateSample) },
      { ALT: () => SUBRULE(aggregateGroup_concat) },
    ]);
  },
};
