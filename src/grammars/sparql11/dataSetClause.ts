import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';

import { iri } from './literals';

/**
 * [[13]](https://www.w3.org/TR/sparql11-query/#rDatasetClause)
 */
export const datasetClause: RuleDef<'datasetClause'> = {
  name: 'datasetClause',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    CONSUME(l.from);
    OR([
      { ALT: () => SUBRULE(defaultGraphClause) },
      { ALT: () => SUBRULE(namedGraphClause) },
    ]);
  },
};

/**
 * [[14]](https://www.w3.org/TR/sparql11-query/#rDefaultGraphClause)
 */
export const defaultGraphClause: RuleDef<'defaultGraphClause'> = {
  name: 'defaultGraphClause',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(sourceSelector);
  },
};

/**
 * [[15]](https://www.w3.org/TR/sparql11-query/#rNamedGraphClause)
 */
export const namedGraphClause: RuleDef<'namedGraphClause'> = {
  name: 'namedGraphClause',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.graph.named);
    SUBRULE(sourceSelector);
  },
};

/**
 * [[16]](https://www.w3.org/TR/sparql11-query/#rSourceSelector)
 */
export const sourceSelector: RuleDef<'sourceSelector'> = {
  name: 'sourceSelector',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(iri);
  },
};
