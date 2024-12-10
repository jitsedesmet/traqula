import { Builder } from '../../grammar/builder/parserBuilder';
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

const rules = <const> [
  objectList,
  object,
  graphNode,
  varOrTerm,
  triplesNode,
  collection,
  blankNodePropertyList,
  propertyListNotEmpty,
  // PropertyListNotEmpty
  verb,
  varOrIri,
  var_,
  iri,
  prefixedName,
  graphTerm,
  rdfLiteral,
  numericLiteral,
  booleanLiteral,
  blankNode,
  string,
  numericLiteralUnsigned,
  numericLiteralPositive,
  numericLiteralNegative,
];

export type ObjectListParserArgs = [...typeof rules];

export const objectListBuilder = Builder.createBuilder(rules);
