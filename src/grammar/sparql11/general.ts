import * as l from '../../lexer/sparql11/index.js';
import type { RuleDef } from '../builder/ruleDefTypes.js';
import type { BaseQuery, IriTerm, Term, Triple, VariableTerm } from '../sparqlJsTypes';
import { CommonIRIs } from '../utils';
import { blankNode, booleanLiteral, canCreateBlankNodes, iri, numericLiteral, rdfLiteral } from './literals.js';
import { triplesSameSubject } from './tripleBlock.js';

/**
 * [[4]](https://www.w3.org/TR/sparql11-query/#rPrologue)
 */
export const prologue: RuleDef<'prologue', Pick<BaseQuery, 'base' | 'prefixes'>> = <const> {
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
export const baseDecl: RuleDef<'baseDecl', string> = <const> {
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
export const prefixDecl: RuleDef<'prefixDecl', [string, string]> = <const> {
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
export const triplesTemplate: RuleDef<'triplesTemplate', Triple[]> = <const> {
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
export const verb: RuleDef<'verb', VariableTerm | IriTerm> = <const> {
  name: 'verb',
  impl: ({ SUBRULE, CONSUME, OR, context }) => () => OR([
    { ALT: () => SUBRULE(varOrIri) },
    {
      ALT: () => {
        CONSUME(l.a);
        return context.dataFactory.namedNode(CommonIRIs.TYPE);
      },
    },
  ]),
};

/**
 * [[106]](https://www.w3.org/TR/sparql11-query/#rVarOrTerm)
 */
export const varOrTerm: RuleDef<'varOrTerm', Term> = <const> {
  name: 'varOrTerm',
  impl: ({ SUBRULE, OR, context }) => () => OR([
    { GATE: () => context.queryMode.has(canParseVars), ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(graphTerm) },
  ]),
};

/**
 * [[107]](https://www.w3.org/TR/sparql11-query/#rVarOrIri)
 */
export const varOrIri: RuleDef<'varOrIri', IriTerm | VariableTerm> = <const> {
  name: 'varOrIri',
  impl: ({ SUBRULE, OR, context }) => () => OR<IriTerm | VariableTerm>([
    { GATE: () => context.queryMode.has(canParseVars), ALT: () => SUBRULE(var_) },
    { ALT: () => SUBRULE(iri) },
  ]),
};

export const canParseVars = Symbol('canParseVars');

/**
 * [[108]](https://www.w3.org/TR/sparql11-query/#rVar)
 */
export const var_: RuleDef<'var', VariableTerm> = <const> {
  name: 'var',
  impl: ({ ACTION, CONSUME, OR, context }) => () => {
    const result = OR([
      { ALT: () => context.dataFactory.variable(CONSUME(l.terminals.var1).image.slice(1)) },
      { ALT: () => context.dataFactory.variable(CONSUME(l.terminals.var2).image.slice(1)) },
    ]);
    ACTION(() => {
      if (!context.queryMode.has(canParseVars)) {
        throw new Error('Variables are not allowed here');
      }
    });
    return result;
  },
};

/**
 * [[109]](https://www.w3.org/TR/sparql11-query/#rGraphTerm)
 */
export const graphTerm: RuleDef<'graphTerm', Term> = <const> {
  name: 'graphTerm',
  impl: ({ SUBRULE, CONSUME, OR, context }) => () => OR<Term>([
    { ALT: () => SUBRULE(iri) },
    { ALT: () => SUBRULE(rdfLiteral) },
    { ALT: () => SUBRULE(numericLiteral) },
    { ALT: () => SUBRULE(booleanLiteral) },
    { GATE: () => context.queryMode.has(canCreateBlankNodes), ALT: () => SUBRULE(blankNode) },
    {
      ALT: () => {
        CONSUME(l.terminals.nil);
        return context.dataFactory.namedNode(CommonIRIs.NIL);
      },
    },
  ]),
};
