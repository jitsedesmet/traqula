import * as l from '../../../lexer/sparql11/index.js';
import { Wildcard } from '../../../misc/Wildcard.js';
import type { RuleDef, ImplArgs } from '../../builder/ruleDefTypes.js';
import type {
  AggregateExpression,
  AskQuery,
  ConstructQuery,
  DescribeQuery,
  Expression,
  Grouping,
  IriTerm,
  Pattern,
  Query,
  SelectQuery,
  Triple,
  ValuePatternRow,
  Variable,
  VariableExpression,
  VariableTerm,
} from '../../sparqlJsTypes';

import { canParseAggregate } from '../builtIn';
import { datasetClause, type IDatasetClause } from '../dataSetClause.js';
import { expression } from '../expression.js';
import { prologue, triplesTemplate, var_, varOrIri } from '../general.js';
import { solutionModifier } from '../solutionModifier.js';
import { triplesSameSubject } from '../tripleBlock.js';
import { dataBlock, whereClause } from '../whereClause.js';

/**
 * [[1]](https://www.w3.org/TR/sparql11-query/#rQueryUnit)
 */
export const queryUnit: RuleDef<'queryUnit', Query> = <const> {
  name: 'queryUnit',
  impl: ({ SUBRULE }) => () => SUBRULE(query),
};

/**
 * [[2]](https://www.w3.org/TR/sparql11-query/#rQuery)
 */
