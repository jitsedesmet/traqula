import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { objectList, var_, varOrTerm } from './general';
import { path } from './propertyPaths';

/**
 * [[55]](https://www.w3.org/TR/sparql11-query/#rTriplesBlock)
 */
export const triplesBlock: RuleDef & { name: 'triplesBlock' } = {
  name: 'triplesBlock',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubjectPath);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(triplesBlock);
      });
    });
  },
};

/**
 * [[81]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubjectPath)
 */
export const triplesSameSubjectPath: RuleDef & { name: 'triplesSameSubjectPath' } = {
  name: 'triplesSameSubjectPath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => {
        SUBRULE(varOrTerm);
        SUBRULE(propertyListPathNotEmpty);
      } },
      { ALT: () => {
        SUBRULE(triplesNodePath);
        SUBRULE(propertyListPath);
      } },
    ]);
  },
};

/**
 * [[82]](https://www.w3.org/TR/sparql11-query/#rPropertyListPath)
 */
export const propertyListPath: RuleDef & { name: 'propertyListPath' } = {
  name: 'propertyListPath',
  impl: ({ SUBRULE, OPTION }) => () => {
    OPTION(() => {
      SUBRULE(propertyListPathNotEmpty);
    });
  },
};

/**
 * [[83]](https://www.w3.org/TR/sparql11-query/#rPropertyListPathNotEmpty)
 */
export const propertyListPathNotEmpty: RuleDef & { name: 'propertyListPathNotEmpty' } = {
  name: 'propertyListPathNotEmpty',
  impl: ({ SUBRULE, CONSUME, MANY, SUBRULE1, SUBRULE2, OPTION, OR1, OR2 }) => () => {
    OR1([
      { ALT: () => SUBRULE1(verbPath) },
      { ALT: () => SUBRULE1(verbSimple) },
    ]);
    SUBRULE(objectListPath);
    MANY(() => {
      CONSUME(l.symbols.semi);
      OPTION(() => {
        OR2([
          { ALT: () => SUBRULE2(verbPath) },
          { ALT: () => SUBRULE2(verbSimple) },
        ]);
        SUBRULE(objectList);
      });
    });
  },
};

/**
 * [[84]](https://www.w3.org/TR/sparql11-query/#rVerbPath)
 */
export const verbPath: RuleDef & { name: 'verbPath' } = {
  name: 'verbPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(path);
  },
};

/**
 * [[85]](https://www.w3.org/TR/sparql11-query/#rVerbSimple)
 */
export const verbSimple: RuleDef & { name: 'verbSimple' } = {
  name: 'verbSimple',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(var_);
  },
};

/**
 * [[86]](https://www.w3.org/TR/sparql11-query/#rObjectListPath)
 */
export const objectListPath: RuleDef & { name: 'objectListPath' } = {
  name: 'objectListPath',
  impl: ({ CONSUME, MANY, SUBRULE1, SUBRULE2 }) => () => {
    SUBRULE1(objectPath);
    MANY(() => {
      CONSUME(l.symbols.comma);
      SUBRULE2(objectPath);
    });
  },
};

/**
 * [[87]](https://www.w3.org/TR/sparql11-query/#rObjectPath)
 */
export const objectPath: RuleDef & { name: 'objectPath' } = {
  name: 'objectPath',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNodePath);
  },
};

/**
 * [[100]](https://www.w3.org/TR/sparql11-query/#rTriplesNodePath)
 */
export const triplesNodePath: RuleDef & { name: 'triplesNodePath' } = {
  name: 'triplesNodePath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(collectionPath) },
      { ALT: () => SUBRULE(blankNodePropertyListPath) },
    ]);
  },
};

/**
 * [[101]](https://www.w3.org/TR/sparql11-query/#rBlankNodePropertyListPath)
 */
export const blankNodePropertyListPath: RuleDef & { name: 'blankNodePropertyListPath' } = {
  name: 'blankNodePropertyListPath',
  impl: ({ SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LSquare);
    SUBRULE(propertyListPathNotEmpty);
    CONSUME(l.symbols.RSquare);
  },
};

/**
 * [[103]](https://www.w3.org/TR/sparql11-query/#rCollectionPath)
 */
export const collectionPath: RuleDef & { name: 'collectionPath' } = {
  name: 'collectionPath',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.symbols.LParen);
    AT_LEAST_ONE(() => {
      SUBRULE(graphNodePath);
    });
    CONSUME(l.symbols.RParen);
  },
};

/**
 * [[105]](https://www.w3.org/TR/sparql11-query/#rGraphNodePath)
 */
export const graphNodePath: RuleDef & { name: 'graphNodePath' } = {
  name: 'graphNodePath',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNodePath) },
    ]);
  },
};
