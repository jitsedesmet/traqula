import { DataFactory } from 'rdf-data-factory';
import { Builder } from '@traqula/core/lib/grammar-builder/parserBuilder';
import type { ImplArgs } from '@traqula/core/lib/grammar-builder/ruleDefTypes';
import { canCreateBlankNodes, canParseVars } from '@traqula/rules-sparql-1-1/lib/grammar';
import type {
  IriTerm,
  PropertyPath,
  SparqlParser as ISparqlParser,
  SparqlQuery,
} from '@traqula/rules-sparql-1-1/lib/grammar/Sparql11types';
import * as S12 from '@traqula/rules-sparql-1-2/lib/grammar/sparql12';
import { canParseReifier } from '@traqula/rules-sparql-1-2/lib/grammar/sparql12';
import type { BaseQuadTerm } from '@traqula/rules-sparql-1-2/lib/grammar/sparql12Types';
import { sparql12Tokens } from '@traqula/rules-sparql-1-2/lib/lexer';
import { sparql11ParserBuilder } from '../../engine-sparql-1-1/lib/Sparql11Parser';

export const sparql12ParserBuilder = Builder.createBuilder(sparql11ParserBuilder)
  .addMany(
    S12.reifiedTripleBlock,
    S12.reifiedTripleBlockPath,
    S12.reifier,
    S12.varOrReifierId,
    S12.annotation,
    S12.annotationPath,
    S12.annotationBlockPath,
    S12.annotationBlock,
    S12.reifiedTriple,
    S12.reifiedTripleSubject,
    S12.reifiedTripleObject,
    S12.tripleTerm,
    S12.tripleTermSubject,
    S12.tripleTermObject,
    S12.tripleTermData,
    S12.tripleTermDataSubject,
    S12.tripleTermDataObject,
    S12.exprTripleTerm,
    S12.exprTripleTermSubject,
    S12.exprTripleTermObject,
    S12.builtinLangDir,
    S12.builtinLangStrDir,
    S12.builtinHasLang,
    S12.builtinHasLangDir,
    S12.builtinIsTriple,
    S12.builtinTriple,
    S12.builtinSubject,
    S12.builtinPredicate,
    S12.builtinObject,
  )
  .patchRule(S12.dataBlockValue)
  .patchRule(S12.triplesSameSubject)
  .patchRule(S12.triplesSameSubjectPath)
  .patchRule(S12.object)
  .patchRule(S12.objectPath)
  .patchRule(S12.graphNode)
  .patchRule(S12.graphNodePath)
  .patchRule(S12.varOrTerm)
  .patchRule(S12.primaryExpression)
  .patchRule(S12.builtInCall)
  .patchRule(S12.rdfLiteral);

export class Sparql12Parser implements ISparqlParser {
  private readonly parser: {
    queryOrUpdate: (input: string) => SparqlQuery;
    path: (input: string) => PropertyPath | IriTerm;
  };

  private readonly dataFactory: DataFactory<BaseQuadTerm>;

  public constructor(context: Partial<ImplArgs['context']> = {}) {
    this.dataFactory = context.dataFactory ?? new DataFactory({ blankNodePrefix: 'g_' });
    this.parser = sparql12ParserBuilder.consumeToParser({
      tokenVocabulary: sparql12Tokens.build(),
    }, {
      parseMode: new Set([ canParseVars, canCreateBlankNodes, canParseReifier ]),
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
