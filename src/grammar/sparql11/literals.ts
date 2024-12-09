import type { NamedNode } from 'rdf-data-factory';
import * as l from '../../lexer/sparql11/index.js';
import type { OmitRuleDef, RuleDef, RuleDefsCheckOverlap, RuleDefsToRecord } from '../parserBuilder.js';
import type { BlankTerm, IriTerm, LiteralTerm } from '../sparqlJSTypes.js';
import { resolveIRI } from '../utils.js';

const uriBooleanType = 'http://www.w3.org/2001/XMLSchema#boolean';
const uriIntegerType = 'http://www.w3.org/2001/XMLSchema#integer';
const uriDecimalType = 'http://www.w3.org/2001/XMLSchema#decimal';
const uriDoubleType = 'http://www.w3.org/2001/XMLSchema#double';

/**
 * [[129]](https://www.w3.org/TR/sparql11-query/#rRDFLiteral)
 */
export const rdfLiteral: RuleDef<'rdfLiteral', LiteralTerm> = {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, CONSUME, OPTION, OR, context: { dataFactory }}) => () => {
    const value = SUBRULE(string);
    const languageOrDatatype = OPTION(() => OR<string | NamedNode>([
      { ALT: () => CONSUME(l.terminals.langTag).image.slice(1) },
      {
        ALT: () => {
          CONSUME(l.symbols.hathat);
          return SUBRULE(iri);
        },
      },
    ]));
    return dataFactory.literal(value, languageOrDatatype);
  },
};

/**
 * [[130]](https://www.w3.org/TR/sparql11-query/#rNumericLiteral)
 */
export const numericLiteral: RuleDef<'numericLiteral', LiteralTerm> = {
  name: 'numericLiteral',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(numericLiteralUnsigned) },
    { ALT: () => SUBRULE(numericLiteralPositive) },
    { ALT: () => SUBRULE(numericLiteralNegative) },
  ]),
};

/**
 * [[131]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralUnsigned)
 */
export const numericLiteralUnsigned: RuleDef<'numericLiteralUnsigned', LiteralTerm> = {
  name: 'numericLiteralUnsigned',
  impl: ({ CONSUME, OR, context: { dataFactory }}) => () => OR([
    { ALT: () => dataFactory.literal(CONSUME(l.terminals.integer).image, dataFactory.namedNode(uriIntegerType)) },
    { ALT: () => dataFactory.literal(CONSUME(l.terminals.decimal).image, dataFactory.namedNode(uriDecimalType)) },
    { ALT: () => dataFactory.literal(CONSUME(l.terminals.double).image, dataFactory.namedNode(uriDoubleType)) },
  ]),
};

/**
 * [[132]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralPositive)
 */
export const numericLiteralPositive: RuleDef<'numericLiteralPositive', LiteralTerm> = {
  name: 'numericLiteralPositive',
  impl: ({ CONSUME, OR, context: { dataFactory }}) => () => OR([
    { ALT: () =>
      dataFactory.literal(CONSUME(l.terminals.interferePositive).image, dataFactory.namedNode(uriIntegerType)) },
    { ALT: () =>
      dataFactory.literal(CONSUME(l.terminals.decimalPositive).image, dataFactory.namedNode(uriDecimalType)) },
    { ALT: () => dataFactory.literal(CONSUME(l.terminals.doublePositive).image, dataFactory.namedNode(uriDoubleType)) },
  ]),
};

/**
 * [[133]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralNegative)
 */
export const numericLiteralNegative: RuleDef<'numericLiteralNegative', LiteralTerm> = {
  name: 'numericLiteralNegative',
  impl: ({ CONSUME, OR, context: { dataFactory }}) => () => OR([
    { ALT: () =>
      dataFactory.literal(CONSUME(l.terminals.integerNegative).image, dataFactory.namedNode(uriIntegerType)) },
    { ALT: () =>
      dataFactory.literal(CONSUME(l.terminals.decimalNegative).image, dataFactory.namedNode(uriDecimalType)) },
    { ALT: () => dataFactory.literal(CONSUME(l.terminals.doubleNegative).image, dataFactory.namedNode(uriDoubleType)) },
  ]),
};

