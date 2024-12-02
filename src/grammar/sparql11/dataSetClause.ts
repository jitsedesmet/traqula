import * as l from '../../lexer/sparql11/index';
import type { RuleDef } from '../parserBuilder';

import type { IriTerm } from '../sparqlJSTypes';
import { iri } from './literals';

/**
 * [[13]](https://www.w3.org/TR/sparql11-query/#rDatasetClause)
 */
export interface IDatasetClause {
  value: IriTerm;
  type: 'default' | 'named';
}
export const datasetClause: RuleDef<'datasetClause', IDatasetClause> = {
  name: 'datasetClause',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.from);
    return OR<IDatasetClause>([
      { ALT: () => ({ value: SUBRULE(defaultGraphClause), type: 'default' }) },
      { ALT: () => ({ value: SUBRULE(namedGraphClause), type: 'named' }) },
    ]);
  },
};

/**
 * [[14]](https://www.w3.org/TR/sparql11-query/#rDefaultGraphClause)
 */
export const defaultGraphClause: RuleDef<'defaultGraphClause', IriTerm> = {
  name: 'defaultGraphClause',
  impl: ({ SUBRULE }) => () => SUBRULE(sourceSelector),
};

/**
 * [[15]](https://www.w3.org/TR/sparql11-query/#rNamedGraphClause)
 */
export const namedGraphClause: RuleDef<'namedGraphClause', IriTerm> = {
  name: 'namedGraphClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.named);
    return SUBRULE(sourceSelector);
  },
};

/**
 * [[16]](https://www.w3.org/TR/sparql11-query/#rSourceSelector)
 */
export const sourceSelector: RuleDef<'sourceSelector', IriTerm> = {
  name: 'sourceSelector',
  impl: ({ SUBRULE }) => () => SUBRULE(iri),
};
