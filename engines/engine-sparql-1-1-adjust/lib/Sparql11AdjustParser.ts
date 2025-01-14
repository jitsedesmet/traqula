import {Builder, type ImplArgs} from '@traqula/core';
import {gram, lex} from '@traqula/rules-sparql-1-1-adjust';
import {
  Expression,
  gram as g11,
  lex as l11,
  IriTerm,
  PropertyPath,
  SparqlParser as ISparqlParser,
  SparqlQuery
} from '@traqula/rules-sparql-1-1';
import {sparql11ParserBuilder} from '@traqula/engine-sparql-1-1';
import {DataFactory} from "rdf-data-factory";
import type * as RDF from "@rdfjs/types";

const builtInPatch: typeof g11.builtInCall = {
  name: 'builtInCall',
  impl: ({ SUBRULE, OR }) => () => OR<Expression>([
    { ALT: () => SUBRULE(gram.builtInAdjust) },
    { ALT: () => SUBRULE(gram.existingBuildInCall) },
  ]),
};

export const adjustBuilder = Builder.createBuilder(sparql11ParserBuilder)
  .addRule(gram.builtInAdjust)
  .addRule(gram.existingBuildInCall)
  .patchRule(builtInPatch);

export class Sparql11AdjustParser implements ISparqlParser {
  private readonly parser: {
    queryOrUpdate: (input: string) => SparqlQuery;
    path: (input: string) => PropertyPath | IriTerm;
  };

  private readonly dataFactory: DataFactory<RDF.BaseQuad>;

  public constructor(context: Partial<ImplArgs['context']> = {}) {
    this.dataFactory = context.dataFactory ?? new DataFactory({ blankNodePrefix: 'g_' });
    this.parser = adjustBuilder.consumeToParser({
      tokenVocabulary: l11.sparql11Tokens.addBefore(l11.a, lex.BuiltInAdjust).build(),
    }, {
      parseMode: new Set([ g11.canParseVars, g11.canCreateBlankNodes ]),
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