import type { TokenType } from 'chevrotain';
import { createToken } from './helpers';

export enum BuildInCalls {
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
}

function capitalize<T extends string>(string: T): Capitalize<T> {
  return <Capitalize<T>> (string.charAt(0).toUpperCase() + string.slice(1));
}

export const str = createToken({ name: capitalize(BuildInCalls.Str), pattern: 'STR' });
export const lang = createToken({ name: capitalize(BuildInCalls.Lang), pattern: 'LANG' });
export const langmatches = createToken({ name: capitalize(BuildInCalls.Langmatches), pattern: 'LANGMATCHES' });
export const datatype = createToken({ name: capitalize(BuildInCalls.Datatype), pattern: 'DATATYPE' });
export const bound = createToken({ name: capitalize(BuildInCalls.Bound), pattern: 'BOUND' });
export const iri = createToken({ name: capitalize(BuildInCalls.Iri), pattern: 'IRI' });
export const uri = createToken({ name: capitalize(BuildInCalls.Uri), pattern: 'URI' });
export const bnode = createToken({ name: capitalize(BuildInCalls.Bnode), pattern: 'BNODE' });
export const rand = createToken({ name: capitalize(BuildInCalls.Rand), pattern: 'RAND' });
export const abs = createToken({ name: capitalize(BuildInCalls.Abs), pattern: 'ABS' });
export const ceil = createToken({ name: capitalize(BuildInCalls.Ceil), pattern: 'CEIL' });
export const floor = createToken({ name: capitalize(BuildInCalls.Floor), pattern: 'FLOOR' });
export const round = createToken({ name: capitalize(BuildInCalls.Round), pattern: 'ROUND' });
export const concat = createToken({ name: capitalize(BuildInCalls.Concat), pattern: 'CONCAT' });
export const strlen = createToken({ name: capitalize(BuildInCalls.Strlen), pattern: 'STRLEN' });
export const ucase = createToken({ name: capitalize(BuildInCalls.Ucase), pattern: 'UCASE' });
export const lcase = createToken({ name: capitalize(BuildInCalls.Lcase), pattern: 'LCASE' });
export const encode_for_uri = createToken({ name: capitalize(BuildInCalls.Encode_for_uri), pattern: 'ENCODE_FOR_URI' });
export const contains = createToken({ name: capitalize(BuildInCalls.Contains), pattern: 'CONTAINS' });
export const strstarts = createToken({ name: capitalize(BuildInCalls.Strstarts), pattern: 'STRSTARTS' });
export const strends = createToken({ name: capitalize(BuildInCalls.Strends), pattern: 'STRENDS' });
export const strbefore = createToken({ name: capitalize(BuildInCalls.Strbefore), pattern: 'STRBEFORE' });
export const strafter = createToken({ name: capitalize(BuildInCalls.Strafter), pattern: 'STRAFTER' });
export const year = createToken({ name: capitalize(BuildInCalls.Year), pattern: 'YEAR' });
export const month = createToken({ name: capitalize(BuildInCalls.Month), pattern: 'MONTH' });
export const day = createToken({ name: capitalize(BuildInCalls.Day), pattern: 'DAY' });
export const hours = createToken({ name: capitalize(BuildInCalls.Hours), pattern: 'HOURS' });
export const minutes = createToken({ name: capitalize(BuildInCalls.Minutes), pattern: 'MINUTES' });
export const seconds = createToken({ name: capitalize(BuildInCalls.Seconds), pattern: 'SECONDS' });
export const timezone = createToken({ name: capitalize(BuildInCalls.Timezone), pattern: 'TIMEZONE' });
export const tz = createToken({ name: capitalize(BuildInCalls.Tz), pattern: 'TZ' });
export const now = createToken({ name: capitalize(BuildInCalls.Now), pattern: 'NOW' });
export const uuid = createToken({ name: capitalize(BuildInCalls.Uuid), pattern: 'UUID' });
export const struuid = createToken({ name: capitalize(BuildInCalls.Struuid), pattern: 'STRUUID' });
export const md5 = createToken({ name: capitalize(BuildInCalls.Md5), pattern: 'MD5' });
export const sha1 = createToken({ name: capitalize(BuildInCalls.Sha1), pattern: 'SHA1' });
export const sha256 = createToken({ name: capitalize(BuildInCalls.Sha256), pattern: 'SHA256' });
export const sha384 = createToken({ name: capitalize(BuildInCalls.Sha384), pattern: 'SHA384' });
export const sha512 = createToken({ name: capitalize(BuildInCalls.Sha512), pattern: 'SHA512' });
export const coalesce = createToken({ name: capitalize(BuildInCalls.Coalesce), pattern: 'COALESCE' });
export const if_ = createToken({ name: capitalize(BuildInCalls.If), pattern: 'IF' });
export const strlang = createToken({ name: capitalize(BuildInCalls.Strlang), pattern: 'STRLANG' });
export const strdt = createToken({ name: capitalize(BuildInCalls.Strdt), pattern: 'STRDT' });
export const sameterm = createToken({ name: capitalize(BuildInCalls.Sameterm), pattern: 'SAMETERM' });
export const isiri = createToken({ name: capitalize(BuildInCalls.Isiri), pattern: 'ISIRI' });
export const isuri = createToken({ name: capitalize(BuildInCalls.Isuri), pattern: 'ISURI' });
export const isblank = createToken({ name: capitalize(BuildInCalls.Isblank), pattern: 'ISBLANK' });
export const isliteral = createToken({ name: capitalize(BuildInCalls.Isliteral), pattern: 'ISLITERAL' });
export const isnumeric = createToken({ name: capitalize(BuildInCalls.Isnumeric), pattern: 'ISNUMERIC' });
export const regex = createToken({ name: capitalize(BuildInCalls.Regex), pattern: 'REGEX' });
export const substr = createToken({ name: capitalize(BuildInCalls.Substr), pattern: 'SUBSTR' });
export const replace = createToken({ name: capitalize(BuildInCalls.Replace), pattern: 'REPLACE' });
export const exists = createToken({ name: capitalize(BuildInCalls.Exists), pattern: 'EXISTS' });
export const notexists = createToken({ name: capitalize(BuildInCalls.Notexists), pattern: 'NOT EXISTS' });
export const count = createToken({ name: capitalize(BuildInCalls.Count), pattern: 'COUNT' });
export const sum = createToken({ name: capitalize(BuildInCalls.Sum), pattern: 'SUM' });
export const min = createToken({ name: capitalize(BuildInCalls.Min), pattern: 'MIN' });
export const max = createToken({ name: capitalize(BuildInCalls.Max), pattern: 'MAX' });
export const avg = createToken({ name: capitalize(BuildInCalls.Avg), pattern: 'AVG' });
export const sample = createToken({ name: capitalize(BuildInCalls.Sample), pattern: 'SAMPLE' });
export const groupConcat = createToken({ name: capitalize(BuildInCalls.Group_concat), pattern: 'GROUP_CONCAT' });

export const allBuiltInCalls: TokenType[] = [
  str,
  langmatches,
  lang,
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
];
