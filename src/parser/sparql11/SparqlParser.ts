import { Builder } from '../../grammar/parserBuilder.js';
import { queryUnitParserBuilder } from './queryUnitParser.js';
import { updateParserBuilder } from './updateUnitParser.js';

export const sparqlParserBuilder = Builder.createBuilder(false)
  .merge(queryUnitParserBuilder)
  .merge(updateParserBuilder);
  // .addRule({
  //   name: <const> 'parse',
  //   impl: ({ SUBRULE, OR }) => () => OR<Query | Update>([
  //     { ALT: () => SUBRULE(queryUnit) },
  //     { ALT: () => SUBRULE(updateUnit) },
  //   ]),
  // });
