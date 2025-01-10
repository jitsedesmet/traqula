import { Builder } from '@traqula/core/lib/grammar-builder/parserBuilder';
import { graphTerm, triplesTemplate, var_, varOrIri, varOrTerm, verb, verbA } from '@traqula/rules-sparql-1-1/lib/grammar/general';
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
} from '@traqula/rules-sparql-1-1/lib/grammar/tripleBlock';

const rules = <const> [
  triplesTemplate,
  triplesSameSubject,
  varOrTerm,
  propertyListNotEmpty,
  triplesNode,
  propertyList,
  var_,
  graphTerm,
  iri,
  prefixedName,
  rdfLiteral,
  string,
  numericLiteral,
  numericLiteralUnsigned,
  numericLiteralPositive,
  numericLiteralNegative,
  booleanLiteral,
  blankNode,
  verb,
  verbA,
  varOrIri,
  objectList,
  object,
  collection,
  blankNodePropertyList,
];

export type TriplesTemplateParserArgs = [...typeof rules];

export const triplesTemplateParserBuilder = Builder.createBuilder(rules)
  .addRule(graphNode);