export const query: RuleDef<'query', Query> = <const> {
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

export type HandledByBase = 'values' | 'type' | 'base' | 'prefixes';

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
 * Get all 'aggregate' rules from an expression
 */
function getAggregatesOfExpression(expression: Expression | Pattern): AggregateExpression[] {
  if ('type' in expression) {
    if (expression.type === 'aggregate') {
      return [ expression ];
    }
    if (expression.type === 'operation') {
      const aggregates: AggregateExpression[] = [];
      for (const arg of expression.args) {
        aggregates.push(...getAggregatesOfExpression(arg));
      }
      return aggregates;
    }
  }
  return [];
}

/**
 * Return the id of an expression
 */
function getExpressionId(expression: Grouping | VariableTerm | VariableExpression): string | undefined {
  // Check if grouping
  if ('variable' in expression && expression.variable) {
    return expression.variable.value;
  }
  if ('value' in expression) {
    return expression.value;
  }
  return 'value' in expression.expression ? expression.expression.value : undefined;
}
/**
 * Get all variables used in an expression
 */
function getVariablesFromExpression(expression: Expression): Set<VariableTerm> {
  const variables = new Set<VariableTerm>();
  const visitExpression = (expr: Expression | Pattern | undefined): void => {
    if (!expr) {
      return;
    }
    if ('termType' in expr && expr.termType === 'Variable') {
      variables.add(expr);
    } else if ('type' in expr && expr.type === 'operation') {
      for (const rec of expr.args) {
        visitExpression(rec);
      }
    }
  };
  visitExpression(expression);
  return variables;
}

/**
 * [[7]](https://www.w3.org/TR/sparql11-query/#rSelectQuery)
 */
export const selectQuery: RuleDef<'selectQuery', Omit<SelectQuery, HandledByBase>> = <const> {
  name: 'selectQuery',
  impl: ({ ACTION, SUBRULE, MANY, context }) => () => {
    const selectVal = SUBRULE(selectClause);
    const from = extractFromOfDataSetClauses(ACTION, MANY, SUBRULE);
    const where = SUBRULE(whereClause);
    const modifier = SUBRULE(solutionModifier);

    ACTION(() => {
      if (selectVal.variables.length === 1 && selectVal.variables[0] instanceof Wildcard) {
        return;
      }
      const variables = <Variable[]> selectVal.variables;
      // Check for projection of ungrouped variable
      // Check can be skipped in case of wildcard select.
      if (!context.skipValidation) {
        const hasCountAggregate = variables.flatMap(
          varVal => 'termType' in varVal ? [] : getAggregatesOfExpression(varVal.expression),
        ).some(agg => agg.aggregation === 'count' && !(agg.expression instanceof Wildcard));
        if (hasCountAggregate || modifier.group) {
          // We have to check whether
          //  1. Variables used in projection are usable given the group by clause
          //  2. A selectCount will create an implicit group by clause.
          for (const selectVar of variables) {
            if ('termType' in selectVar) {
              if (!modifier.group || !modifier.group.map(groupvar => getExpressionId(groupvar))
                .includes((getExpressionId(selectVar)))) {
                throw new Error('Variable not allowed in projection');
              }
            } else if (getAggregatesOfExpression(selectVar.expression).length === 0) {
              const usedvars = getVariablesFromExpression(selectVar.expression);
              for (const usedvar of usedvars) {
                if (!modifier.group || !modifier.group.map || !modifier.group.map(groupVar => getExpressionId(groupVar))
                  .includes(getExpressionId(usedvar))) {
                  throw new Error(`Use of ungrouped variable in projection of operation (?${getExpressionId(usedvar)})`);
                }
              }
            }
          }
        }
      }
      // Check if id of each AS-selected column is not yet bound by subquery
      const subqueries = where.filter(pattern => pattern.type === 'query');
      if (subqueries.length > 0) {
        const selectedVarIds: string[] = [];
        for (const selectedVar of variables) {
          if ('variable' in selectedVar) {
            selectedVarIds.push(selectedVar.variable.value);
          }
        }
        const vars = subqueries.flatMap(sub => <(Variable | Wildcard)[]>sub.variables)
          .map(v => 'value' in v ? v.value : v.variable.value);
        const subqueryIds = new Set(vars);
        for (const selectedVarId of selectedVarIds) {
          if (subqueryIds.has(selectedVarId)) {
            throw new Error(`Target id of 'AS' (?${selectedVarId}) already used in subquery`);
          }
        }
      }
    });

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
export const subSelect: RuleDef<'subSelect', Omit<SelectQuery, 'prefixes'>> = <const> {
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
      ...(values && { values }),
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
export const selectClause: RuleDef<'selectClause', ISelectClause> = <const> {
  name: 'selectClause',
  impl: ({ ACTION, AT_LEAST_ONE, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR1, OR2, OR3, context }) => () => {
    CONSUME(l.select);
    const couldParseAgg = ACTION(() =>
      context.queryMode.has(canParseAggregate) || !context.queryMode.add(canParseAggregate));

    const distinctOrReduced = OPTION(() => OR1<Partial<{ distinct: true; reduced: true }>>([
      { ALT: () => {
        CONSUME(l.distinct);
        return { distinct: true };
      } },
      { ALT: () => {
        CONSUME(l.reduced);
        return { reduced: true };
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
    ACTION(() => !couldParseAgg && context.queryMode.delete(canParseAggregate));
    return ACTION(() => ({
      ...distinctOrReduced,
      variables,
    }));
  },
};

/**
 * [[10]](https://www.w3.org/TR/sparql11-query/#rConstructQuery)
 */
export const constructQuery: RuleDef<'constructQuery', Omit<ConstructQuery, HandledByBase>> = <const> {
  name: 'constructQuery',
  impl: ({ ACTION, SUBRULE, CONSUME, SUBRULE1, SUBRULE2, MANY1, MANY2, OPTION, OR }) => () => {
    CONSUME(l.construct);
    return OR<Omit<ConstructQuery, HandledByBase>>([
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
          const where: Pattern[] = template ?
              [{
                type: 'bgp',
                triples: template,
              }] :
              [];

          return ACTION(() => ({
            ...modifiers,
            queryType: 'CONSTRUCT',
            from,
            template,
            where,
          }));
        },
      },
    ]);
  },
};

/**
 * [[11]](https://www.w3.org/TR/sparql11-query/#rDescribeQuery)
 */
export const describeQuery: RuleDef<'describeQuery', Omit<DescribeQuery, HandledByBase>> = <const> {
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
export const askQuery: RuleDef<'askQuery', Omit<AskQuery, HandledByBase>> = <const> {
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
export const valuesClause: RuleDef<'valuesClause', ValuePatternRow[] | undefined> = <const> {
  name: 'valuesClause',
  impl: ({ SUBRULE, CONSUME, OPTION }) => () => OPTION(() => {
    CONSUME(l.values);
    return SUBRULE(dataBlock);
  }),
};

/**
 * [[73]](https://www.w3.org/TR/sparql11-query/#ConstructTemplate)
 */
export const constructTemplate: RuleDef<'constructTemplate', Triple[] | undefined> = <const> {
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
export const constructTriples: RuleDef<'constructTriples', Triple[]> = <const> {
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
