import { DataFactory } from 'rdf-data-factory';
import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import type { BaseQuery, IriTerm, Term, VariableTerm } from '../sparqlJSTypes';
import { blankNode, booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals';

const factory = new DataFactory();
;const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * [[4]](https://www.w3.org/TR/sparql11-query/#rPrologue)
 */
export const prologue: RuleDef<'prologue', Pick<BaseQuery, 'base' | 'prefixes'>> = {
  name: 'prologue',
  impl: ({ SUBRULE, MANY, OR }) => () => {
    let base: undefined | string;
    const prefixes: Record<string, string> = {};
    MANY(() => {
      OR([
        { ALT: () => {
          base = SUBRULE(baseDecl);
        } },
        { ALT: () => {
          const [ name, value ] = SUBRULE(prefixDecl);
          prefixes[name] = value;
        } },
      ]);
    });
    return {
      base,
      prefixes,
    };
  },
};

/**
 * [[5]](https://www.w3.org/TR/sparql11-query/#rBaseDecl)
 */
export const baseDecl: RuleDef<'baseDecl', string> = {
  name: 'baseDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.baseDecl);
    return CONSUME(l.terminals.iriRef).image;
  },
};

/**
 * [[6]](https://www.w3.org/TR/sparql11-query/#rPrefixDecl)
 */
export const prefixDecl: RuleDef<'prefixDecl', [string, string]> = {
  name: 'prefixDecl',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.prefixDecl);
    const name = CONSUME(l.terminals.pNameNs).image;
    const value = CONSUME(l.terminals.iriRef).image;
    return [ name, value ];
  },
};

/**
 * [[52]](https://www.w3.org/TR/sparql11-query/#rTriplesTemplate)
 */
export const triplesTemplate: RuleDef<'triplesTemplate'> = {
  name: 'triplesTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubject);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(triplesTemplate);
      });
    });
  },
};

/**
 * [[75]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubject)
 */
export const triplesSameSubject: RuleDef<'triplesSameSubject'> = {
  name: 'triplesSameSubject',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      {
        ALT: () => {
          SUBRULE(varOrTerm);
          SUBRULE(propertyListNotEmpty);
        },
      },
      {
        ALT: () => {
          SUBRULE(triplesNode);
          SUBRULE(propertyList);
        },
      },
    ]);
  },
};

/**
 * [[76]](https://www.w3.org/TR/sparql11-query/#rPropertyList)
 */
export const propertyList: RuleDef<'propertyList'> = {
  name: 'propertyList',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListNotEmpty);
    });
  },
};

/**
 * [[77]](https://www.w3.org/TR/sparql11-query/#rPropertyListNotEmpty)
 */
export const propertyListNotEmpty: RuleDef<'propertyListNotEmpty'> = {
  name: 'propertyListNotEmpty',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION }) => () => {
    SUBRULE1(verb);
    SUBRULE1(objectList);
    MANY(() => {
      CONSUME(l.symbols.semi);
      OPTION(() => {
        SUBRULE2(verb);
        SUBRULE2(objectList);
      });
    });
  },
};

/**
 * [[78]](https://www.w3.org/TR/sparql11-query/#rVerb)
 */
export const verb: RuleDef<'verb'> = {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrIri) },
      { ALT: () => CONSUME(l.a) },
    ]);
  },
};

/**
 * [[79]](https://www.w3.org/TR/sparql11-query/#rObjectList)
 */
export const objectList: RuleDef<'objectList'> = {
  name: 'objectList',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(object);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(object);
    });
  },
};

/**
 * [[80]](https://www.w3.org/TR/sparql11-query/#rObject)
 */
export const object: RuleDef<'object'> = {
  name: 'object',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNode);
  },
};

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 */
export const triplesNode: RuleDef<'triplesNode'> = {
  name: 'triplesNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collection) },
      { ALT: () => SUBRULE(blankNodePropertyList) },
    ]);
  },
};

/**
 * [[99]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyList)
 */
export const blankNodePropertyList: RuleDef<'blankNodePropertyList'> = {
  name: 'blankNodePropertyList',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

/**
 * [[102]](https://www.w3.org/TR/sparql11-query/#rCollection)
 */
export const collection: RuleDef<'collection'> = {
  name: 'collection',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNode);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rGraphNode)
 */
export const graphNode: RuleDef<'graphNode', Term> = {
  name: 'graphNode',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(varOrTerm) },
    { ALT: () => SUBRULE(triplesNode) },
  ]),
};

/**
 * [[106]](https://www.w3.org/TR/sparql11-query/#rVarOrTerm)
 */
export const varOrTerm: RuleDef<'varOrTerm', Term> = {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR }) => () => OR([
    { ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(graphTerm) },
  ]),
};

/**
 * [[107]](https://www.w3.org/TR/sparql11-query/#rVarOrIri)
 */
export const varOrIri: RuleDef<'varOrIri', IriTerm | VariableTerm> = {
  name: 'varOrIri',
  impl: ({ SUBRULE, OR }) => () => OR<IriTerm | VariableTerm>([
    { ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
  ]),
};

/**
 * [[108]](https://www.w3.org/TR/sparql11-query/#rVar)
 */
export const var_: RuleDef<'var', VariableTerm> = {
  name: 'var',
  impl: ({ CONSUME, OR }) => () => OR([
    { ALT: () => factory.variable(CONSUME(l.terminals.var1).image) },
    { ALT: () => factory.variable(CONSUME(l.terminals.var2).image) },
  ]),
};

/**
 * [[109]](https://www.w3.org/TR/sparql11-query/#rGraphTerm)
 */
export const graphTerm: RuleDef<'graphTerm', Term> = {
  name: 'graphTerm',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR<Term>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(blankNode) },
    { ALT: () => {
      CONSUME(l.terminals.nil);
      return factory.namedNode(`${RDF}nil`);
    } },
  ]),
};
