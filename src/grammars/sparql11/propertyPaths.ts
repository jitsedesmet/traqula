import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';

import { iri } from './literals';

/**
 * [[88]](https://www.w3.org/TR/sparql11-query/#rPath)
 */
export const path: RuleDef<'path'> = {
  name: 'path',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(pathAlternative);
  },
};

/**
 * [[89]](https://www.w3.org/TR/sparql11-query/#rPathAlternative)
 */
export const pathAlternative: RuleDef<'pathAlternative'> = {
  name: 'pathAlternative',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(pathSequence);
    MANY(() => {
      CONSUME(l.symbols.pipe);
      SUBRULE2(pathSequence);
    });
  },
};

/**
 * [[90]](https://www.w3.org/TR/sparql11-query/#rPathSequence)
 */
export const pathSequence: RuleDef<'pathSequence'> = {
  name: 'pathSequence',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(pathEltOrInverse);
    MANY(() => {
      CONSUME(l.symbols.slash);
      SUBRULE2(pathEltOrInverse);
    });
  },
};

/**
 * [[91]](https://www.w3.org/TR/sparql11-query/#rPathElt)
 */
export const pathElt: RuleDef<'pathElt'> = {
  name: 'pathElt',
  impl: ({ SUBRULE, OPTION }) => () => {
    SUBRULE(pathPrimary);
    OPTION(() => {
      SUBRULE(pathMod);
    });
  },
};

/**
 * [[92]](https://www.w3.org/TR/sparql11-query/#rPathEltOrInverse)
 */
export const pathEltOrInverse: RuleDef<'pathEltOrInverse'> = {
  name: 'pathEltOrInverse',
  impl: ({ CONSUME, SUBRULE1, SUBRULE2, OR }) => () => {
    OR([
      {
        ALT: () => {
          SUBRULE1(pathElt);
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.hat);
          SUBRULE2(pathElt);
        },
      },
    ]);
  },
};

/**
 * [[93]](https://www.w3.org/TR/sparql11-query/#rPathMod)
 */
export const pathMod: RuleDef<'pathMod'> = {
  name: 'pathMod',
  impl: ({ CONSUME, OR }) => () => {
    OR([
      { ALT: () => CONSUME(l.symbols.question) },
      { ALT: () => CONSUME(l.symbols.star) },
      { ALT: () => CONSUME(l.symbols.plus) },
    ]);
  },
};

/**
 * [[94]](https://www.w3.org/TR/sparql11-query/#rPathPrimary)
 */
export const pathPrimary: RuleDef<'pathPrimary'> = {
  name: 'pathPrimary',
  impl: ({ SUBRULE, CONSUME, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(iri) },
      { ALT: () => CONSUME(l.a) },
      {
        ALT: () => {
          CONSUME(l.symbols.exclamation);
          SUBRULE(pathNegatedPropertySet);
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.LParen);
          SUBRULE(path);
          CONSUME(l.symbols.RParen);
        },
      },
    ]);
  },
};

/**
 * [[95]](https://www.w3.org/TR/sparql11-query/#rPathNegatedPropertySet)
 */
export const pathNegatedPropertySet: RuleDef<'pathNegatedPropertySet'> = {
  name: 'pathNegatedPropertySet',
  impl: ({ SUBRULE3, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR }) => () => {
    OR([
      {
        ALT: () => {
          SUBRULE1(pathOneInPropertySet);
        },
      },
      {
        ALT: () => {
          CONSUME(l.symbols.LParen);
          OPTION(() => {
            SUBRULE2(pathOneInPropertySet);
            MANY(() => {
              CONSUME(l.symbols.pipe);
              SUBRULE3(pathOneInPropertySet);
            });
          });
          CONSUME(l.symbols.RParen);
        },
      },
    ]);
  },
};

/**
 * [[96]](https://www.w3.org/TR/sparql11-query/#rPathOneInPropertySet)
 */
export const pathOneInPropertySet: RuleDef<'pathOneInPropertySet'> = {
  name: 'pathOneInPropertySet',
  impl: ({ CONSUME1, CONSUME2, CONSUME, SUBRULE1, SUBRULE2, OR1, OR2 }) => () => {
    OR1([
      { ALT: () => SUBRULE1(iri) },
      { ALT: () => CONSUME1(l.a) },
      {
        ALT: () => {
          CONSUME(l.symbols.hat);
          OR2([
            { ALT: () => SUBRULE2(iri) },
            { ALT: () => CONSUME2(l.a) },
          ]);
        },
      },
    ]);
  },
};
