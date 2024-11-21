import type { TokenType } from 'chevrotain';
import { DataFactory } from 'rdf-data-factory';
import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';

import type { IriTerm, NegatedPropertySet, PropertyPath } from '../sparqlJSTypes';
import { iri } from './literals';

const factory = new DataFactory();
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * [[88]](https://www.w3.org/TR/sparql11-query/#rPath)
 */
export const path: RuleDef<'path', PropertyPath | IriTerm> = {
  name: 'path',
  impl: ({ SUBRULE }) => () => SUBRULE(pathAlternative),
};

export function pathHelper<T extends string>(
  name: T,
  SEP: TokenType,
  pathType: '|' | '/' | '^' | '+' | '*' | '?',
  subRule: RuleDef<string, PropertyPath | IriTerm>,
): RuleDef<T, PropertyPath | IriTerm> {
  return {
    name,
    impl: ({ SUBRULE2, AT_LEAST_ONE_SEP }) => () => {
      const alternatives: (IriTerm | PropertyPath)[] = [];
      AT_LEAST_ONE_SEP({
        DEF: () => {
          alternatives.push(SUBRULE2(subRule));
        },
        SEP,
      });
      return alternatives.length === 1 ?
        alternatives[0] :
          {
            type: 'path',
            pathType,
            items: alternatives,
          };
    },
  };
}

/**
 * [[92]](https://www.w3.org/TR/sparql11-query/#rPathEltOrInverse)
 */
export const pathEltOrInverse: RuleDef<'pathEltOrInverse', PropertyPath | IriTerm> = {
  name: 'pathEltOrInverse',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR }) => () => OR<PropertyPath | IriTerm>([
    {
      ALT: () => SUBRULE1(pathElt),
    },
    {
      ALT: () => {
        CONSUME(l.symbols.hat);
        const item = SUBRULE2(pathElt);
        return {
          type: 'path',
          pathType: '^',
          items: [
            item,
          ],
        };
      },
    },
  ]),
};

/**
 * [[90]](https://www.w3.org/TR/sparql11-query/#rPathSequence)
 */
export const pathSequence = pathHelper('pathSequence', l.symbols.slash, '/', pathEltOrInverse);

/**
 * [[89]](https://www.w3.org/TR/sparql11-query/#rPathAlternative)
 */
export const pathAlternative = pathHelper('pathAlternative', l.symbols.pipe, '|', pathSequence);

/**
 * [[91]](https://www.w3.org/TR/sparql11-query/#rPathElt)
 */
export const pathElt: RuleDef<'pathElt', PropertyPath | IriTerm> = {
  name: 'pathElt',
  impl: ({ SUBRULE, OPTION }) => () => {
    const item = SUBRULE(pathPrimary);
    const modification = OPTION(() => SUBRULE(pathMod));
    return modification === undefined ?
      item :
        {
          type: 'path',
          pathType: modification,
          items: [ item ],
        };
  },
};

/**
 * [[93]](https://www.w3.org/TR/sparql11-query/#rPathMod)
 */
export const pathMod: RuleDef<'pathMod', '*' | '+' | '?'> = {
  name: 'pathMod',
  impl: ({ CONSUME, OR }) => () => OR([
    {
      ALT: () => {
        CONSUME(l.symbols.question);
        return '?';
      },
    },
    {
      ALT: () => {
        CONSUME(l.symbols.star);
        return '*';
      },
    },
    {
      ALT: () => {
        CONSUME(l.symbols.plus);
        return '+';
      },
    },
  ]),
};

/**
 * [[94]](https://www.w3.org/TR/sparql11-query/#rPathPrimary)
 */
export const pathPrimary: RuleDef<'pathPrimary', PropertyPath | IriTerm> = {
  name: 'pathPrimary',
  impl: ({ SUBRULE, CONSUME, OR }) => () => OR<PropertyPath | IriTerm>([
    { ALT: () => SUBRULE(iri) },
    {
      ALT: () => {
        CONSUME(l.a);
        return factory.namedNode(`${RDF}type`);
      },
    },
    {
      ALT: () => {
        CONSUME(l.symbols.exclamation);
        const negatedPath = SUBRULE(pathNegatedPropertySet);
        return {
          type: 'path',
          pathType: '!',
          items: negatedPath,
        };
      },
    },
    {
      ALT: () => {
        CONSUME(l.symbols.LParen);
        const resRecusive = SUBRULE(path);
        CONSUME(l.symbols.RParen);
        return resRecusive;
      },
    },
  ]),
};

/**
 * [[95]](https://www.w3.org/TR/sparql11-query/#rPathNegatedPropertySet)
 */
export const pathNegatedPropertySet: RuleDef<'pathNegatedPropertySet', NegatedPropertySet['items']> = {
  name: 'pathNegatedPropertySet',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR, MANY_SEP }) => () => OR<NegatedPropertySet['items']>([
    {
      ALT: () => [ SUBRULE1(pathOneInPropertySet) ],
    },
    {
      ALT: () => {
        CONSUME(l.symbols.LParen);
        const items: NegatedPropertySet['items'] = [];
        MANY_SEP({
          DEF: () => {
            items.push(SUBRULE2(pathOneInPropertySet));
          },
          SEP: l.symbols.pipe,
        });
        CONSUME(l.symbols.RParen);
        return items;
      },
    },
  ]),
};

/**
 * [[96]](https://www.w3.org/TR/sparql11-query/#rPathOneInPropertySet)
 */
export const pathOneInPropertySet: RuleDef<'pathOneInPropertySet', NegatedPropertySet['items'][0]> = {
  name: 'pathOneInPropertySet',
  impl: ({ CONSUME1, CONSUME2, CONSUME, SUBRULE1, SUBRULE2, OR1, OR2 }) => () => OR1<NegatedPropertySet['items'][0]>([
    { ALT: () => SUBRULE1(iri) },
    { ALT: () => {
      CONSUME1(l.a);
      return factory.namedNode(`${RDF}type`);
    } },
    {
      ALT: () => {
        CONSUME(l.symbols.hat);
        const item = OR2([
          { ALT: () => SUBRULE2(iri) },
          { ALT: () => {
            CONSUME2(l.a);
            return factory.namedNode(`${RDF}type`);
          } },
        ]);
        return {
          type: 'path',
          pathType: '^',
          items: [ item ],
        };
      },
    },
  ]),
};
