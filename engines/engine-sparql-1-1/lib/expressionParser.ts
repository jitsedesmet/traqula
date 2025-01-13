import { Builder } from '@traqula/core';
import { gram }from '@traqula/rules-sparql-1-1';


const rulesNoBuiltIn = <const> [
  gram.expression,
  gram.conditionalOrExpression,
  gram.conditionalAndExpression,
  gram.valueLogical,
  gram.relationalExpression,
  gram.numericExpression,
  gram.expressionList,
  gram.additiveExpression,
  gram.multiplicativeExpression,
  gram.unaryExpression,
  gram.primaryExpression,
  gram.brackettedExpression,
  // BuiltInCall,
  gram.iriOrFunction,
  gram.rdfLiteral,
  gram.numericLiteral,
  gram.numericLiteralUnsigned,
  gram.numericLiteralPositive,
  gram.numericLiteralNegative,
  gram.booleanLiteral,
  gram.var_,
  gram.builtInStr,
  gram.builtInLang,
  gram.builtInLangmatches,
  gram.builtInDatatype,
  gram.builtInBound,
  gram.builtInIri,
  gram.builtInUri,
  gram.builtInBnodeSparqlJs,
  gram.builtInRand,
  gram.builtInAbs,
  gram.builtInCeil,
  gram.builtInFloor,
  gram.builtInRound,
  gram.builtInConcat,
  gram.builtInStrlen,
  gram.builtInUcase,
  gram.builtInLcase,
  gram.builtInEncode_for_uri,
];

const builtInPatch: typeof gram.builtInCall = {
  name: 'builtInCall',
  impl: ({ OR, SUBRULE }) => () => OR(gram.builtInCallList(SUBRULE).slice(0, -2)),
};

export const expressionParserBuilder = Builder.createBuilder(rulesNoBuiltIn)
  .addMany(
    gram.builtInContains,
    gram.builtInStrstarts,
    gram.builtInStrends,
    gram.builtInStrbefore,
    gram.builtInStrafter,
    gram.builtInYear,
    gram.builtInMonth,
    gram.builtInDay,
    gram.builtInHours,
    gram.builtInMinutes,
    gram.builtInSeconds,
    gram.builtInTimezone,
    gram.builtInTz,
    gram.builtInNow,
    gram.builtInUuid,
    gram.builtInStruuid,
    gram.builtInMd5,
    gram.builtInSha1,
    gram.builtInSha256,
    gram.builtInSha384,
    gram.builtInSha512,
    gram.builtInCoalesce,
    gram.builtInIf,
    gram.builtInStrlang,
    gram.builtInStrdt,
    gram.builtInSameterm,
    gram.builtInIsiri,
    gram.builtInIsuri,
    gram.builtInIsblank,
    gram.builtInIsliteral,
    gram.builtInIsnumeric,
    gram.regexExpression,
    gram.substringExpression,
    gram.strReplaceExpression,
    gram.aggregateCount,
    gram.aggregateSum,
    gram.aggregateMin,
    gram.aggregateMax,
    gram.aggregateAvg,
    gram.aggregateSample,
    gram.aggregateGroup_concat,
    gram.aggregate,
    gram.iri,
    gram.prefixedName,
    gram.argList,
    gram.string,
  )
  .addRule(builtInPatch);