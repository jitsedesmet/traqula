import { Builder } from '../../grammar/builder/parserBuilder';
import type { builtInCall } from '../../grammar/sparql11/builtIn';
import {
  aggregate,
  aggregateAvg,
  aggregateCount,
  aggregateGroup_concat,
  aggregateMax,
  aggregateMin,
  aggregateSample,
  aggregateSum,
  builtInAbs,
  builtInBnode,
  builtInBound,
  builtInCallList,
  builtInCeil,
  builtInCoalesce,
  builtInConcat,
  builtInContains,
  builtInDatatype,
  builtInDay,
  builtInEncode_for_uri,
  builtInFloor,
  builtInHours,
  builtInIf,
  builtInIri,
  builtInIsblank,
  builtInIsiri,
  builtInIsliteral,
  builtInIsnumeric,
  builtInIsuri,
  builtInLang,
  builtInLangmatches,
  builtInLcase,
  builtInMd5,
  builtInMinutes,
  builtInMonth,
  builtInNow,
  builtInRand,
  builtInRound,
  builtInSameterm,
  builtInSeconds,
  builtInSha1,
  builtInSha256,
  builtInSha384,
  builtInSha512,
  builtInStr,
  builtInStrafter,
  builtInStrbefore,
  builtInStrdt,
  builtInStrends,
  builtInStrlang,
  builtInStrlen,
  builtInStrstarts,
  builtInStruuid,
  builtInTimezone,
  builtInTz,
  builtInUcase,
  builtInUri,
  builtInUuid,
  builtInYear,
  regexExpression,
  strReplaceExpression,
  substringExpression,
} from '../../grammar/sparql11/builtIn';
import {
  additiveExpression,
  argList,
  brackettedExpression,
  conditionalAndExpression,
  conditionalOrExpression,
  expression,
  expressionList,
  iriOrFunction,
  multiplicativeExpression,
  numericExpression,
  primaryExpression,
  relationalExpression,
  unaryExpression,
  valueLogical,
} from '../../grammar/sparql11/expression';
import { var_ } from '../../grammar/sparql11/general';
import {
  booleanLiteral,
  iri,
  numericLiteral,
  numericLiteralNegative,
  numericLiteralPositive,
  numericLiteralUnsigned,
  prefixedName,
  rdfLiteral,
  string,
} from '../../grammar/sparql11/literals';

const rulesNoBuiltIn = <const> [
  expression,
  conditionalOrExpression,
  conditionalAndExpression,
  valueLogical,
  relationalExpression,
  numericExpression,
  expressionList,
  additiveExpression,
  multiplicativeExpression,
  unaryExpression,
  primaryExpression,
  brackettedExpression,
  // BuiltInCall,
  iriOrFunction,
  rdfLiteral,
  numericLiteral,
  numericLiteralUnsigned,
  numericLiteralPositive,
  numericLiteralNegative,
  booleanLiteral,
  var_,
  builtInStr,
  builtInLang,
  builtInLangmatches,
  builtInDatatype,
  builtInBound,
  builtInIri,
  builtInUri,
  builtInBnode,
  builtInRand,
  builtInAbs,
  builtInCeil,
  builtInFloor,
  builtInRound,
  builtInConcat,
  builtInStrlen,
  builtInUcase,
  builtInLcase,
  builtInEncode_for_uri,
  builtInContains,
  builtInStrstarts,
  builtInStrends,
  builtInStrbefore,
  builtInStrafter,
  builtInYear,
  builtInMonth,
  builtInDay,
  builtInHours,
  builtInMinutes,
  builtInSeconds,
  builtInTimezone,
  builtInTz,
  builtInNow,
  builtInUuid,
  builtInStruuid,
  builtInMd5,
  builtInSha1,
  builtInSha256,
  builtInSha384,
  builtInSha512,
  builtInCoalesce,
  builtInIf,
  builtInStrlang,
  builtInStrdt,
  builtInSameterm,
  builtInIsiri,
  builtInIsuri,
  builtInIsblank,
  builtInIsliteral,
  builtInIsnumeric,
  regexExpression,
  substringExpression,
  strReplaceExpression,
  aggregateCount,
  aggregateSum,
  aggregateMin,
  aggregateMax,
  aggregateAvg,
  aggregateSample,
  aggregateGroup_concat,
  aggregate,
  iri,
  prefixedName,
  argList,
  string,
];

const builtInPatch: typeof builtInCall = {
  name: 'builtInCall',
  impl: ({ OR, SUBRULE }) => () => OR(builtInCallList(SUBRULE).slice(0, -2)),
};

export const expressionParserBuilder = Builder.createBuilder(rulesNoBuiltIn)
  .addRule(builtInPatch);
