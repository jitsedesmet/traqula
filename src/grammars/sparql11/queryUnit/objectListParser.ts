import { allTokens } from '../../../lexer';
import { Builder } from '../../buildExample';
import { graphTerm, var_, varOrIri, varOrTerm, verb } from '../general';
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
  propertyListNotEmpty,
  triplesNode,
} from '../tripleBlock';

export const objectListBuilder = Builder.createBuilder(false)
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

export const objectListParser = objectListBuilder.consume(allTokens);
