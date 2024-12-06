import { Builder } from '../../grammar/parserBuilder.js';
import { graphTerm, var_, varOrIri, varOrTerm, verb } from '../../grammar/sparql11/general.js';
import {
  blankNode,
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
import {
  blankNodePropertyList,
  collection,
  graphNode,
  object,
  objectList,
  propertyListNotEmpty,
  triplesNode,
} from '../../grammar/sparql11/tripleBlock.js';

export type ObjectListBuilderArgs = '' |
  'objectList' |
  'object' |
  'graphNode' |
  'varOrTerm' |
  'triplesNode' |
  'collection' |
  'blankNodePropertyList' |
  'propertyListNotEmpty' |
  'verb' |
  'varOrIri' |
  'var' |
  'iri' |
  'prefixedName' |
  'graphTerm' |
  'rdfLiteral' |
  'numericLiteral' |
  'booleanLiteral' |
  'blankNode' |
  'string' |
  'numericLiteralUnsigned' |
  'numericLiteralPositive' |
  'numericLiteralNegative';

export const objectListBuilder: Builder<ObjectListBuilderArgs> = Builder.createBuilder()
  .addRule(objectList)
  .addRule(object)
  .addRule(graphNode)
  .addRule(varOrTerm)
  .addRule(triplesNode)
  .addRule(collection)
  .addRule(blankNodePropertyList)
  .addRule(propertyListNotEmpty)
  // PropertyListNotEmpty
  .addRule(verb)
  .addRule(varOrIri)
  .addRule(var_)
  .addRule(iri)
  .addRule(prefixedName)
  .addRule(graphTerm)
  .addRule(rdfLiteral)
  .addRule(numericLiteral)
  .addRule(booleanLiteral)
  .addRule(blankNode)
  .addRule(string)
  .addRule(numericLiteralUnsigned)
  .addRule(numericLiteralPositive)
  .addRule(numericLiteralNegative);
