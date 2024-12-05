/* eslint-disable require-unicode-regexp,unicorn/better-regex */
import { Lexer } from 'chevrotain';
import { createToken } from './helpers.js';

// eslint-disable-next-line max-len
const pnCharsBasePattern = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF]/;
const pnCharsUPattern = new RegExp(`${pnCharsBasePattern.source}|_`);
// eslint-disable-next-line no-misleading-character-class
const varNamePattern = new RegExp(`((${pnCharsUPattern.source})|[0-9])((${pnCharsUPattern.source})|[0-9]|[\u00B7\u0300-\u036F\u203F-\u2040])*`);
// eslint-disable-next-line no-control-regex
const iriRefPattern = /<([^\\<>"{}|^`\u0000-\u0020])*>/;
// eslint-disable-next-line no-misleading-character-class
const pnCharsPattern = new RegExp(`(${pnCharsUPattern.source})|[\\-0-9\u00B7\u0300-\u036F\u203F-\u2040]`);
// eslint-disable-next-line no-misleading-character-class
const pnPrefixPattern = new RegExp(`(${pnCharsBasePattern.source})(((${pnCharsPattern.source})|\\.)*(${pnCharsPattern.source}))?`);
// eslint-disable-next-line no-misleading-character-class
const pNameNsPattern = new RegExp(`(${pnPrefixPattern.source})?:`);
const percentPattern = /%[0-9A-Fa-f][0-9A-Fa-f]/;
const pnLocalEscPattern = /\\[_~.\-!$&'()*+,;=\\/?#@%]/;
const plxPattern = new RegExp(`(${percentPattern.source})|(${pnLocalEscPattern.source})`);
// eslint-disable-next-line no-misleading-character-class
const pnLocalPattern = new RegExp(`((${pnCharsUPattern.source})|:|[0-9]|(${plxPattern.source}))(((${pnCharsPattern.source})|\\.|:|(${plxPattern.source}))*((${pnCharsPattern.source})|:|(${plxPattern.source})))?`);
// eslint-disable-next-line no-misleading-character-class
const pNameLnPattern = new RegExp(`(${pNameNsPattern.source})(${pnLocalPattern.source})`);
// eslint-disable-next-line no-misleading-character-class
const blankNodeLabelPattern = new RegExp(`_:((${pnCharsUPattern.source})|[0-9])(((${pnCharsPattern.source})\\.)*(${pnCharsPattern.source}))?`);
// eslint-disable-next-line no-misleading-character-class
const var1Pattern = new RegExp(`\\?(${varNamePattern.source})`);
// eslint-disable-next-line no-misleading-character-class
const var2Pattern = new RegExp(`\\$(${varNamePattern.source})`);
const langTagPattern = /@[a-zA-Z]+(-[a-zA-Z0-9]+)*/;
const integerPattern = /[0-9]+/;
const decimalPattern = /[0-9]+\.[0-9]+/;
const exponentPattern = /[eE][+-]?[0-9]+/;
const doublePattern = new RegExp(`([0-9]+\\.[0-9]*(${exponentPattern.source}))|(\\.[0-9]+(${exponentPattern.source}))|([0-9]+(${exponentPattern.source}))`);
const interferePositivePattern = new RegExp(`\\+${integerPattern.source}`);
const decimalPositivePattern = new RegExp(`\\+${decimalPattern.source}`);
const doublePositivePattern = new RegExp(`\\+${doublePattern.source}`);
const integerNegativePattern = new RegExp(`-${integerPattern.source}`);
const decimalNegativePattern = new RegExp(`-${decimalPattern.source}`);
const doubleNegativePattern = new RegExp(`-${doublePattern.source}`);
const echarPattern = /\\["'bfnrt]/u;
const stringLiteral1Pattern = new RegExp(`'(?:(?:[^\\u0027\\u005C\\u000A\u000D])|(?:${echarPattern.source}))*'`);
const stringLiteral2Pattern = new RegExp(`"(?:(?:[^\\u0022\\u005C\\u000A\\u000D])|(?:${echarPattern.source}))*"`);
const stringLiteralLong1Pattern = new RegExp(`'''(('|(''))?([^'\\\\]|(${echarPattern.source})))*'''`);
const stringLiteralLong2Pattern = new RegExp(`"""(("|(""))?([^"\\\\]|(${echarPattern.source})))*"""`);
// eslint-disable-next-line no-control-regex
const wsPattern = /[\u0020\u0009\u000D\u000A]/;
const nilPattern = new RegExp(`\\((${wsPattern.source})*\\)`);
const anonPattern = new RegExp(`\\[(${wsPattern.source})*\\]`);

export const iriRef = createToken({ name: 'IriRef', pattern: iriRefPattern });
export const pNameLn = createToken({ name: 'PNameLn', pattern: pNameLnPattern });
export const pNameNs = createToken({ name: 'PNameNs', pattern: pNameNsPattern, longer_alt: [ pNameLn ]});
export const blankNodeLabel = createToken({ name: 'BlankNodeLabel', pattern: blankNodeLabelPattern });
export const var1 = createToken({ name: 'Var1', pattern: var1Pattern });
export const var2 = createToken({ name: 'Var2', pattern: var2Pattern });
export const langTag = createToken({ name: 'LangTag', pattern: langTagPattern });
export const integer = createToken({ name: 'Integer', pattern: integerPattern });
export const decimal = createToken({ name: 'Decimal', pattern: decimalPattern });
export const double = createToken({ name: 'Double', pattern: doublePattern });
export const interferePositive = createToken({ name: 'InterferePositive', pattern: interferePositivePattern });
export const decimalPositive = createToken({ name: 'DecimalPositive', pattern: decimalPositivePattern });
export const doublePositive = createToken({ name: 'DoublePositive', pattern: doublePositivePattern });
export const integerNegative = createToken({ name: 'IntegerNegative', pattern: integerNegativePattern });
export const decimalNegative = createToken({ name: 'DecimalNegative', pattern: decimalNegativePattern });
export const doubleNegative = createToken({ name: 'DoubleNegative', pattern: doubleNegativePattern });
export const stringLiteral1 = createToken({ name: 'StringLiteral1', pattern: stringLiteral1Pattern });
export const stringLiteral2 = createToken({ name: 'StringLiteral2', pattern: stringLiteral2Pattern });
export const stringLiteralLong1 = createToken({ name: 'StringLiteralLong1', pattern: stringLiteralLong1Pattern });
export const stringLiteralLong2 = createToken({ name: 'StringLiteralLong2', pattern: stringLiteralLong2Pattern });
export const ws = createToken({ name: 'Ws', pattern: wsPattern, group: Lexer.SKIPPED });
export const nil = createToken({ name: 'Nil', pattern: nilPattern });
export const anon = createToken({ name: 'Anon', pattern: anonPattern });

export const allTerminals = [
  iriRef,
  pNameNs,
  pNameLn,
  blankNodeLabel,
  var1,
  var2,
  langTag,
  integer,
  decimal,
  double,
  interferePositive,
  decimalPositive,
  doublePositive,
  integerNegative,
  decimalNegative,
  doubleNegative,
  stringLiteral1,
  stringLiteral2,
  stringLiteralLong1,
  stringLiteralLong2,
  ws,
  nil,
  anon,
];
