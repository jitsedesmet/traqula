import type { ILexerConfig, IParserConfig } from '@chevrotain/types';
import { Lexer } from 'chevrotain';
import type { EmbeddedActionsParser, TokenType, ParserMethod } from 'chevrotain';
import { DataFactory } from 'rdf-data-factory';
import type { Builder, ImplArgs } from '../grammar/parserBuilder';
import type { SparqlParser, SparqlQuery } from '../grammar/sparqlJSTypes';

class WrappedParser<T extends string> implements SparqlParser {
  private readonly lexer: Lexer;
  private readonly parser: EmbeddedActionsParser & { queryOrUpdate: ParserMethod<[], SparqlQuery> };
  private readonly dataFactory: DataFactory;

  public constructor(builder: Builder<T>, { tokenVocabulary, parserConfig = {}, lexerConfig = {}}: {
    tokenVocabulary: TokenType[];
    parserConfig?: IParserConfig;
    lexerConfig?: ILexerConfig;
  }, context: Partial<ImplArgs['context']> = {}) {
    this.lexer = new Lexer(tokenVocabulary, {
      positionTracking: 'onlyOffset',
      recoveryEnabled: false,
      skipValidations: true,
      ensureOptimizations: true,
      ...lexerConfig,
    });
    this.dataFactory = context.dataFactory ?? new DataFactory({ blankNodePrefix: 'g_' });
    this.parser = <EmbeddedActionsParser & { queryOrUpdate: ParserMethod<[], SparqlQuery> }> builder.consume({
      tokenVocabulary,
      config: parserConfig,
    }, {
      ...context,
      dataFactory: this.dataFactory,
    });
  }

  public parse(query: string): SparqlQuery {
    const lexResult = this.lexer.tokenize(query);
    this.parser.reset();
    this.parser.input = lexResult.tokens;
    return this.parser.queryOrUpdate();
  }

  public _resetBlanks(): void {
    this.dataFactory.resetBlankNodeCounter();
  }
}
