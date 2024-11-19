import * as l from '../../lexer/index';
import type { RuleDef } from '../buildExample';
import { builtInCall } from './builtIn';
import { brackettedExpression, expression } from './expression';
import { var_ } from './general';
import { constraint, functionCall } from './whereClause';

/**
 * [[18]](https://www.w3.org/TR/sparql11-query/#rSolutionModifier)
 */
export const solutionModifier: RuleDef<'solutionModifier'> = {
  name: 'solutionModifier',
  impl: ({ SUBRULE, OPTION1, OPTION2, OPTION3, OPTION4 }) => () => {
    OPTION1(() => {
      SUBRULE(groupClause);
    });
    OPTION2(() => {
      SUBRULE(havingClause);
    });
    OPTION3(() => {
      SUBRULE(orderClause);
    });
    OPTION4(() => {
      SUBRULE(limitOffsetClauses);
    });
  },
};

/**
 * [[19]](https://www.w3.org/TR/sparql11-query/#rGroupClause)
 */
export const groupClause: RuleDef<'groupClause'> = {
  name: 'groupClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.groupBy);
    AT_LEAST_ONE(() => {
      SUBRULE(groupCondition);
    });
  },
};

/**
 * [[20]](https://www.w3.org/TR/sparql11-query/#rGroupCondition)
 */
export const groupCondition: RuleDef<'groupCondition'> = {
  name: 'groupCondition',
  impl: ({ SUBRULE, CONSUME, SUBRULE1, SUBRULE2, OPTION, OR }) => () => {
    OR([
      { ALT: () => SUBRULE(builtInCall) },
      { ALT: () => SUBRULE(functionCall) },
      {
        ALT: () => {
          CONSUME(l.symbols.LParen);
          SUBRULE(expression);
          OPTION(() => {
            CONSUME(l.as);
            SUBRULE1(var_);
          });
          CONSUME(l.symbols.RParen);
        },
      },
      { ALT: () => SUBRULE2(var_) },
    ]);
  },
};

/**
 * [[21]](https://www.w3.org/TR/sparql11-query/#rHavingClause)
 */
export const havingClause: RuleDef<'havingClause'> = {
  name: 'havingClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.having);
    AT_LEAST_ONE(() => {
      SUBRULE(havingCondition);
    });
  },
};

/**
 * [[22]](https://www.w3.org/TR/sparql11-query/#rHavingCondition)
 */
export const havingCondition: RuleDef<'havingCondition'> = {
  name: 'havingCondition',
  impl: ({ SUBRULE }) => () => {
    SUBRULE(constraint);
  },
};

/**
 * [[23]](https://www.w3.org/TR/sparql11-query/#rOrderClause)
 */
export const orderClause: RuleDef<'orderClause'> = {
  name: 'orderClause',
  impl: ({ AT_LEAST_ONE, SUBRULE, CONSUME }) => () => {
    CONSUME(l.order);
    AT_LEAST_ONE(() => {
      SUBRULE(orderCondition);
    });
  },
};

/**
 * [[24]](https://www.w3.org/TR/sparql11-query/#rOrderCondition)
 */
export const orderCondition: RuleDef<'orderCondition'> = {
  name: 'orderCondition',
  impl: ({ SUBRULE, CONSUME, OR1, OR2 }) => () => {
    OR1([
      {
        ALT: () => {
          OR2([
            { ALT: () => CONSUME(l.orderAsc) },
            { ALT: () => CONSUME(l.orderDesc) },
          ]);
          SUBRULE(brackettedExpression);
        },
      },
      { ALT: () => SUBRULE(constraint) },
      { ALT: () => SUBRULE(var_) },
    ]);
  },
};

/**
 * [[25]](https://www.w3.org/TR/sparql11-query/#rLimitOffsetClauses)
 */
export const limitOffsetClauses: RuleDef<'limitOffsetClauses'> = {
  name: 'limitOffsetClauses',
  impl: ({ SUBRULE1, SUBRULE2, OPTION1, OPTION2, OR }) => () => {
    OR([
      {
        ALT: () => {
          SUBRULE1(limitClause);
          OPTION1(() => {
            SUBRULE1(offsetClause);
          });
        },
      },
      {
        ALT: () => {
          SUBRULE2(offsetClause);
          OPTION2(() => {
            SUBRULE2(limitClause);
          });
        },
      },
    ]);
  },
};

/**
 * [[26]](https://www.w3.org/TR/sparql11-query/#rLimitClause)
 */
export const limitClause: RuleDef<'limitClause'> = {
  name: 'limitClause',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.limit);
    CONSUME(l.terminals.integer);
  },
};

/**
 * [[27]](https://www.w3.org/TR/sparql11-query/#rWhereClause)
 */
export const offsetClause = {
  name: <const> 'offsetClause',
  impl: ({ CONSUME }) => () => {
    CONSUME(l.offset);
    CONSUME(l.terminals.integer);
  },
} satisfies RuleDef;
