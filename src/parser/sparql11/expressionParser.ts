import { Builder } from '../../grammar/parserBuilder.js';
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
  builtInCall,
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
} from '../../grammar/sparql11/builtIn.js';
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
} from '../../grammar/sparql11/expression.js';
import { var_ } from '../../grammar/sparql11/general.js';
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
} from '../../grammar/sparql11/literals.js';

export type ExpressionParserBuilderArgs = '' |
  'expression' |
  'conditionalOrExpression' |
  'conditionalAndExpression' |
  'valueLogical' |
  'relationalExpression' |
  'numericExpression' |
  'expressionList' |
  'additiveExpression' |
  'multiplicativeExpression' |
  'unaryExpression' |
  'primaryExpression' |
  'brackettedExpression' |
  'builtInCall' |
  'iriOrFunction' |
  'rdfLiteral' |
  'numericLiteral' |
  'numericLiteralUnsigned' |
  'numericLiteralPositive' |
  'numericLiteralNegative' |
  'booleanLiteral' |
  'var' |
  'builtInStr' |
  'builtInLang' |
  'builtInLangmatches' |
  'builtInDatatype' |
  'builtInBound' |
  'builtInIri' |
  'builtInUri' |
  'builtInBnode' |
  'builtInRand' |
  'builtInAbs' |
  'builtInCeil' |
  'builtInFloor' |
  'builtInRound' |
  'builtInConcat' |
  'builtInStrlen' |
  'builtInUcase' |
  'builtInLcase' |
  'builtInEncode_for_uri' |
  'builtInContains' |
  'builtInStrstarts' |
  'builtInStrends' |
  'builtInStrbefore' |
  'builtInStrafter' |
  'builtInYear' |
  'builtInMonth' |
  'builtInDay' |
  'builtInHours' |
  'builtInMinutes' |
  'builtInSeconds' |
  'builtInTimezone' |
  'builtInTz' |
  'builtInNow' |
  'builtInUuid' |
  'builtInStruuid' |
  'builtInMd5' |
  'builtInSha1' |
  'builtInSha256' |
  'builtInSha384' |
  'builtInSha512' |
  'builtInCoalesce' |
  'builtInIf' |
  'builtInStrlang' |
  'builtInStrdt' |
  'builtInSameterm' |
  'builtInIsiri' |
  'builtInIsuri' |
  'builtInIsblank' |
  'builtInIsliteral' |
  'builtInIsnumeric' |
  'builtInRegex' |
  'builtInSubstr' |
  'builtInReplace' |
  'builtInCount' |
  'builtInSum' |
  'builtInMin' |
  'builtInMax' |
  'builtInAvg' |
  'builtInSample' |
  'builtInGroup_concat' |
  'aggregate' |
  'iri' |
  'prefixedName' |
  'argList' |
  'string';

export const expressionParserBuilder: Builder<ExpressionParserBuilderArgs> = Builder.createBuilder(false)
  .addRule(expression)
  .addRule(conditionalOrExpression)
  .addRule(conditionalAndExpression)
  .addRule(valueLogical)
  .addRule(relationalExpression)
  .addRule(numericExpression)
  .addRule(expressionList)
  .addRule(additiveExpression)
  .addRule(multiplicativeExpression)
  .addRule(unaryExpression)
  .addRule(primaryExpression)
  .addRule(brackettedExpression)
  .addRule(builtInCall)
  // Do not include the last two items in this builder. The last two are the exists functions.
  // Including them would induce a circular dependency
  .patchRule('builtInCall', ({ OR, SUBRULE }) => () => OR(builtInCallList(SUBRULE).slice(0, -2)))
  .addRule(iriOrFunction)
  .addRule(rdfLiteral)
  .addRule(numericLiteral)
  .addRule(numericLiteralUnsigned)
  .addRule(numericLiteralPositive)
  .addRule(numericLiteralNegative)
  .addRule(booleanLiteral)
  .addRule(var_)
  .addRule(builtInStr)
  .addRule(builtInLang)
  .addRule(builtInLangmatches)
  .addRule(builtInDatatype)
  .addRule(builtInBound)
  .addRule(builtInIri)
  .addRule(builtInUri)
  .addRule(builtInBnode)
  .addRule(builtInRand)
  .addRule(builtInAbs)
  .addRule(builtInCeil)
  .addRule(builtInFloor)
  .addRule(builtInRound)
  .addRule(builtInConcat)
  .addRule(builtInStrlen)
  .addRule(builtInUcase)
  .addRule(builtInLcase)
  .addRule(builtInEncode_for_uri)
  .addRule(builtInContains)
  .addRule(builtInStrstarts)
  .addRule(builtInStrends)
  .addRule(builtInStrbefore)
  .addRule(builtInStrafter)
  .addRule(builtInYear)
  .addRule(builtInMonth)
  .addRule(builtInDay)
  .addRule(builtInHours)
  .addRule(builtInMinutes)
  .addRule(builtInSeconds)
  .addRule(builtInTimezone)
  .addRule(builtInTz)
  .addRule(builtInNow)
  .addRule(builtInUuid)
  .addRule(builtInStruuid)
  .addRule(builtInMd5)
  .addRule(builtInSha1)
  .addRule(builtInSha256)
  .addRule(builtInSha384)
  .addRule(builtInSha512)
  .addRule(builtInCoalesce)
  .addRule(builtInIf)
  .addRule(builtInStrlang)
  .addRule(builtInStrdt)
  .addRule(builtInSameterm)
  .addRule(builtInIsiri)
  .addRule(builtInIsuri)
  .addRule(builtInIsblank)
  .addRule(builtInIsliteral)
  .addRule(builtInIsnumeric)
  .addRule(regexExpression)
  .addRule(substringExpression)
  .addRule(strReplaceExpression)
  .addRule(aggregateCount)
  .addRule(aggregateSum)
  .addRule(aggregateMin)
  .addRule(aggregateMax)
  .addRule(aggregateAvg)
  .addRule(aggregateSample)
  .addRule(aggregateGroup_concat)
  .addRule(aggregate)
  .addRule(iri)
  .addRule(prefixedName)
  .addRule(argList)
  .addRule(string);
