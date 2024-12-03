import { Builder } from '../../grammar/parserBuilder.js';
import { queryUnit } from '../../grammar/sparql11/queryUnit/queryUnit.js';
import { updateUnit } from '../../grammar/sparql11/updateUnit/updateUnit.js';
import type { Query, Update } from '../../grammar/sparqlJSTypes';
import { queryUnitParserBuilder } from './queryUnitParser.js';
import { updateParserBuilder } from './updateUnitParser.js';

export const sparqlParserBuilder = Builder.createBuilder(false)
  .merge(queryUnitParserBuilder)
  .merge(updateParserBuilder)
  .addRule({
    name: <const> 'parse',
    impl: ({ SUBRULE, OR, BACKTRACK }) => () => OR<Query | Update>([
      { GATE: BACKTRACK(queryUnit), ALT: () => SUBRULE(queryUnit),
      },
      {
        GATE: BACKTRACK(updateUnit),
        ALT: () => SUBRULE(updateUnit),
      },
    ]),
  });
