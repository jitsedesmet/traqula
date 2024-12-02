import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';
import { graphTerm, triplesTemplate, var_, varOrIri, varOrTerm, verb } from '../general';
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
} from '../literals';
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
} from '../tripleBlock';

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

export const triplesTemplateParser = triplesTemplateParserBuilder.consume(allTokens);
