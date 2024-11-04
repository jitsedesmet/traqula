import type { TokenType } from 'chevrotain';
import { createToken } from './helpers';

export enum BuiltInCalls {
  Str = 'builtInStr',
  Lang = 'builtInLang',
  Langmatches = 'builtInLangmatches',
  Datatype = 'builtInDatatype',
  Bound = 'builtInBound',
  Iri = 'builtInIri',
  Uri = 'builtInUri',
  Bnode = 'builtInBnode',
  Rand = 'builtInRand',
  Abs = 'builtInAbs',
  Ceil = 'builtInCeil',
  Floor = 'builtInFloor',
  Round = 'builtInRound',
  Concat = 'builtInConcat',
  Strlen = 'builtInStrlen',
  Ucase = 'builtInUcase',
  Lcase = 'builtInLcase',
  Encode_for_uri = 'builtInEncode_for_uri',
  Contains = 'builtInContains',
  Strstarts = 'builtInStrstarts',
  Strends = 'builtInStrends',
  Strbefore = 'builtInStrbefore',
  Strafter = 'builtInStrafter',
  Year = 'builtInYear',
  Month = 'builtInMonth',
  Day = 'builtInDay',
  Hours = 'builtInHours',
  Minutes = 'builtInMinutes',
  Seconds = 'builtInSeconds',
  Timezone = 'builtInTimezone',
  Tz = 'builtInTz',
  Now = 'builtInNow',
  Uuid = 'builtInUuid',
  Struuid = 'builtInStruuid',
  Md5 = 'builtInMd5',
  Sha1 = 'builtInSha1',
  Sha256 = 'builtInSha256',
  Sha384 = 'builtInSha384',
  Sha512 = 'builtInSha512',
  Coalesce = 'builtInCoalesce',
  If = 'builtInIf',
  Strlang = 'builtInStrlang',
  Strdt = 'builtInStrdt',
  Sameterm = 'builtInSameterm',
  Isiri = 'builtInIsiri',
  Isuri = 'builtInIsuri',
  Isblank = 'builtInIsblank',
  Isliteral = 'builtInIsliteral',
  Isnumeric = 'builtInIsnumeric',
  Regex = 'builtInRegex',
  Substr = 'builtInSubstr',
  Replace = 'builtInReplace',
  Exists = 'builtInExists',
  Notexists = 'builtInNotexists',
  Count = 'builtInCount',
  Sum = 'builtInSum',
  Min = 'builtInMin',
  Max = 'builtInMax',
  Avg = 'builtInAvg',
  Sample = 'builtInSample',
  Group_concat = 'builtInGroup_concat',
  Separator = 'builtInSeparator',
}

function capitalize<T extends string>(string: T): Capitalize<T> {
  return <Capitalize<T>> (string.charAt(0).toUpperCase() + string.slice(1));
}

