import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import type { Query, ValuesPattern } from '../sparqlJSTypes';
import { datasetClause } from './dataSetClause';
import { expression } from './expression';
import { prologue, triplesSameSubject, triplesTemplate, var_, varOrIri } from './general';
import { solutionModifier } from './solutionModifier';
import { dataBlock, whereClause } from './whereClause';

/**
 * [[1]](https://www.w3.org/TR/sparql11-query/#rQueryUnit)
 */
export const queryUnit: RuleDef<'queryUnit', Query> = {
  name: 'queryUnit',
  impl: ({ SUBRULE }) => () => SUBRULE(query),
};

/**
 * [[2]](https://www.w3.org/TR/sparql11-query/#rQuery)
 */
export const query: RuleDef<'query', Query> = {
  name: 'query',
  impl: ({ SUBRULE, OR }) => () => {
    const prologueValues = SUBRULE(prologue);
    OR([
      { ALT: () => SUBRULE(selectQuery) },
      { ALT: () => SUBRULE(constructQuery) },
      { ALT: () => SUBRULE(describeQuery) },
      { ALT: () => SUBRULE(askQuery) },
    ]);
    const values = SUBRULE(valuesClause);

    return {
      ...prologueValues,
      type: 'query',
      values,
    };
  },
};

/**
 * [[7]](https://www.w3.org/TR/sparql11-query/#rSelectQuery)
 */
export const selectQuery: RuleDef<'selectQuery'> = {
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
export const subSelect: RuleDef<'subSelect'> = {
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
export const selectClause: RuleDef<'selectClause'> = {
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
export const constructQuery: RuleDef<'constructQuery'> = {
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
export const describeQuery: RuleDef<'describeQuery'> = {
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
export const askQuery: RuleDef<'askQuery'> = {
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
export const valuesClause: RuleDef<'valuesClause', ValuesPattern | undefined> = {
  name: 'valuesClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => OPTION(() => {
    CONSUME(l.values);
    const values = SUBRULE(dataBlock);
    return {
      type: 'values',
      values,
    };
  }),
};

/**
 * [[73]](https://www.w3.org/TR/sparql11-query/#ConstructTemplate)
 */
export const constructTemplate: RuleDef<'constructTemplate'> = {
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
export const constructTriples: RuleDef<'constructTriples'> = {
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
