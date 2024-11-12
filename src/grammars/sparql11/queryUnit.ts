import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { datasetClause } from './dataSetClause';
import { expression } from './expression';
import { prologue, var_, varOrIri, varOrTerm } from './general';
import { solutionModifier } from './solutionModifier';
import { triplesTemplate } from './updateUnit';
import { dataBlock, whereClause } from './whereClause';

/**
 * [[1]](https://www.w3.org/TR/sparql11-query/#rQueryUnit)
 */
export const queryUnit: RuleDef & { name: 'queryUnit' } = {
  name: 'queryUnit',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(query);
  },
};

/**
 * [[2]](https://www.w3.org/TR/sparql11-query/#rQuery)
 */
export const query: RuleDef & { name: 'query' } = {
  name: 'query',
  impl: ({ SUBRULE, OR }) => () => {
    SUBRULE(prologue);
    OR([
      { ALT: () => SUBRULE(selectQuery) },
      { ALT: () => SUBRULE(constructQuery) },
      { ALT: () => SUBRULE(describeQuery) },
      { ALT: () => SUBRULE(askQuery) },
    ]);
    SUBRULE(valuesClause);
  },
};

/**
 * [[7]](https://www.w3.org/TR/sparql11-query/#rSelectQuery)
 */
export const selectQuery: RuleDef & { name: 'selectQuery' } = {
  name: 'selectQuery',
  impl: ({ SUBRULE, MANY }) => () => {
    SUBRULE(selectClause);
    MANY(() => SUBRULE(datasetClause));
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
  },
};

/**
 * [[8]](https://www.w3.org/TR/sparql11-query/#rSubSelect)
 */
export const subSelect: RuleDef & { name: 'subSelect' } = {
  name: 'subSelect',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(selectClause);
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
    SUBRULE(valuesClause);
  },
};

/**
 * [[9]](https://www.w3.org/TR/sparql11-query/#rSelectClause)
 */
export const selectClause: RuleDef & { name: 'selectClause' } = {
  name: 'selectClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR1, OR2, OR3 }) => () => {
    CONSUME(l.select);
    OPTION(() => {
      OR1([
        { ALT: () => CONSUME(l.distinct) },
        { ALT: () => CONSUME(l.reduced) },
      ]);
    });
    OR2([
      { ALT: () => CONSUME(l.symbols.star) },
      { ALT: () => {
        AT_LEAST_ONE(() => {
          OR3([
            { ALT: () => SUBRULE1(var_) },
            { ALT: () => {
              CONSUME(l.symbols.LParen);
              SUBRULE(expression);
              CONSUME(l.as);
              SUBRULE2(var_);
              CONSUME(l.symbols.RParen);
            } },
          ]);
        });
      } },
    ]);
  },
};

/**
 * [[10]](https://www.w3.org/TR/sparql11-query/#rConstructQuery)
 */
export const constructQuery: RuleDef & { name: 'constructQuery' } = {
  name: 'constructQuery',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, MANY1, MANY2, OPTION, OR }) => () => {
    CONSUME(l.construct);
    OR([
      { ALT: () => {
        SUBRULE(constructTemplate);
        MANY1(() => {
          SUBRULE1(datasetClause);
        });
        SUBRULE(whereClause);
        SUBRULE1(solutionModifier);
      } },
      { ALT: () => {
        MANY2(() => {
          SUBRULE2(datasetClause);
        });
        CONSUME(l.where);
        CONSUME(l.symbols.LCurly);
        OPTION(() => {
          SUBRULE(triplesTemplate);
        });
        CONSUME(l.symbols.RCurly);
        SUBRULE2(solutionModifier);
      } },
    ]);
  },
};

/**
 * [[11]](https://www.w3.org/TR/sparql11-query/#rDescribeQuery)
 */
export const describeQuery: RuleDef & { name: 'describeQuery' } = {
  name: 'describeQuery',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME, MANY, OPTION, OR }) => () => {
    CONSUME(l.describe);
    OR([
      { ALT: () => AT_LEAST_ONE(() => SUBRULE(varOrIri)) },
      { ALT: () => CONSUME(l.symbols.star) },
    ]);
    MANY(() => {
      SUBRULE(datasetClause);
    });
    OPTION(() => {
      SUBRULE(whereClause);
    });
    SUBRULE(solutionModifier);
  },
};

/**
 * [[12]](https://www.w3.org/TR/sparql11-query/#rAskQuery)
 */
export const askQuery: RuleDef & { name: 'askQuery' } = {
  name: 'askQuery',
  impl: ({ SUBRULE, CONSUME, MANY }) => () => {
    CONSUME(l.ask);
    MANY(() => {
      SUBRULE(datasetClause);
    });
    SUBRULE(whereClause);
    SUBRULE(solutionModifier);
  },
};

/**
 * [[28]](https://www.w3.org/TR/sparql11-query/#rValuesClause)
 */
export const valuesClause: RuleDef & { name: 'valuesClause' } = {
  name: 'valuesClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    OPTION(() => {
      CONSUME(l.values);
      SUBRULE(dataBlock);
    });
  },
};

/**
 * [[73]](https://www.w3.org/TR/sparql11-query/#ConstructTemplate)
 */
export const constructTemplate: RuleDef & { name: 'constructTemplate' } = {
  name: 'constructTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.symbols.LCurly);
    OPTION(() => {
      SUBRULE(constructTriples);
    });
    CONSUME(l.symbols.RCurly);
  },
};

/**
 * [[12]](https://www.w3.org/TR/sparql11-query/#rConstructTriples)
 */
export const constructTriples: RuleDef & { name: 'constructTriples' } = {
  name: 'constructTriples',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    SUBRULE(triplesSameSubject);
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        SUBRULE(constructTriples);
      });
    });
  },
};

/**
 * [[75]](https://www.w3.org/TR/sparql11-query/#rTriplesSameSubject)
 */
export const triplesSameSubject: RuleDef & { name: 'triplesSameSubject' } = {
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
export const propertyList: RuleDef & { name: 'propertyList' } = {
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
export const propertyListNotEmpty: RuleDef & { name: 'propertyListNotEmpty' } = {
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
export const verb: RuleDef & { name: 'verb' } = {
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
export const objectList: RuleDef & { name: 'objectList' } = {
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
export const object: RuleDef & { name: 'object' } = {
  name: 'object',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(graphNode);
  },
};

/**
 * [[98]](https://www.w3.org/TR/sparql11-query/#rTriplesNode)
 */
export const triplesNode: RuleDef & { name: 'triplesNode' } = {
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
export const blankNodePropertyList: RuleDef & { name: 'blankNodePropertyList' } = {
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
export const collection: RuleDef & { name: 'collection' } = {
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
export const graphNode: RuleDef & { name: 'graphNode' } = {
  name: 'graphNode',
  impl: ({ SUBRULE, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(varOrTerm) },
      { ALT: () => SUBRULE(triplesNode) },
    ]);
  },
};
