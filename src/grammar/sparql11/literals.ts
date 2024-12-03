import { DataFactory, type NamedNode } from 'rdf-data-factory';
import * as l from '../../lexer/sparql11/index.js';
import type { RuleDef } from '../parserBuilder.js';
import type { BlankTerm, IriTerm, LiteralTerm } from '../sparqlJSTypes.js';

const factory = new DataFactory();
const uriBooleanType = 'http://www.w3.org/2001/XMLSchema#boolean';
const uriIntegerType = 'http://www.w3.org/2001/XMLSchema#integer';
const uriDecimalType = 'http://www.w3.org/2001/XMLSchema#decimal';
const uriDoubleType = 'http://www.w3.org/2001/XMLSchema#double';

/**
 * [[129]](https://www.w3.org/TR/sparql11-query/#rRDFLiteral)
 */
export const rdfLiteral: RuleDef<'rdfLiteral', LiteralTerm> = {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, CONSUME, OPTION, OR }) => () => {
    const value = SUBRULE(string);
    const languageOrDatatype = OPTION(() => OR<string | NamedNode>([
      { ALT: () => CONSUME(l.terminals.langTag).image },
      {
        ALT: () => {
          CONSUME(l.symbols.hathat);
          return SUBRULE(iri);
        },
      },
    ]));
    return factory.literal(value, languageOrDatatype);
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
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => factory.literal(CONSUME(l.terminals.integer).image, factory.namedNode(uriIntegerType)) },
    { ALT: () => factory.literal(CONSUME(l.terminals.decimal).image, factory.namedNode(uriDecimalType)) },
    { ALT: () => factory.literal(CONSUME(l.terminals.double).image, factory.namedNode(uriDoubleType)) },
  ]),
};

/**
 * [[132]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralPositive)
 */
export const numericLiteralPositive: RuleDef<'numericLiteralPositive', LiteralTerm> = {
  name: 'numericLiteralPositive',
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => factory.literal(CONSUME(l.terminals.interferePositive).image, factory.namedNode(uriIntegerType)) },
    { ALT: () => factory.literal(CONSUME(l.terminals.decimalPositive).image, factory.namedNode(uriDecimalType)) },
    { ALT: () => factory.literal(CONSUME(l.terminals.doublePositive).image, factory.namedNode(uriDoubleType)) },
  ]),
};

/**
 * [[133]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralNegative)
 */
export const numericLiteralNegative: RuleDef<'numericLiteralNegative', LiteralTerm> = {
  name: 'numericLiteralNegative',
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => factory.literal(CONSUME(l.terminals.integerNegative).image, factory.namedNode(uriIntegerType)) },
    { ALT: () => factory.literal(CONSUME(l.terminals.decimalNegative).image, factory.namedNode(uriDecimalType)) },
    { ALT: () => factory.literal(CONSUME(l.terminals.doubleNegative).image, factory.namedNode(uriDoubleType)) },
  ]),
};

/**
 * [[134]](https://www.w3.org/TR/sparql11-query/#rBooleanLiteral)
 */
export const booleanLiteral: RuleDef<'booleanLiteral', LiteralTerm> = {
  name: 'booleanLiteral',
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => factory.literal(CONSUME(l.true_).image, factory.namedNode(uriBooleanType)) },
    { ALT: () => factory.literal(CONSUME(l.false_).image, factory.namedNode(uriBooleanType)) },
  ]),
};

/**
 * [[135]](https://www.w3.org/TR/sparql11-query/#rString)
 */
export const string: RuleDef<'string', string> = {
  name: 'string',
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => CONSUME(l.terminals.stringLiteral1).image },
    { ALT: () => CONSUME(l.terminals.stringLiteral2).image },
    { ALT: () => CONSUME(l.terminals.stringLiteralLong1).image },
    { ALT: () => CONSUME(l.terminals.stringLiteralLong2).image },
  ]),
};

/**
 * [[136]](https://www.w3.org/TR/sparql11-query/#riri)
 */
export const iri: RuleDef<'iri', IriTerm> = {
  name: 'iri',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR([
    { ALT: () => factory.namedNode(CONSUME(l.terminals.iriRef).image.slice(1, -1)) },
    { ALT: () => SUBRULE(prefixedName) },
  ]),
};

/**
 * [[137]](https://www.w3.org/TR/sparql11-query/#rPrefixedName)
 */
export const prefixedName: RuleDef<'prefixedName', IriTerm> = {
  name: 'prefixedName',
  impl: ({ ACTION, CONSUME, OR, prefixes }) => () => {
    const fullStr = OR([
      { ALT: () => CONSUME(l.terminals.pNameLn).image },
      { ALT: () => CONSUME(l.terminals.pNameNs).image },
    ]);
    return ACTION(() => {
      const [ prefix, localName ] = fullStr.split(':');
      return factory.namedNode(prefixes[prefix] + localName);
    });
  },
};

/**
 * [[138]](https://www.w3.org/TR/sparql11-query/#rBlankNode)
 */
export const blankNode: RuleDef<'blankNode', BlankTerm> = {
  name: 'blankNode',
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => factory.blankNode(CONSUME(l.terminals.blankNodeLabel).image.replace('_:', '')) },
    { ALT: () => factory.blankNode() },
  ]),
};
