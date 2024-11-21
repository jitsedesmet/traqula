import { DataFactory } from 'rdf-data-factory';
import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import type { BaseQuery, IriTerm, Term, VariableTerm } from '../sparqlJSTypes';
import { blankNode, booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals';
import { triplesSameSubject } from './tripleBlock';

const factory = new DataFactory();
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

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
    SUBRULE(triplesSameSubject, { allowPaths: false });
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(triplesTemplate);
      });
    });
  },
};

/**
 * [[78]](https://www.w3.org/TR/sparql11-query/#rVerb)
 */
export const verb: RuleDef<'verb', VariableTerm | IriTerm> = {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR([
    { ALT: () => SUBRULE(varOrIri) },
    { ALT: () => {
      CONSUME(l.a);
      return factory.namedNode(`${RDF}type`);
    } },
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
