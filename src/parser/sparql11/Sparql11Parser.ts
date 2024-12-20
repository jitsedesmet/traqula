import { DataFactory } from 'rdf-data-factory';
import { Builder } from '../../grammar/builder/parserBuilder.js';
import type { ImplArgs, RuleDef } from '../../grammar/builder/ruleDefTypes.js';
import { prologue } from '../../grammar/sparql11/general.js';
import type { HandledByBase } from '../../grammar/sparql11/queryUnit/queryUnit.js';
import {
  askQuery,
  constructQuery,
  describeQuery,
  selectQuery,
  valuesClause,
} from '../../grammar/sparql11/queryUnit/queryUnit.js';
import { update, update1 } from '../../grammar/sparql11/updateUnit/updateUnit.js';
import type { BaseQuadTerm } from '../../grammar/sparql12/sparql12Types';
import type {
  IriTerm,
  PropertyPath,
  Query,
  SparqlParser as ISparqlParser,
  SparqlQuery,
  Update,
} from '../../grammar/sparqlJsTypes';
import * as l from '../../lexer/sparql11/index.js';
import { sparql11Tokens } from '../../lexer/sparql11/index.js';
import { queryUnitParserBuilder } from './queryUnitParser.js';
import { updateParserBuilder } from './updateUnitParser.js';

// Create merge of
// ```
// Prologue
// ( SelectQuery | ConstructQuery | DescribeQuery | AskQuery )
// ValuesClause
// ```
// and:
// ```
// Prologue ( Update1 ( ';' Update )? )?
// ```
const queryOrUpdate: RuleDef<'queryOrUpdate', Query | Update | Pick<Update, 'base' | 'prefixes'>> = {
  name: 'queryOrUpdate',
  impl: ({ ACTION, SUBRULE, OR1, OR2, CONSUME, OPTION1, OPTION2, context }) => () => {
    const prologueValues = SUBRULE(prologue);
    return OR1<Query | Update | Pick<Update, 'base' | 'prefixes'>>([
      { ALT: () => {
        const queryType = OR2<Omit<Query, HandledByBase>>([
          { ALT: () => SUBRULE(selectQuery) },
          { ALT: () => SUBRULE(constructQuery) },
          { ALT: () => SUBRULE(describeQuery) },
          { ALT: () => SUBRULE(askQuery) },
        ]);
        // TODO: tackle variable scope of select: you can only fail on note 12 after parsing the whole query.
        //  As such, you can use the context entry skipValidation. (So you can test partial queries)
        const values = SUBRULE(valuesClause);
        return ACTION(() => (<Query>{
          ...prologueValues,
          ...queryType,
          type: 'query',
          ...(values && { values }),
        }));
      } },
      { ALT: () => {
        let result: Update | Pick<Update, 'base' | 'prefixes'> = prologueValues;
        OPTION1(() => {
          const updateOperation = SUBRULE(update1);

          ACTION(() => {
            for (const label of context.usedBlankNodeLabels) {
              context.flushedBlankNodeLabels.add(label);
            }
            context.usedBlankNodeLabels.clear();
          });

          const recursiveRes = OPTION2(() => {
            CONSUME(l.symbols.semi);
            return SUBRULE(update);
          });

          return ACTION(() => {
            const updateResult: Update = {
              ...result,
              type: 'update',
              updates: [ updateOperation ],
            };
            if (recursiveRes) {
              updateResult.updates.push(...recursiveRes.updates);
              updateResult.base = recursiveRes.base ?? result.base;
              updateResult.prefixes = recursiveRes.prefixes ?
                  { ...result.prefixes, ...recursiveRes.prefixes } :
                updateResult.prefixes;
            }
            result = updateResult;
          });
        });
        return result;
      } },
    ]);
  },
};

export const sparql11ParserBuilder = Builder.createBuilder(queryUnitParserBuilder)
  .merge(updateParserBuilder, <const> [])
  .deleteRule('queryUnit')
  .deleteRule('query')
  .deleteRule('updateUnit')
  .addRule(queryOrUpdate);

export class Sparql11Parser implements ISparqlParser {
  private readonly parser: {
    queryOrUpdate: (input: string) => SparqlQuery;
    path: (input: string) => PropertyPath | IriTerm;
  };

  private readonly dataFactory: DataFactory<BaseQuadTerm>;

  public constructor(context: Partial<ImplArgs['context']> = {}) {
    this.dataFactory = context.dataFactory ?? new DataFactory({ blankNodePrefix: 'g_' });
    this.parser = sparql11ParserBuilder.consumeToParser({
      tokenVocabulary: sparql11Tokens.build(),
    }, {
      ...context,
      dataFactory: this.dataFactory,
    });
  }

  public _resetBlanks(): void {
    this.dataFactory.resetBlankNodeCounter();
  }

  public parse(query: string): SparqlQuery {
    return this.parser.queryOrUpdate(query);
  }

  public parsePath(query: string): (PropertyPath & { prefixes: object }) | IriTerm {
    const result = this.parser.path(query);
    if ('type' in result) {
      return {
        ...result,
        prefixes: {},
      };
    }
    return result;
  }
}
