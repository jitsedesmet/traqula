import * as l from '../../../lexer/sparql11/index.js';
import { Wildcard } from '../../../misc/Wildcard.js';
import type { ImplArgs, RuleDef } from '../../parserBuilder.js';
import type {
  AskQuery,
  ConstructQuery,
  DescribeQuery,
  IriTerm,
  Query,
  SelectQuery,
  Triple,
  ValuesPattern,
  Variable,
  VariableExpression,
  VariableTerm,
} from '../../sparqlJSTypes.js';
import { datasetClause, type IDatasetClause } from '../dataSetClause.js';
import { expression } from '../expression.js';
import { prologue, triplesTemplate, var_, varOrIri } from '../general.js';
import { solutionModifier } from '../solutionModifier.js';
import { triplesSameSubject } from '../tripleBlock.js';
import { dataBlock, whereClause } from '../whereClause.js';

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
  impl: ({ ACTION, SUBRULE, OR }) => () => {
    const prologueValues = SUBRULE(prologue);
    const queryType = OR<Omit<Query, HandledByBase>>([
      { ALT: () => SUBRULE(selectQuery) },
      { ALT: () => SUBRULE(constructQuery) },
      { ALT: () => SUBRULE(describeQuery) },
      { ALT: () => SUBRULE(askQuery) },
    ]);
    const values = SUBRULE(valuesClause);

    return ACTION(() => (<Query>{
      ...prologueValues,
      ...queryType,
      type: 'query',
      ...(values && { values }),
    }));
  },
};

type HandledByBase = 'values' | 'type' | 'base' | 'prefixes';

function extractFromOfDataSetClauses(ACTION: ImplArgs['ACTION'], MANY: ImplArgs['MANY'], SUBRULE: ImplArgs['SUBRULE']):
{ default: IriTerm[]; named: IriTerm[] } | undefined {
  const datasetClauses: IDatasetClause[] = [];
  MANY(() => {
    datasetClauses.push(SUBRULE(datasetClause));
  });
  return ACTION(() => {
    const from: { default: IriTerm[]; named: IriTerm[] } = {
      default: [],
      named: [],
    };
    for (const datasetClause of datasetClauses) {
      if (datasetClause.type === 'default') {
        from.default.push(datasetClause.value);
      } else {
        from.named.push(datasetClause.value);
      }
    }
    return (from.default.length === 0 && from.named.length === 0) ? undefined : from;
  });
}

/**
 * [[7]](https://www.w3.org/TR/sparql11-query/#rSelectQuery)
 */
export const selectQuery: RuleDef<'selectQuery', Omit<SelectQuery, HandledByBase>> = {
  name: 'selectQuery',
  impl: ({ ACTION, SUBRULE, MANY }) => () => {
    const selectVal = SUBRULE(selectClause);
    const from = extractFromOfDataSetClauses(ACTION, MANY, SUBRULE);
    const where = SUBRULE(whereClause);
    const modifier = SUBRULE(solutionModifier);

    return {
      ...selectVal,
      queryType: 'SELECT',
      ...(from && { from }),
      where,
      ...modifier,
    };
  },
};

/**
 * [[8]](https://www.w3.org/TR/sparql11-query/#rSubSelect)
 */
export const subSelect: RuleDef<'subSelect', SelectQuery> = {
  name: 'subSelect',
  impl: ({ ACTION, SUBRULE }) => () => {
    const clause = SUBRULE(selectClause);
    const where = SUBRULE(whereClause);
    const modifiers = SUBRULE(solutionModifier);
    const values = SUBRULE(valuesClause);

    return ACTION(() => ({
      ...modifiers,
      ...clause,
      type: 'query',
      queryType: 'SELECT',
      where,
      values: values?.values,
      prefixes: {},
    }));
  },
};

/**
 * [[9]](https://www.w3.org/TR/sparql11-query/#rSelectClause)
 */
export interface ISelectClause {
  variables: Variable[] | [Wildcard];
  distinct?: true;
  reduced?: true;
}
export const selectClause: RuleDef<'selectClause', ISelectClause> = {
  name: 'selectClause',
  impl: ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR1, OR2, OR3 }) => () => {
    CONSUME(l.select);
    const tDistinctFReduced = OPTION(() => OR1([
      { ALT: () => {
        CONSUME(l.distinct);
        return true;
      } },
      { ALT: () => {
        CONSUME(l.reduced);
        return false;
      } },
    ]));
    const variables = OR2<ISelectClause['variables']>([
      { ALT: () => {
        CONSUME(l.symbols.star);
        return [ new Wildcard() ];
      } },
      { ALT: () => {
        const result: Variable[] = [];
        AT_LEAST_ONE(() => OR3([
          { ALT: () => result.push(SUBRULE1(var_)) },
          { ALT: () => {
            CONSUME(l.symbols.LParen);
            const expr = SUBRULE(expression);
            CONSUME(l.as);
            const variable = SUBRULE2(var_);
            CONSUME(l.symbols.RParen);
            result.push({
              expression: expr,
              variable,
            } satisfies VariableExpression);
          } },
        ]));
        return result;
      } },
    ]);

    return ACTION(() => {
      const res: ISelectClause = {
        variables,
      };
      if (tDistinctFReduced !== undefined) {
        res[tDistinctFReduced ? 'distinct' : 'reduced'] = true;
      }
      return res;
    });
  },
};

