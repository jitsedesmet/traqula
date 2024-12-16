import type { NamedNode } from 'rdf-data-factory';
import * as l from '../../lexer/sparql11/index.js';
import type { RuleDef } from '../builder/ruleDefTypes.js';
import type { BlankTerm, IriTerm, LiteralTerm } from '../sparqlJsTypes';
import { resolveIRI } from '../utils.js';

const uriBooleanType = 'http://www.w3.org/2001/XMLSchema#boolean';
const uriIntegerType = 'http://www.w3.org/2001/XMLSchema#integer';
const uriDecimalType = 'http://www.w3.org/2001/XMLSchema#decimal';
const uriDoubleType = 'http://www.w3.org/2001/XMLSchema#double';

/**
 * [[129]](https://www.w3.org/TR/sparql11-query/#rRDFLiteral)
 */
export const rdfLiteral: RuleDef<'rdfLiteral', LiteralTerm> = <const> {
  name: 'rdfLiteral',
  impl: ({ SUBRULE, CONSUME, OPTION, OR, context }) => () => {
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
    return context.dataFactory.literal(value, languageOrDatatype);
  },
};

/**
 * [[130]](https://www.w3.org/TR/sparql11-query/#rNumericLiteral)
 */
export const numericLiteral: RuleDef<'numericLiteral', LiteralTerm> = <const> {
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
export const numericLiteralUnsigned: RuleDef<'numericLiteralUnsigned', LiteralTerm> = <const> {
  name: 'numericLiteralUnsigned',
  impl: ({ CONSUME, OR, context }) => () => OR([
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.integer).image,
      context.dataFactory.namedNode(uriIntegerType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.decimal).image,
      context.dataFactory.namedNode(uriDecimalType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.double).image,
      context.dataFactory.namedNode(uriDoubleType),
    ) },
  ]),
};

/**
 * [[132]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralPositive)
 */
export const numericLiteralPositive: RuleDef<'numericLiteralPositive', LiteralTerm> = <const> {
  name: 'numericLiteralPositive',
  impl: ({ CONSUME, OR, context }) => () => OR([
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.interferePositive).image,
      context.dataFactory.namedNode(uriIntegerType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.decimalPositive).image,
      context.dataFactory.namedNode(uriDecimalType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.doublePositive).image,
      context.dataFactory.namedNode(uriDoubleType),
    ) },
  ]),
};

/**
 * [[133]](https://www.w3.org/TR/sparql11-query/#rNumericLiteralNegative)
 */
export const numericLiteralNegative: RuleDef<'numericLiteralNegative', LiteralTerm> = <const> {
  name: 'numericLiteralNegative',
  impl: ({ CONSUME, OR, context }) => () => OR([
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.integerNegative).image,
      context.dataFactory.namedNode(uriIntegerType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.decimalNegative).image,
      context.dataFactory.namedNode(uriDecimalType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.terminals.doubleNegative).image,
      context.dataFactory.namedNode(uriDoubleType),
    ) },
  ]),
};

/**
 * [[134]](https://www.w3.org/TR/sparql11-query/#rBooleanLiteral)
 */
export const booleanLiteral: RuleDef<'booleanLiteral', LiteralTerm> = <const> {
  name: 'booleanLiteral',
  impl: ({ CONSUME, OR, context }) => () => OR([
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.true_).image.toLowerCase(),
      context.dataFactory.namedNode(uriBooleanType),
    ) },
    { ALT: () => context.dataFactory.literal(
      CONSUME(l.false_).image.toLowerCase(),
      context.dataFactory.namedNode(uriBooleanType),
    ) },
  ]),
};

/**
 * [[135]](https://www.w3.org/TR/sparql11-query/#rString)
 */
export const string: RuleDef<'string', string> = <const> {
  name: 'string',
  impl: ({ ACTION, CONSUME, OR }) => () => {
    const rawString = OR([
      { ALT: () => CONSUME(l.terminals.stringLiteral1).image.slice(1, -1) },
      { ALT: () => CONSUME(l.terminals.stringLiteral2).image.slice(1, -1) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong1).image.slice(3, -3) },
      { ALT: () => CONSUME(l.terminals.stringLiteralLong2).image.slice(3, -3) },
    ]);
    // Handle string escapes (19.7). (19.2 is handled at input level.)
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
export const iri: RuleDef<'iri', IriTerm> = <const> {
  name: 'iri',
  impl: ({ ACTION, SUBRULE, CONSUME, OR, context }) => () => OR([
    { ALT: () => {
      const iriVal = CONSUME(l.terminals.iriRef).image.slice(1, -1);
      return ACTION(() => context.dataFactory.namedNode(resolveIRI(iriVal, context.baseIRI)));
    } },
    { ALT: () => SUBRULE(prefixedName) },
  ]),
};

/**
 * [[137]](https://www.w3.org/TR/sparql11-query/#rPrefixedName)
 */
export const prefixedName: RuleDef<'prefixedName', IriTerm> = <const> {
  name: 'prefixedName',
  impl: ({ ACTION, CONSUME, OR, context }) => () => {
    const fullStr = OR([
      { ALT: () => CONSUME(l.terminals.pNameLn).image },
      { ALT: () => CONSUME(l.terminals.pNameNs).image },
    ]);
    return ACTION(() => {
      const [ prefix, localName ] = fullStr.split(':');
      return context.dataFactory.namedNode(context.prefixes[prefix] + localName);
    });
  },
};

/**
 * [[138]](https://www.w3.org/TR/sparql11-query/#rBlankNode)
 */
export const blankNode: RuleDef<'blankNode', BlankTerm> = <const> {
  name: 'blankNode',
  impl: ({ ACTION, CONSUME, OR, context }) => () => {
    const result = OR([
      {
        ALT: () => {
          const label = CONSUME(l.terminals.blankNodeLabel).image;
          ACTION(() => {
            if (context.flushedBlankNodeLabels.has(label)) {
              throw new Error('Detected reuse blank node across different request string.');
            }
            context.usedBlankNodeLabels.add(label);
          });
          return ACTION(() => context.dataFactory.blankNode(label.replace('_:', 'e_')));
        },
      },
      {
        ALT: () => {
          CONSUME(l.terminals.anon);
          return ACTION(() => context.dataFactory.blankNode());
        },
      },
    ]);
    ACTION(() => {
      if (!context.canParseBlankNodes) {
        throw new Error('Blank nodes are not allowed in this context');
      }
    });
    return result;
  },
};
