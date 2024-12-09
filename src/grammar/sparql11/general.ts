import * as l from '../../lexer/sparql11/index.js';
import type { RuleDef } from '../parserBuilder.js';
import type { BaseQuery, IriTerm, Term, Triple, VariableTerm } from '../sparqlJSTypes.js';
import { blankNode, booleanLiteral, iri, numericLiteral, rdfLiteral } from './literals.js';
import { triplesSameSubject } from './tripleBlock.js';

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * [[4]](https://www.w3.org/TR/sparql11-query/#rPrologue)
 */
export const prologue: RuleDef<'prologue', Pick<BaseQuery, 'base' | 'prefixes'>> = {
  name: 'prologue',
  impl: ({ ACTION, SUBRULE, MANY, OR }) => () => {
    const result: Pick<BaseQuery, 'base' | 'prefixes'> = {
      prefixes: {},
    };
    MANY(() => {
      OR([
        {
          ALT: () => {
            result.base = SUBRULE(baseDecl);
          },
        },
        {
          ALT: () => {
            const pref = SUBRULE(prefixDecl);
            ACTION(() => {
              const [ name, value ] = pref;
              result.prefixes[name] = value;
            });
          },
        },
      ]);
    });
    return result;
  },
};

/**
 * [[5]](https://www.w3.org/TR/sparql11-query/#rBaseDecl)
 */
export const baseDecl: RuleDef<'baseDecl', string> = {
  name: 'baseDecl',
  impl: ({ CONSUME, ACTION, context }) => () => {
    CONSUME(l.baseDecl);
    const base = CONSUME(l.terminals.iriRef).image.slice(1, -1);
    return ACTION(() => {
      context.baseIRI = base;
      return base;
    });
  },
};

/**
 * [[6]](https://www.w3.org/TR/sparql11-query/#rPrefixDecl)
 */
export const prefixDecl: RuleDef<'prefixDecl', [string, string]> = {
  name: 'prefixDecl',
  impl: ({ CONSUME, ACTION, context }) => () => {
    CONSUME(l.prefixDecl);
    const name = CONSUME(l.terminals.pNameNs).image.slice(0, -1);
    const value = CONSUME(l.terminals.iriRef).image.slice(1, -1);
    ACTION(() => context.prefixes[name] = value);
    return [ name, value ];
  },
};

/**
 * [[52]](https://www.w3.org/TR/sparql11-query/#rTriplesTemplate)
 */
export const triplesTemplate: RuleDef<'triplesTemplate', Triple[]> = {
  name: 'triplesTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    const triples: Triple[][] = [];

    triples.push(SUBRULE(triplesSameSubject));
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        triples.push(SUBRULE(triplesTemplate));
      });
    });

    return triples.flat(1);
  },
};

/**
 * [[78]](https://www.w3.org/TR/sparql11-query/#rVerb)
 */
export const verb: RuleDef<'verb', VariableTerm | IriTerm> = {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR, context }) => () => OR([
    { ALT: () => SUBRULE(varOrIri) },
    {
      ALT: () => {
        CONSUME(l.a);
        return context.dataFactory.namedNode(`${RDF}type`);
      },
    },
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
  impl: ({ CONSUME, OR, context }) => () => OR([
    { ALT: () => context.dataFactory.variable(CONSUME(l.terminals.var1).image.slice(1)) },
    { ALT: () => context.dataFactory.variable(CONSUME(l.terminals.var2).image.slice(1)) },
  ]),
};

/**
 * [[109]](https://www.w3.org/TR/sparql11-query/#rGraphTerm)
 */
export const graphTerm: RuleDef<'graphTerm', Term> = {
  name: 'graphTerm',
  impl: ({ SUBRULE, CONSUME, OR, context }) => () => OR<Term>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { ALT: () => SUBRULE(blankNode) },
    {
      ALT: () => {
        CONSUME(l.terminals.nil);
        return context.dataFactory.namedNode(`${RDF}nil`);
      },
    },
  ]),
};
