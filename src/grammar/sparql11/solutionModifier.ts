import * as l from '../../lexer/sparql11/index';
import type { RuleDef } from '../parserBuilder';
import type { Expression, Grouping, Ordering, SelectQuery } from '../sparqlJSTypes';
import { builtInCall } from './builtIn';
import { brackettedExpression, expression } from './expression';
import { var_ } from './general';
import { constraint, functionCall } from './whereClause';

/**
 * [[18]](https://www.w3.org/TR/sparql11-query/#rSolutionModifier)
 */
export type ISolutionModifier = Pick<SelectQuery, 'group' | 'having' | 'order' | 'limit' | 'offset'>;
export const solutionModifier: RuleDef<'solutionModifier', ISolutionModifier> = {
  name: 'solutionModifier',
  impl: ({ ACTION, SUBRULE, OPTION1, OPTION2, OPTION3, OPTION4 }) => () => {
    const group = OPTION1(() => SUBRULE(groupClause));
    const having = OPTION2(() => SUBRULE(havingClause));
    const order = OPTION3(() => SUBRULE(orderClause));
    const limitAndOffset = OPTION4(() => SUBRULE(limitOffsetClauses));

    return ACTION(() => ({
      ...limitAndOffset,
      group,
      having,
      order,
    }));
  },
};

/**
 * [[19]](https://www.w3.org/TR/sparql11-query/#rGroupClause)
 */
export const groupClause: RuleDef<'groupClause', Grouping[]> = {
  name: 'groupClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    const groupings: Grouping[] = [];
    CONSUME(l.groupBy);
    AT_LEAST_ONE(() => {
      groupings.push(SUBRULE(groupCondition));
    });

    return groupings;
  },
};

/**
 * [[20]](https://www.w3.org/TR/sparql11-query/#rGroupCondition)
 */
export const groupCondition: RuleDef<'groupCondition', Grouping> = {
  name: 'groupCondition',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR }) => () => OR<Grouping>([
    { ALT: () => {
      const expression = SUBRULE(builtInCall);
      return {
        expression,
      };
    } },
    { ALT: () => {
      const expression = SUBRULE(functionCall);
      return {
        expression,
      };
    } },
    {
      ALT: () => {
        CONSUME(l.symbols.LParen);
        const expressionValue = SUBRULE(expression);
        const variable = OPTION(() => {
          CONSUME(l.as);
          return SUBRULE1(var_);
        });
        CONSUME(l.symbols.RParen);

        return {
          expression: expressionValue,
          variable,
        };
      },
    },
    { ALT: () => {
      const expression = SUBRULE2(var_);
      return {
        expression,
      };
    } },
  ]),
};

/**
 * [[21]](https://www.w3.org/TR/sparql11-query/#rHavingClause)
 */
export const havingClause: RuleDef<'havingClause', Expression[]> = {
  name: 'havingClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    const expressions: Expression[] = [];

    CONSUME(l.having);
    AT_LEAST_ONE(() => {
      expressions.push(SUBRULE(havingCondition));
    });

    return expressions;
  },
};

/**
 * [[22]](https://www.w3.org/TR/sparql11-query/#rHavingCondition)
 */
export const havingCondition: RuleDef<'havingCondition', Expression> = {
  name: 'havingCondition',
  impl: ({ SUBRULE }) => () => SUBRULE(constraint),
};

/**
 * [[23]](https://www.w3.org/TR/sparql11-query/#rOrderClause)
 */
export const orderClause: RuleDef<'orderClause', Ordering[]> = {
  name: 'orderClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    const orderings: Ordering[] = [];

    CONSUME(l.order);
    AT_LEAST_ONE(() => {
      orderings.push(SUBRULE(orderCondition));
    });

    return orderings;
  },
};

/**
 * [[24]](https://www.w3.org/TR/sparql11-query/#rOrderCondition)
 */
export const orderCondition: RuleDef<'orderCondition', Ordering> = {
  name: 'orderCondition',
  impl: ({ SUBRULE, CONSUME, OR1, OR2 }) => () => OR1([
    {
      ALT: () => {
        const descending = OR2([
          { ALT: () => {
            CONSUME(l.orderAsc);
            return false;
          } },
          { ALT: () => {
            CONSUME(l.orderDesc);
            return true;
          } },
        ]);
        const expr = SUBRULE(brackettedExpression);

        return {
          expression: expr,
          descending,
        };
      },
    },
    { ALT: () => {
      const expr = SUBRULE(constraint);
      return {
        expression: expr,
      };
    } },
    { ALT: () => {
      const expr = SUBRULE(var_);
      return {
        expression: expr,
      };
    } },
  ]),
};

/**
 * [[25]](https://www.w3.org/TR/sparql11-query/#rLimitOffsetClauses)
 */
export const limitOffsetClauses: RuleDef<'limitOffsetClauses', Pick<SelectQuery, 'limit' | 'offset'>> = {
  name: 'limitOffsetClauses',
  impl: ({ SUBRULE1, SUBRULE2, OPTION1, OPTION2, OR }) => () => OR<Pick<SelectQuery, 'limit' | 'offset'>>([
    {
      ALT: () => {
        const limit = SUBRULE1(limitClause);
        const offset = OPTION1(() => SUBRULE1(offsetClause));
        return {
          limit,
          offset,
        };
      },
    },
    {
      ALT: () => {
        const offset = SUBRULE2(offsetClause);
        const limit = OPTION2(() => SUBRULE2(limitClause));
        return {
          limit,
          offset,
        };
      },
    },
  ]),
};

/**
 * [[26]](https://www.w3.org/TR/sparql11-query/#rLimitClause)
 */
export const limitClause: RuleDef<'limitClause', number> = {
  name: 'limitClause',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.limit);
    return Number.parseInt(CONSUME(l.terminals.integer).image, 10);
  },
};

/**
 * [[27]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const offsetClause: RuleDef<'offsetClause', number> = {
  name: <const> 'offsetClause',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.offset);
    return Number.parseInt(CONSUME(l.terminals.integer).image, 10);
  },
};