/**
 * [[134]](https://www.w3.org/TR/sparql11-query/#rBooleanLiteral)
 */
export const booleanLiteral: RuleDef<'booleanLiteral', LiteralTerm> = {
  name: 'booleanLiteral',
  impl: ({ CONSUME, OR, context: { dataFactory }}) => () => OR([
    { ALT: () => dataFactory.literal(CONSUME(l.true_).image.toLowerCase(), dataFactory.namedNode(uriBooleanType)) },
    { ALT: () => dataFactory.literal(CONSUME(l.false_).image.toLowerCase(), dataFactory.namedNode(uriBooleanType)) },
  ]),
};

/**
 * [[135]](https://www.w3.org/TR/sparql11-query/#rString)
 */
export const string: RuleDef<'string', string> = {
  name: 'string',
  impl: ({ ACTION, CONSUME, OR }) => () => {
    const rawString = OR([
      { ALT: () => CONSUME(l.terminals.stringLiteral1).image.slice(1, -1) },
      { ALT: () => CONSUME(l.terminals.stringLiteral2).image.slice(1, -1) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong1).image.slice(3, -3) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong2).image.slice(3, -3) },
    ]);
    return ACTION(() => rawString.replaceAll(/\\([tnrbf"'\\])/gu, (_, char: string) => {
      switch (char) {
        case 't': return '\t';
        case 'n': return '\n';
        case 'r': return '\r';
        case 'b': return '\b';
        case 'f': return '\f';
        default: return char;
      }
    }));
  },
};

/**
 * [[136]](https://www.w3.org/TR/sparql11-query/#riri)
 */
export const iri: RuleDef<'iri', IriTerm> = {
  name: 'iri',
  impl: ({ ACTION, SUBRULE, CONSUME, OR, context }) => () => OR([
    { ALT: () => {
      const iriVal = CONSUME(l.terminals.iriRef).image.slice(1, -1);
      return ACTION(() => context.dataFactory.namedNode(resolveIRI(iriVal, context.baseIRI)));
    } },
    { ALT: () => SUBRULE(prefixedName) },
  ]),
};

const test = <const> [ iri, string ];
const test2 = <const> [ numericLiteralPositive, numericLiteralNegative, iri ];
type Test = OmitRuleDef<typeof test, 'iri'>;
type Test2 = RuleDefsCheckOverlap<typeof test, typeof test2>;
const tester: RuleDefsToRecord<typeof test> = <RuleDefsToRecord<typeof test>><unknown> null;
const appel = tester.iri;

/**
 * [[137]](https://www.w3.org/TR/sparql11-query/#rPrefixedName)
 */
export const prefixedName: RuleDef<'prefixedName', IriTerm> = {
  name: 'prefixedName',
  impl: ({ ACTION, CONSUME, OR, context: { prefixes, dataFactory }}) => () => {
    const fullStr = OR([
      { ALT: () => CONSUME(l.terminals.pNameLn).image },
      { ALT: () => CONSUME(l.terminals.pNameNs).image },
    ]);
    return ACTION(() => {
      const [ prefix, localName ] = fullStr.split(':');
      return dataFactory.namedNode(prefixes[prefix] + localName);
    });
  },
};

/**
 * [[138]](https://www.w3.org/TR/sparql11-query/#rBlankNode)
 */
export const blankNode: RuleDef<'blankNode', BlankTerm> = {
  name: 'blankNode',
  impl: ({ ACTION, CONSUME, OR, context: { dataFactory }}) => () => OR([
    { ALT: () => {
      const label = CONSUME(l.terminals.blankNodeLabel);
      return ACTION(() => dataFactory.blankNode(label.image.replace('_:', 'e_')));
    } },
    { ALT: () => {
      CONSUME(l.terminals.anon);
      return ACTION(() => dataFactory.blankNode());
    } },
  ]),
};
