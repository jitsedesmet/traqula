import { Builder } from '../../grammar/parserBuilder.js';
import { graphTerm, triplesTemplate, var_, varOrIri, varOrTerm, verb } from '../../grammar/sparql11/general.js';
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
  propertyList,
  propertyListNotEmpty,
  triplesNode,
  triplesSameSubject,
} from '../../grammar/sparql11/tripleBlock.js';

export type TriplesTemplateParserArgs = '' |
  'triplesTemplate' |
  'triplesSameSubject' |
  'varOrTerm' |
  'propertyListNotEmpty' |
  'triplesNode' |
  'propertyList' |
  'var' |
  'graphTerm' |
  'iri' |
  'prefixedName' |
  'rdfLiteral' |
  'string' |
  'numericLiteral' |
  'numericLiteralUnsigned' |
  'numericLiteralPositive' |
  'numericLiteralNegative' |
  'booleanLiteral' |
  'blankNode' |
  'verb' |
  'varOrIri' |
  'objectList' |
  'object' |
  'collection' |
  'blankNodePropertyList' |
  'graphNode';

export const triplesTemplateParserBuilder = Builder.createBuilder(false)
  .addRule(triplesTemplate)
  .addRule(triplesSameSubject)
  .addRule(varOrTerm)
  .addRule(propertyListNotEmpty)
  .addRule(triplesNode)
  .addRule(propertyList)
  .addRule(var_)
  .addRule(graphTerm)
  .addRule(iri)
  .addRule(prefixedName)
  .addRule(rdfLiteral)
  .addRule(string)
  .addRule(numericLiteral)
  .addRule(numericLiteralUnsigned)
  .addRule(numericLiteralPositive)
  .addRule(numericLiteralNegative)
  .addRule(booleanLiteral)
  .addRule(blankNode)
  .addRule(verb)
  .addRule(varOrIri)
  .addRule(objectList)
  .addRule(object)
  .addRule(collection)
  .addRule(blankNodePropertyList)
  .addRule(graphNode);