/**
 * [[10]](https://www.w3.org/TR/sparql11-query/#rConstructQuery)
 */
export const constructQuery: RuleDef<'constructQuery', Omit<ConstructQuery, HandledByBase>> = {
  name: 'constructQuery',
  impl: ({ ACTION, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, MANY1, MANY2, OPTION, OR }) => () => {
    CONSUME(l.construct);
    return OR([
      {
        ALT: () => {
          const template = SUBRULE(constructTemplate);
          const from = extractFromOfDataSetClauses(ACTION, MANY1, SUBRULE1);
          const where = SUBRULE(whereClause);
          const modifiers = SUBRULE1(solutionModifier);
          return ACTION(() => ({
            ...modifiers,
            queryType: 'CONSTRUCT',
            template,
            from,
            where,
          }));
        },
      },
      {
        ALT: () => {
          const from = extractFromOfDataSetClauses(ACTION, MANY2, SUBRULE2);
          CONSUME(l.where);
          CONSUME(l.symbols.LCurly);
          const template = OPTION(() => SUBRULE(triplesTemplate));
          CONSUME(l.symbols.RCurly);
          const modifiers = SUBRULE2(solutionModifier);

          return ACTION(() => ({
            ...modifiers,
            queryType: 'CONSTRUCT',
            from,
            template,
          }));
        },
      },
    ]);
  },
};

/**
 * [[11]](https://www.w3.org/TR/sparql11-query/#rDescribeQuery)
 */
export const describeQuery: RuleDef<'describeQuery', Omit<DescribeQuery, HandledByBase>> = {
  name: 'describeQuery',
  impl: ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME, MANY, OPTION, OR }) => () => {
    CONSUME(l.describe);
    const variables = OR<DescribeQuery['variables']>([
      { ALT: () => {
        const variables: (VariableTerm | IriTerm)[] = [];
        AT_LEAST_ONE(() => {
          variables.push(SUBRULE(varOrIri));
        });
        return variables;
      } },
      { ALT: () => {
        CONSUME(l.symbols.star);
        return [ new Wildcard() ];
      } },
    ]);
    const from = extractFromOfDataSetClauses(ACTION, MANY, SUBRULE);
    const where = OPTION(() => SUBRULE(whereClause));
    const modifiers = SUBRULE(solutionModifier);
    return ACTION(() => ({
      ...modifiers,
      queryType: 'DESCRIBE',
      variables,
      from,
      where,
    }));
  },
};

/**
 * [[12]](https://www.w3.org/TR/sparql11-query/#rAskQuery)
 */
export const askQuery: RuleDef<'askQuery', Omit<AskQuery, HandledByBase>> = {
  name: 'askQuery',
  impl: ({ ACTION, SUBRULE, CONSUME, MANY }) => () => {
    CONSUME(l.ask);
    const from = extractFromOfDataSetClauses(ACTION, MANY, SUBRULE);
    const where = SUBRULE(whereClause);
    const modifiers = SUBRULE(solutionModifier);
    return ACTION(() => ({
      ...modifiers,
      queryType: 'ASK',
      from,
      where,
    }));
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
export const constructTemplate: RuleDef<'constructTemplate', Triple[] | undefined> = {
  name: 'constructTemplate',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => {
    CONSUME(l.symbols.LCurly);
    const triples = OPTION(() => SUBRULE(constructTriples));
    CONSUME(l.symbols.RCurly);
    return triples;
  },
};

/**
 * [[12]](https://www.w3.org/TR/sparql11-query/#rConstructTriples)
 */
export const constructTriples: RuleDef<'constructTriples', Triple[]> = {
  name: 'constructTriples',
  impl: ({ SUBRULE, CONSUME, OPTION1, OPTION2 }) => () => {
    const triples: Triple[][] = [];
    triples.push(SUBRULE(triplesSameSubject));
    OPTION1(() => {
      CONSUME(l.symbols.dot);
      OPTION2(() => {
        triples.push(SUBRULE(constructTriples));
      });
    });
    return triples.flat(1);
  },
};
