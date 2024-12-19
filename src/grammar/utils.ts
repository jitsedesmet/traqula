import type { GroupPattern, Pattern, PropertyPath, Term, VariableTerm } from './sparqlJsTypes';

export enum CommonIRIs {
  // XSD
  BOOLEAN = 'http://www.w3.org/2001/XMLSchema#boolean',
  INTEGER = 'http://www.w3.org/2001/XMLSchema#integer',
  DECIMAL = 'http://www.w3.org/2001/XMLSchema#decimal',
  DOUBLE = 'http://www.w3.org/2001/XMLSchema#double',
  // RDF
  FIRST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
  REST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
  NIL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil',
  TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  REIFIES = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#reifies',
}

export function unCapitalize<T extends string>(str: T): Uncapitalize<T> {
  return <Uncapitalize<T>> (str.charAt(0).toLowerCase() + str.slice(1));
}

/**
 * Resolves an IRI against a base path
 */
export function resolveIRI(iri: string, base: string | undefined): string {
  // Strip off possible angular brackets
  if (iri.startsWith('<')) {
    iri = iri.slice(1, -1);
  }
  // Return absolute IRIs unmodified
  if (/^[a-z][\d+.a-z-]*:/iu.test(iri)) {
    return iri;
  }
  if (!base) {
    throw new Error(`Cannot resolve relative IRI ${iri} because no base IRI was set.`);
  }
  switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined:
      return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#':
      return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?':
      return base.replace(/(?:\?.*)?$/u, iri);
    // Resolve root relative IRIs at the root of the base IRI
    case '/':
      return base + iri;
    // Resolve all other IRIs at the base IRI's path
    default:
      return base + iri;
  }
}

export function deGroupSingle(group: GroupPattern): Pattern {
  return group.patterns.length === 1 ? group.patterns[0] : group;
}

export function isVariable(term: Term | PropertyPath): term is VariableTerm {
  return 'termType' in term && term.termType === 'Variable';
}
