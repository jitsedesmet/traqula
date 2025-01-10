import { Builder } from '@traqula/core/lib/grammar-builder/parserBuilder';
import { graphTerm, var_, varOrIri, varOrTerm, verb, verbA } from '@traqula/rules-sparql-1-1/lib/grammar/general';
import {
  blankNodePropertyList,
  collection,
  graphNode,
  object,
  objectList,
  propertyListNotEmpty,
  triplesNode,
} from '@traqula/rules-sparql-1-1/lib/grammar';
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
} from '@traqula/rules-sparql-1-1/lib/grammar/literals';

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
  verbA,
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