export const str = createToken({ name: capitalize(BuiltInCalls.Str), pattern: 'STR' });
export const lang = createToken({ name: capitalize(BuiltInCalls.Lang), pattern: 'LANG' });
export const langmatches = createToken({ name: capitalize(BuiltInCalls.Langmatches), pattern: 'LANGMATCHES' });
export const datatype = createToken({ name: capitalize(BuiltInCalls.Datatype), pattern: 'DATATYPE' });
export const bound = createToken({ name: capitalize(BuiltInCalls.Bound), pattern: 'BOUND' });
export const iri = createToken({ name: capitalize(BuiltInCalls.Iri), pattern: 'IRI' });
export const uri = createToken({ name: capitalize(BuiltInCalls.Uri), pattern: 'URI' });
export const bnode = createToken({ name: capitalize(BuiltInCalls.Bnode), pattern: 'BNODE' });
export const rand = createToken({ name: capitalize(BuiltInCalls.Rand), pattern: 'RAND' });
export const abs = createToken({ name: capitalize(BuiltInCalls.Abs), pattern: 'ABS' });
export const ceil = createToken({ name: capitalize(BuiltInCalls.Ceil), pattern: 'CEIL' });
export const floor = createToken({ name: capitalize(BuiltInCalls.Floor), pattern: 'FLOOR' });
export const round = createToken({ name: capitalize(BuiltInCalls.Round), pattern: 'ROUND' });
export const concat = createToken({ name: capitalize(BuiltInCalls.Concat), pattern: 'CONCAT' });
export const strlen = createToken({ name: capitalize(BuiltInCalls.Strlen), pattern: 'STRLEN' });
export const ucase = createToken({ name: capitalize(BuiltInCalls.Ucase), pattern: 'UCASE' });
export const lcase = createToken({ name: capitalize(BuiltInCalls.Lcase), pattern: 'LCASE' });
export const encode_for_uri = createToken({ name: capitalize(BuiltInCalls.Encode_for_uri), pattern: 'ENCODE_FOR_URI' });
export const contains = createToken({ name: capitalize(BuiltInCalls.Contains), pattern: 'CONTAINS' });
export const strstarts = createToken({ name: capitalize(BuiltInCalls.Strstarts), pattern: 'STRSTARTS' });
export const strends = createToken({ name: capitalize(BuiltInCalls.Strends), pattern: 'STRENDS' });
export const strbefore = createToken({ name: capitalize(BuiltInCalls.Strbefore), pattern: 'STRBEFORE' });
export const strafter = createToken({ name: capitalize(BuiltInCalls.Strafter), pattern: 'STRAFTER' });
export const year = createToken({ name: capitalize(BuiltInCalls.Year), pattern: 'YEAR' });
export const month = createToken({ name: capitalize(BuiltInCalls.Month), pattern: 'MONTH' });
export const day = createToken({ name: capitalize(BuiltInCalls.Day), pattern: 'DAY' });
export const hours = createToken({ name: capitalize(BuiltInCalls.Hours), pattern: 'HOURS' });
export const minutes = createToken({ name: capitalize(BuiltInCalls.Minutes), pattern: 'MINUTES' });
export const seconds = createToken({ name: capitalize(BuiltInCalls.Seconds), pattern: 'SECONDS' });
export const timezone = createToken({ name: capitalize(BuiltInCalls.Timezone), pattern: 'TIMEZONE' });
export const tz = createToken({ name: capitalize(BuiltInCalls.Tz), pattern: 'TZ' });
export const now = createToken({ name: capitalize(BuiltInCalls.Now), pattern: 'NOW' });
export const uuid = createToken({ name: capitalize(BuiltInCalls.Uuid), pattern: 'UUID' });
export const struuid = createToken({ name: capitalize(BuiltInCalls.Struuid), pattern: 'STRUUID' });
export const md5 = createToken({ name: capitalize(BuiltInCalls.Md5), pattern: 'MD5' });
export const sha1 = createToken({ name: capitalize(BuiltInCalls.Sha1), pattern: 'SHA1' });
export const sha256 = createToken({ name: capitalize(BuiltInCalls.Sha256), pattern: 'SHA256' });
export const sha384 = createToken({ name: capitalize(BuiltInCalls.Sha384), pattern: 'SHA384' });
export const sha512 = createToken({ name: capitalize(BuiltInCalls.Sha512), pattern: 'SHA512' });
export const coalesce = createToken({ name: capitalize(BuiltInCalls.Coalesce), pattern: 'COALESCE' });
export const if_ = createToken({ name: capitalize(BuiltInCalls.If), pattern: 'IF' });
export const strlang = createToken({ name: capitalize(BuiltInCalls.Strlang), pattern: 'STRLANG' });
export const strdt = createToken({ name: capitalize(BuiltInCalls.Strdt), pattern: 'STRDT' });
export const sameterm = createToken({ name: capitalize(BuiltInCalls.Sameterm), pattern: 'SAMETERM' });
export const isiri = createToken({ name: capitalize(BuiltInCalls.Isiri), pattern: 'ISIRI' });
export const isuri = createToken({ name: capitalize(BuiltInCalls.Isuri), pattern: 'ISURI' });
export const isblank = createToken({ name: capitalize(BuiltInCalls.Isblank), pattern: 'ISBLANK' });
export const isliteral = createToken({ name: capitalize(BuiltInCalls.Isliteral), pattern: 'ISLITERAL' });
export const isnumeric = createToken({ name: capitalize(BuiltInCalls.Isnumeric), pattern: 'ISNUMERIC' });
export const regex = createToken({ name: capitalize(BuiltInCalls.Regex), pattern: 'REGEX' });
export const substr = createToken({ name: capitalize(BuiltInCalls.Substr), pattern: 'SUBSTR' });
export const replace = createToken({ name: capitalize(BuiltInCalls.Replace), pattern: 'REPLACE' });
export const exists = createToken({ name: capitalize(BuiltInCalls.Exists), pattern: 'EXISTS' });
export const notexists = createToken({ name: capitalize(BuiltInCalls.Notexists), pattern: 'NOT EXISTS' });
export const count = createToken({ name: capitalize(BuiltInCalls.Count), pattern: 'COUNT' });
export const sum = createToken({ name: capitalize(BuiltInCalls.Sum), pattern: 'SUM' });
export const min = createToken({ name: capitalize(BuiltInCalls.Min), pattern: 'MIN' });
export const max = createToken({ name: capitalize(BuiltInCalls.Max), pattern: 'MAX' });
export const avg = createToken({ name: capitalize(BuiltInCalls.Avg), pattern: 'AVG' });
export const sample = createToken({ name: capitalize(BuiltInCalls.Sample), pattern: 'SAMPLE' });
export const groupConcat = createToken({ name: capitalize(BuiltInCalls.Group_concat), pattern: 'GROUP_CONCAT' });
export const separator = createToken({ name: capitalize(BuiltInCalls.Separator), pattern: 'SEPARATOR' });

export const allBuiltInCalls: TokenType[] = [
  str,
  lang,
  langmatches,
  datatype,
  bound,
  iri,
  uri,
  bnode,
  rand,
  abs,
  ceil,
  floor,
  round,
  concat,
  strlen,
  ucase,
  lcase,
  encode_for_uri,
  contains,
  strstarts,
  strends,
  strbefore,
  strafter,
  year,
  month,
  day,
  hours,
  minutes,
  seconds,
  timezone,
  tz,
  now,
  uuid,
  struuid,
  md5,
  sha1,
  sha256,
  sha384,
  sha512,
  coalesce,
  if_,
  strlang,
  strdt,
  sameterm,
  isiri,
  isuri,
  isblank,
  isliteral,
  isnumeric,
  regex,
  substr,
  replace,
  exists,
  notexists,
  count,
  sum,
  min,
  max,
  avg,
  sample,
  groupConcat,
  separator,
];
