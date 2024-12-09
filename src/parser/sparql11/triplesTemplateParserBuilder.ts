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
  varOrIri,
  objectList,
  object,
  collection,
  blankNodePropertyList,
  graphNode,
];

export type TriplesTemplateParserArgs = [...typeof rules];

export const triplesTemplateParserBuilder: Builder<TriplesTemplateParserArgs> = Builder.createBuilder(rules);
